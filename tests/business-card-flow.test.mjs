import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import engine from '../lib/engine.js';
import {icons} from '../src/icons.mjs';

// Exercise the actual product controller with a small event/element fixture.
// This checks controller behavior, not browser layout or native form validity.
function fixture(productId='business-cards',finePointer=false) {
  class Element {
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.dataset={};this.value='';this.checked=false;this.hidden=false;this.disabled=false;}
    append(...items){this.children.push(...items);}
    replaceChildren(...items){this.children=items;}
    addEventListener(name,fn){this.listeners[name]=fn;}
    fire(name,event={}){this.listeners[name]?.({target:this,preventDefault(){},...event});}
    contains(target){return target===this||this.children.some(child=>child.contains(target));}
    setAttribute(key,value){this[key]=value;}
    focus(){this.focused=true;}
    blur(){this.blurred=true;this.focused=false;}
    showModal(){this.open=true;}
  }
  const ids=['product-form','config-fields','quantity-fields','version-breakdown','quantity-help','item-note','already-buying','buying-fields','buying-details','supplier','current-price','buying-notes','add-to-quote','product-error','added-title','added-description','added-dialog'];
  const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
  nodes['product-form'].dataset.product=productId;
  for(const id of ['supplier','current-price','buying-notes'])nodes[id].tagName=id==='buying-notes'?'TEXTAREA':'INPUT';
  nodes['buying-fields'].append(nodes.supplier,nodes['current-price'],nodes['buying-notes']);
  const descendants=e=>e.children.flatMap(c=>[c,...descendants(c)]);
  const all=()=>Object.values(nodes).flatMap(e=>[e,...descendants(e)]);
  const $=selector=>nodes[selector.slice(1)]||all().find(e=>e.id===selector.slice(1));
  const $$=(selector,root)=>selector==='[data-spec]'?all().filter(e=>e.dataset.spec):descendants(root).filter(e=>['INPUT','TEXTAREA'].includes(e.tagName));
  let items=[],edit='',serial=0;
  const ctx={matchMedia:()=>({matches:finePointer}),icon:name=>icons[name],Q:engine,$,$$,document:{createElement:tag=>new Element(tag)},route:()=>new URL('https://example.invalid/?edit='+edit),cart:()=>items,saveCart:v=>{items=v;},uid:()=>`review-${++serial}`,error:(el,message)=>{el.textContent=message;},quantityText:(item)=>`${item.quantity} pieces`};
  const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  vm.runInNewContext(app.slice(app.indexOf('function initProduct()'),app.indexOf('function buyingHTML('))+';this.start=initProduct;',ctx);
  const field=label=>all().find(e=>e.dataset.spec===label);
  const choose=(label,value)=>{const button=all().find(e=>e.dataset.spec===label&&e.dataset.value===value);if(button){button.fire('click');return;}const el=field(label);el.value=value;el.fire('change');};
  const quantity=value=>{let el=$('#custom-quantity')||all().find(e=>e.dataset.versionQuantity==='0');if(!el){const select=$('#quantity-select');select.value='custom';select.fire('change');el=$('#custom-quantity');}el.value=String(value);el.fire('input');};
  const versions=value=>{const el=$('#artwork-versions');el.value=String(value);el.fire('input');el.fire('change');};
  const version=(i,quantity,name)=>{const q=all().find(e=>e.dataset.versionQuantity===String(i));q.value=String(quantity);q.fire('input');const n=all().find(e=>e.dataset.versionName===String(i));n.value=name;n.fire('input');};
  ctx.start();
  return {nodes,field,choose,quantity,versions,version,elements:all,find:$,submit:()=>nodes['product-form'].fire('submit'),items:()=>items,edit:()=>{edit=items[0].id;ctx.start();}};
}

test('laminated menu controller renders paper stock and preserves 16PT through add and edit',()=>{
 const f=fixture('laminated-menus');assert.ok(f.field('Paper stock'));
 assert.deepEqual(f.field('Paper stock').children.map(o=>o.value),['14PT Coated 2 Sides','16PT Coated 2 Sides']);
 f.choose('Paper stock','16PT Coated 2 Sides');f.submit();assert.equal(f.items()[0].choices['Paper stock'],'16PT Coated 2 Sides');
 f.edit();assert.equal(f.field('Paper stock').value,'16PT Coated 2 Sides');
});

