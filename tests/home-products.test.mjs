import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const catalog=JSON.parse(fs.readFileSync('data/catalog.json'));
const app=fs.readFileSync('src/app.js','utf8');
function fixture(mobile=false){
 let doc;
 const node=(dataset={},isLink=false)=>({dataset,hidden:false,value:'',textContent:'',children:[],attrs:{},listeners:{},addEventListener(type,fn){(this.listeners[type]??=new Set()).add(fn)},removeEventListener(type,fn){this.listeners[type]?.delete(fn)},fire(type,event={}){for(const fn of this.listeners[type]||[])fn({target:this,preventDefault(){},...event})},setAttribute(k,v){this.attrs[k]=v},contains(target){return target===this||this.children.some(c=>c.contains(target))},closest(selector){return selector==='a'&&isLink?this:null},focus(){this.focused=true;doc.activeElement=this}});
 doc=node();const ids=Object.fromEntries(['home-product-search','home-product-directory','home-featured-products','home-product-results','home-no-results','home-result-count','home-search-clear'].map(id=>[id,node()]));
 const groups=catalog.categories.filter(c=>['Banners','Labels & stickers','Signs & displays','Menus & counters'].includes(c.name)).map(c=>{const g=node();g.button=node();g.panel=node();g.panel.links=c.links.map(l=>node({homeLink:l.slug},true));g.panel.children=g.panel.links;g.children=[g.button,g.panel];return g});ids['home-product-directory'].children=groups;
 const cards=catalog.products.filter(p=>!p.customOnly).map(p=>node({homeProduct:p.id}));
 const media={...node(),matches:mobile,change(value){this.matches=value;this.fire('change')}};let timerId=0;const timers=new Map();
 const ctx={document:doc,Q:{catalog,product:id=>catalog.products.find(p=>p.id===id)},matchMedia:()=>media,setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id),$: (s,root)=>s==='.home-category-trigger'?root.button:s==='.home-product-flyout'?root.panel:ids[s.slice(1)],$$:(s,root)=>s==='[data-home-group]'?groups:s==='[data-home-product]'?cards:s==='a'?root.links:[]};
 vm.runInNewContext(app.slice(app.indexOf('let destroyHomeProducts='),app.indexOf('function initCatalog()'))+';this.start=initHomeProducts;',ctx);ctx.start();
 return {ids,groups,cards,media,ctx,doc,timers,search:value=>{ids['home-product-search'].value=value;ids['home-product-search'].fire('input')},visible:()=>cards.filter(c=>!c.hidden).map(c=>c.dataset.homeProduct)};
}
test('homepage has curated alphabetical shortcuts, compact tiles, updated copy and mobile menu exclusion',()=>{
 const html=fs.readFileSync('dist/index.html','utf8'),directory=html.match(/<nav class="home-product-directory"[\s\S]*?<\/nav>/)[0];
 assert.match(directory,/>Popular Products<\/h3>/);
 assert.equal((directory.match(/data-home-link=/g)||[]).length,28);
 for(const match of directory.matchAll(/href="(\/products\/[^"?]+)(?:\?[^" ]*)?"/g))assert.ok(fs.existsSync('dist'+match[1]+'index.html'),match[1]);
 const names=[...directory.matchAll(/class="home-(?:category-trigger|popular-link)"[^>]*>([^<]+)</g)].map(m=>m[1]);
 assert.equal(names.length,16);assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'en')));
 for(const name of ['Business cards','Brochures','Postcards','Roll labels','Counter mats'])assert.ok(names.includes(name));
 assert.ok(!names.includes('Business essentials'));assert.match(directory,/class="home-all-products" href="\/products\/"/);
 const featured=html.match(/id="home-featured-products">([\s\S]*?)<div class="product-grid home-result-grid"/)[1];
 assert.equal((featured.match(/class="product-card"/g)||[]).length,6);
 assert.match(html,/<h1>Great print,<br><span>No exceptions\.<\/span><\/h1>/);
 for(const text of ['Printing for the way you do business. From everyday essentials to nationwide campaigns, we’ve got you covered.','Four decades of expertise. Serving businesses nationwide.','In good hands.<br><strong>Brands that trust us.</strong>','Every piece has a purpose.','Your printing,<br>handled with care.','Great printing starts with understanding your business.'])assert.ok(html.includes(text),text);
 assert.equal((html.match(/data-home-product=/g)||[]).length,30);assert.match(html,/id="home-product-search"[^>]*type="search"/);
 const css=fs.readFileSync('src/home-products.css','utf8');assert.match(css,/@media\(max-width:760px\)\{[\s\S]*\.home-product-directory\{display:none!important\}/);
 assert.ok(!css.includes('@media(max-width:380px)'));assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);assert.match(css,/align-items:stretch/);
});
test('full-catalog homepage search and clear work while directory flyouts stay closed',()=>{
 const f=fixture(),n=f.ids;assert.equal(n['home-featured-products'].hidden,false);assert.equal(n['home-product-results'].hidden,true);
 f.search(' BUSINESS cards ');assert.ok(f.visible().includes('business-cards'));assert.ok(!f.visible().includes('counter-mats'));assert.equal(n['home-product-results'].hidden,false);
 f.search('kiss-cut');assert.ok(f.visible().includes('stickers'));f.search('no-such-product-xyz');assert.equal(n['home-no-results'].hidden,false);assert.equal(n['home-result-count'].textContent,'0 products');
 n['home-search-clear'].fire('click');assert.equal(n['home-product-search'].value,'');assert.ok(n['home-product-search'].focused);assert.equal(n['home-featured-products'].hidden,false);assert.equal(n['home-no-results'].hidden,true);assert.ok(f.groups.every(g=>g.panel.hidden));
});
test('flyouts support hover, single-open behavior, delayed close, keyboard and outside dismissal',()=>{
 const f=fixture(),[a,b]=f.groups;a.fire('pointerenter',{pointerType:'mouse'});assert.equal(a.panel.hidden,false);assert.equal(a.button.attrs['aria-expanded'],'true');
 a.fire('pointerleave',{pointerType:'mouse'});assert.equal(f.timers.size,1);b.fire('pointerenter',{pointerType:'mouse'});assert.equal(a.panel.hidden,true);assert.equal(b.panel.hidden,false);assert.equal(f.timers.size,0);
 b.fire('keydown',{target:b.button,key:'ArrowRight'});assert.ok(b.panel.links[0].focused);b.fire('keydown',{target:b.panel.links[0],key:'ArrowDown'});assert.ok(b.panel.links[1].focused);
 b.fire('keydown',{target:b.panel.links[1],key:'Escape'});assert.equal(b.panel.hidden,true);assert.ok(b.button.focused);
 a.button.fire('click');assert.equal(a.panel.hidden,false);f.doc.fire('click',{target:{closest:()=>null}});assert.equal(a.panel.hidden,true);
 a.button.fire('click');f.doc.fire('focusin',{target:f.ids['home-product-search']});assert.equal(a.panel.hidden,true);
 a.fire('pointerenter',{pointerType:'mouse'});a.fire('pointerleave',{pointerType:'mouse'});[...f.timers.values()][0]();assert.equal(a.panel.hidden,true);
});
test('mobile hides flyouts while preserving search and resize cleanup',()=>{
 const f=fixture(true),g=f.groups[0];g.button.fire('click');assert.ok(g.panel.hidden);f.search('business cards');assert.ok(f.visible().includes('business-cards'));f.ids['home-search-clear'].fire('click');assert.equal(f.ids['home-featured-products'].hidden,false);
 f.media.change(false);g.button.fire('click');assert.equal(g.panel.hidden,false);g.button.focus();f.media.change(true);assert.ok(g.panel.hidden);assert.ok(f.ids['home-product-search'].focused);
 f.ctx.start();assert.equal(f.media.listeners.change.size,1);assert.equal(f.doc.listeners.click.size,1);
});
