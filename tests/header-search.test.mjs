import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import Q from '../lib/engine.js';
import {header} from '../src/templates.mjs';
const app=fs.readFileSync('src/app.js','utf8');
const matching=app.slice(app.indexOf('function normalizeProductSearch'),app.indexOf('let destroyHomeProducts='));
function fixture(mobile=false,offline=false){
 let doc;let timerId=0;const timers=new Map();
 const node=(tag='div')=>({tag,children:[],parent:null,hidden:false,value:'',textContent:'',dataset:{},attrs:{},listeners:{},classes:new Set(),
 add(...children){for(const c of children){c.parent=this;this.children.push(c)}},
 addEventListener(k,f){(this.listeners[k]??=[]).push(f)},
 fire(k,e={}){for(const f of this.listeners[k]||[])f({target:this,preventDefault(){},stopPropagation(){},...e})},
 setAttribute(k,v){this.attrs[k]=v},contains(el){return this===el||this.children.some(c=>c.contains(el))},
 closest(selector){if(selector==='a')return this.tag==='a'?this:this.parent?.closest(selector);if(selector==='[hidden]')return this.hidden?this:this.parent?.closest(selector);return null},
 focus(){if(doc.activeElement!==this){doc.activeElement=this;this.fire('focus');doc.fire('focusin',{target:this})}},
 set innerHTML(html){this.html=html;for(const child of this.children)child.parent=null;this.children=[];if(html.startsWith('<svg'))this.add(node('svg'));for(const m of html.matchAll(/<a href="([^"]+)"/g)){const a=node('a');a.href=m[1];this.add(a)}},get innerHTML(){return this.html||''},
 get classList(){const own=this;return {add:c=>own.classes.add(c),remove:c=>own.classes.delete(c),contains:c=>own.classes.has(c)}}});
 doc=node();const ids=Object.fromEntries(['header-search','header-search-form','header-search-input','header-search-toggle','header-search-results','header-search-list','header-search-status','header-search-all','header-search-empty','header-search-clear'].map(k=>[k,node()]));
 const wrap=ids['header-search'],panel=ids['header-search-results'],input=ids['header-search-input'],toggle=ids['header-search-toggle'];
 ids['header-search-all'].tag='a';const custom=node('a');custom.href='/custom-printing/';ids['header-search-empty'].add(custom);
 wrap.add(ids['header-search-form'],panel);ids['header-search-form'].add(input,ids['header-search-clear']);panel.add(ids['header-search-status'],ids['header-search-list'],ids['header-search-empty'],ids['header-search-all']);panel.hidden=true;
 const descendants=r=>r.children.flatMap(c=>[c,...descendants(c)]);
 const media={...node(),matches:mobile};let assigned,rendered=0;const menus=[];
 const ctx={setTimeout:f=>{timers.set(++timerId,f);return timerId},clearTimeout:id=>timers.delete(id),Q,window:{QXP_OFFLINE:offline},location:{hash:'',assign:url=>assigned=url},document:doc,matchMedia:()=>media,icon:name=>'<svg data-icon="'+name+'"></svg>',productURL:p=>'/products/'+p.id+'/',esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),menu:v=>menus.push(['products',v]),industryMenu:v=>menus.push(['industries',v]),renderOffline:()=>rendered++,$:(s,r)=>s==='a'?descendants(r).find(n=>n.tag==='a'):ids[s.slice(1)],$$:(s,r)=>descendants(r).filter(n=>n.tag==='a')};
 vm.runInNewContext(matching+';bindHeaderSearch();this.search=searchProducts;this.close=closeHeaderSearch;',ctx);
 return {ids,ctx,doc,media,menus,input,wrap,toggle,panel,node,flushTimers:()=>{const queued=[...timers.values()];timers.clear();queued.forEach(f=>f())},clickIcon:()=>{const target=toggle.children[0],path=[target,toggle,doc];toggle.fire('click',{target,composedPath:()=>path});doc.fire('click',{target,composedPath:()=>path});},assigned:()=>assigned,rendered:()=>rendered,type:value=>{input.value=value;input.fire('input')},links:()=>ids['header-search-list'].children};
}
test('header search finds catalog names, material terms and sticker aliases safely',()=>{
 const f=fixture();assert.equal(f.ctx.search('').length,30);
 for(const term of ['business cards',' BUSINESS-CARDS '])assert.equal(f.ctx.search(term)[0].id,'business-cards');
 assert.ok(f.ctx.search('kiss-cut').some(p=>p.id==='stickers'));assert.ok(f.ctx.search('matte labels').some(p=>p.id==='roll-labels'));
 assert.equal(f.ctx.search('nonexistentxyz').length,0);
 f.type('"<script>');assert.ok(!f.ids['header-search-list'].innerHTML.includes('<script>'));assert.ok(f.ids['header-search-all'].href.includes('%3Cscript%3E'));
});
test('desktop search opens suggestions, supports keyboard navigation, clearing and dismissal',()=>{
 const f=fixture();assert.equal(f.wrap.hidden,true);f.toggle.fire('click');assert.equal(f.wrap.hidden,false);assert.equal(f.toggle.attrs['aria-expanded'],'true');assert.equal(f.panel.hidden,false);assert.equal(f.links().length,4);assert.ok(f.menus.every(([,open])=>open===false));
 f.type('business cards');assert.equal(f.links()[0].href,'/products/business-cards/');f.type('kiss-cut');
 f.wrap.fire('keydown',{target:f.input,key:'ArrowDown'});assert.equal(f.doc.activeElement,f.links()[0]);
 f.wrap.fire('keydown',{target:f.links()[0],key:'ArrowDown'});assert.equal(f.doc.activeElement,f.ids['header-search-all']);
 f.wrap.fire('keydown',{key:'Escape'});assert.equal(f.panel.hidden,true);assert.equal(f.wrap.hidden,true);assert.equal(f.doc.activeElement,f.toggle);
 f.type('zzzznone');assert.equal(f.ids['header-search-empty'].hidden,false);f.ids['header-search-clear'].fire('click');assert.equal(f.input.value,'');assert.equal(f.links().length,4);
 f.doc.fire('click',{target:f.node()});assert.equal(f.panel.hidden,true);
 f.type('brochure');f.doc.fire('focusin',{target:f.node()});assert.equal(f.panel.hidden,true);
});
test('mobile search toggles, closes on Escape and handles resizing and menu dismissal',()=>{
 const f=fixture(true);f.toggle.fire('click');assert.equal(f.toggle.attrs['aria-expanded'],'true');assert.ok(f.wrap.classList.contains('is-open'));assert.equal(f.doc.activeElement,f.input);
 f.wrap.fire('keydown',{key:'Escape'});assert.equal(f.toggle.attrs['aria-expanded'],'false');assert.equal(f.doc.activeElement,f.toggle);
 f.toggle.fire('click');f.media.matches=false;f.media.fire('change');assert.equal(f.toggle.attrs['aria-expanded'],'true');assert.equal(f.doc.activeElement,f.input);
 f.media.matches=true;f.media.fire('change');assert.equal(f.panel.hidden,false);assert.equal(f.doc.activeElement,f.input);
 f.ctx.close();assert.equal(f.panel.hidden,true);assert.ok(!f.wrap.classList.contains('is-open'));
});
test('search submits encoded queries on live and portable pages',()=>{
 const live=fixture();live.type('labels & stickers');live.ids['header-search-form'].fire('submit');assert.equal(live.assigned(),'/products/?q=labels%20%26%20stickers');assert.equal(live.panel.hidden,true);
 const offline=fixture(true,true);offline.type('roll labels');offline.ids['header-search-form'].fire('submit');assert.equal(offline.ctx.location.hash,'#/products/?q=roll%20labels');offline.ids['header-search-form'].fire('submit');assert.equal(offline.rendered(),1);
 offline.input.value='';offline.ids['header-search-form'].fire('submit');assert.equal(offline.ctx.location.hash,'#/products/');
});
test('catalog reads header query and keeps category filters working',()=>{
 const ids={'product-search':{value:'',addEventListener(){}},'result-count':{},'no-results':{}},cards=Q.catalog.products.filter(p=>!p.customOnly).map(p=>({dataset:{catalogProduct:p.id}})),buttons=[{dataset:{category:'all'},setAttribute(){},addEventListener(k,f){this.click=f}},{dataset:{category:'Labels & stickers'},setAttribute(){},addEventListener(k,f){this.click=f}}];
 const ctx={Q,route:()=>new URL('https://quixprint.com/products/?q=kiss-cut'),$:s=>ids[s.slice(1)],$$:s=>s==='[data-catalog-product]'?cards:buttons};
 const logic=matching.slice(0,matching.indexOf('let closeHeaderSearch='))+app.slice(app.indexOf('function initCatalog()'),app.indexOf('function specificationRows'));
 vm.runInNewContext(logic+'initCatalog();',ctx);assert.equal(ids['product-search'].value,'kiss-cut');assert.deepEqual(cards.filter(c=>!c.hidden).map(c=>c.dataset.catalogProduct),['stickers']);buttons[1].click();assert.equal(ids['result-count'].textContent,'1 product');
});
test('shared header contains one accessible search form and responsive controls',()=>{
 const html=header(Q.catalog,true);assert.equal((html.match(/id="header-search-input"/g)||[]).length,1);assert.match(html,/role="search" action="\/products\/" method="get"/);assert.match(html,/name="q" type="search"/);assert.match(html,/aria-controls="header-search"/);
 const css=fs.readFileSync('src/header-search.css','utf8');assert.ok(css.includes('@media(max-width:900px)'));assert.ok(css.includes('.header-search.is-open{display:block}'));assert.ok(css.includes('font-size:16px'));assert.match(css,/\.header-search \.sr-only\{[^}]*position:absolute[^}]*clip-path:inset\(50%\)/);assert.ok(css.includes('flex:1 1 0%;width:0;min-width:0'));assert.match(html,/id="header-search" hidden/);
 const built=fs.readFileSync('dist/index.html','utf8');assert.ok(built.includes('header-search-input'));assert.ok(fs.readFileSync('dist/assets/qxp.css','utf8').includes('.header-search-results'));
});