test('business card finish changes clear inactive foil details and preserve quantity/versions',()=>{
  const f=fixture();f.quantity(500);f.versions(3);
  f.choose('Paper','16 pt. Premium Matte Cover');f.choose('Raised Print','Raised Foil Print Front');f.choose('Foil color','Rose Gold');
  f.submit();assert.equal(f.items()[0].choices['Foil color'],'Rose Gold');assert.equal(f.items()[0].choices.Versions,'3');
  f.choose('Paper','14 pt. Uncoated Cover');assert.equal(f.field('Raised Print'),undefined);assert.equal(f.field('Foil color'),undefined);
  f.submit();assert.equal(f.items()[1].quantity,1500);assert.ok(!('Foil color' in f.items()[1].choices));
});

test('business card add/edit retains notes and updates one cart item; inactive buying inputs are disabled',()=>{
  const f=fixture();assert.equal(f.nodes['current-price'].disabled,true);
  f.quantity(750);f.versions(2);f.version(0,750,'Front desk');f.version(1,250,'Sales');f.nodes['item-note'].value='Two staff names';
  f.nodes['already-buying'].checked=true;f.nodes['already-buying'].fire('change');assert.equal(f.nodes['current-price'].disabled,false);
  f.nodes.supplier.value='Example supplier';f.nodes['current-price'].value='140.50';f.submit();
  assert.equal(f.items().length,1);assert.equal(f.items()[0].note,'Two staff names');assert.equal(f.items()[0].currentPrice,'140.50');assert.equal(f.nodes['added-dialog'].open,true);
  f.edit();assert.equal(f.nodes['item-note'].value,'Two staff names');assert.equal(f.nodes.supplier.value,'Example supplier');
  f.quantity(1000);f.nodes['current-price'].value='-1';f.nodes['already-buying'].checked=false;f.nodes['already-buying'].fire('change');
  assert.equal(f.nodes['current-price'].disabled,true);f.submit();
  assert.equal(f.items().length,1);assert.equal(f.items()[0].quantity,1250);assert.equal(f.items()[0].artworkVersions[1].name,'Sales');assert.equal(f.items()[0].artworkVersions[1].quantity,250);assert.equal(f.items()[0].choices.Versions,'2');assert.equal(f.items()[0].supplier,'');assert.equal(f.items()[0].currentPrice,'');
});

test('business card controller rejects zero quantity and nonwhole artwork versions',()=>{
  const f=fixture();f.quantity(0);f.submit();assert.equal(f.items().length,0);assert.match(f.nodes['product-error'].textContent,/quantity/);
  f.quantity(500);f.versions(1.5);f.submit();assert.equal(f.items().length,0);assert.match(f.nodes['product-error'].textContent,/Versions/);
});

test('roll-label shape controls and custom dimensions carry through an unequal-version quote',()=>{
 const f=fixture('roll-labels');f.choose('Shape','Custom Cut');
 for(const [label,value] of [['Width (in)','2.5'],['Height (in)','3.5']]){const el=f.field(label);el.value=value;el.fire('input');}
 f.choose('Material','Clear Gloss BOPP');f.quantity(250);f.versions(2);f.version(0,250,'Lemon');f.version(1,750,'Lime');f.submit();
 assert.equal(f.items().length,1);assert.equal(f.items()[0].quantity,1000);assert.equal(f.items()[0].choices.Shape,'Custom Cut');assert.equal(f.items()[0].choices['Width (in)'],'2.5');assert.equal(f.items()[0].choices.Liner,'Clear 1.2Mil PET Liner');assert.ok(!('Round corners' in f.items()[0].choices));
 f.edit();assert.equal(f.field('Width (in)').value,'2.5');f.version(1,1000,'Lime revised');f.submit();assert.equal(f.items().length,1);assert.equal(f.items()[0].quantity,1250);assert.equal(f.items()[0].artworkVersions[1].name,'Lime revised');
});

test('reducing versions preserves the first custom quantity',()=>{const f=fixture('roll-labels');f.versions(2);f.version(0,375,'Small run');f.version(1,625,'Large run');f.versions(1);f.submit();assert.equal(f.items()[0].quantity,375);assert.equal(f.items()[0].artworkVersions[0].name,'Small run');});


test('fixed quantity controller has no custom or version input and submits one selected run',()=>{
 for(const id of ['notepads','table-tents','greeting-cards','bulk-posters','booklets-catalogs','laminated-menus']){
  const f=fixture(id),select=f.find('#quantity-select');assert.ok(select,id);assert.ok(select.children.every(o=>o.value!=='custom'),id);assert.equal(f.find('#artwork-versions'),undefined,id);assert.equal(f.find('#custom-quantity'),undefined,id);
  select.value=select.children[0].value;select.fire('change');f.submit();assert.equal(f.items().length,1,id+': '+f.nodes['product-error'].textContent);assert.ok(!('Versions' in f.items()[0].choices));f.edit();assert.equal(f.find('#custom-quantity'),undefined,id);
 }
});


test('native product selects blur and do not refocus on touch devices after changing',()=>{
 const f=fixture('laminated-menus'),before=f.field('Paper stock');f.choose('Paper stock','16PT Coated 2 Sides');assert.equal(before.blurred,true);assert.ok(!f.field('Paper stock').focused);assert.equal(f.field('Paper stock').value,'16PT Coated 2 Sides');
 const desktop=fixture('laminated-menus',true);desktop.choose('Paper stock','16PT Coated 2 Sides');assert.equal(desktop.field('Paper stock').focused,true);
});
test('foil color menu closes after selection and persists finishes through quote editing',()=>{
 const f=fixture('roll-labels',true);f.choose('Foil Stamping','3D Foil Stamping');f.choose('Foil color','Holographic');f.choose('Spot UV Varnish','2D+3D Spot UV Varnish');assert.equal(f.field('Foil color').tagName,'SUMMARY');assert.equal(f.field('Foil color').value,'Holographic');f.submit();assert.equal(f.items()[0].choices['Foil Stamping'],'3D Foil Stamping');f.edit();assert.equal(f.field('Foil color').value,'Holographic');f.choose('Foil Stamping','No');assert.equal(f.field('Foil color'),undefined);f.submit();assert.equal(f.items()[0].choices['Foil Stamping'],'No');assert.ok(!('Foil color' in f.items()[0].choices));
});


test('touch blur before a foil-color click does not close the menu or lose the tapped color',()=>{
 for(const color of ['Silver','Rose Gold','Blue','Red','Holographic']){
  const f=fixture('roll-labels',true);f.choose('Foil Stamping','2D Foil Stamping');
  const dropdown=f.elements().find(e=>e.className==='color-dropdown');dropdown.open=true;
  dropdown.fire('focusout',{relatedTarget:null});assert.equal(dropdown.open,true,'menu must stay open for the pending tap');
  f.choose('Foil color',color);assert.equal(dropdown.open,false);assert.equal(f.field('Foil color').value,color);
  assert.ok(!f.elements().find(e=>e.className==='color-dropdown').open);f.submit();assert.equal(f.items()[0].choices['Foil color'],color);
 }
});
test('foil-color menu still closes for keyboard focus moving outside',()=>{
 const f=fixture('roll-labels',true);f.choose('Foil Stamping','3D Foil Stamping');const dropdown=f.elements().find(e=>e.className==='color-dropdown');dropdown.open=true;dropdown.fire('focusout',{relatedTarget:f.nodes['item-note']});assert.equal(dropdown.open,false);
});


test('touch foil colors use a stable native picker and preserve every color through add/edit',()=>{
 for(const finish of ['2D Foil Stamping','3D Foil Stamping'])for(const color of ['Gold','Silver','Rose Gold','Blue','Red','Holographic']){
  const f=fixture('roll-labels');f.choose('Foil Stamping',finish);const select=f.field('Foil color');assert.equal(select.tagName,'SELECT');assert.ok(!f.elements().some(e=>e.className==='color-dropdown'));
  f.choose('Foil color',color);assert.equal(f.field('Foil color'),select,'the OS picker must not be replaced on change');assert.equal(select.value,color);assert.equal(select.blurred,true);
  f.submit();assert.equal(f.items()[0].choices['Foil color'],color);f.edit();assert.equal(f.field('Foil color').value,color);
 }
});