test('clicking the actual SVG keeps search open after its icon is replaced and the click bubbles',()=>{
 for(const mobile of [false,true]){const f=fixture(mobile);f.clickIcon();assert.equal(f.wrap.hidden,false);assert.equal(f.doc.activeElement,f.input);f.clickIcon();assert.equal(f.wrap.hidden,true);}
});
test('mouse hover opens search, crossing into the panel keeps it open, and typing keeps it open',()=>{
 const f=fixture();f.toggle.fire('pointerenter',{pointerType:'mouse'});assert.equal(f.wrap.hidden,false);assert.notEqual(f.doc.activeElement,f.input);
 f.toggle.fire('pointerleave',{pointerType:'mouse'});f.wrap.fire('pointerenter',{pointerType:'mouse'});f.flushTimers();assert.equal(f.wrap.hidden,false);
 f.wrap.fire('pointerleave',{pointerType:'mouse'});f.flushTimers();assert.equal(f.wrap.hidden,true);
 f.toggle.fire('pointerenter',{pointerType:'mouse'});f.clickIcon();assert.equal(f.wrap.hidden,false);assert.equal(f.doc.activeElement,f.input);
 f.type('brochures');f.wrap.fire('pointerleave',{pointerType:'mouse'});f.flushTimers();assert.equal(f.wrap.hidden,false);assert.equal(f.links()[0].href,'/products/brochures/');
 f.wrap.fire('keydown',{key:'Escape'});assert.equal(f.wrap.hidden,true);
});
test('touch does not hover open; keyboard ArrowDown opens and focuses the search',()=>{
 const f=fixture(true);f.toggle.fire('pointerenter',{pointerType:'touch'});assert.equal(f.wrap.hidden,true);f.clickIcon();assert.equal(f.wrap.hidden,false);
 f.ctx.close();f.toggle.fire('keydown',{key:'ArrowDown'});assert.equal(f.wrap.hidden,false);assert.equal(f.doc.activeElement,f.input);
 f.ctx.close();f.toggle.fire('pointerenter',{pointerType:'mouse'});f.toggle.fire('pointerleave',{pointerType:'mouse'});f.toggle.fire('keydown',{key:'Escape'});f.flushTimers();assert.equal(f.wrap.hidden,true);
});
