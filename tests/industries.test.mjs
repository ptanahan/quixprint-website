import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {industryURL} from '../src/industries.mjs';
const industries=JSON.parse(fs.readFileSync('data/industries.json'));
const catalog=JSON.parse(fs.readFileSync('data/catalog.json'));
const app=fs.readFileSync('src/app.js','utf8');
const read=route=>fs.readFileSync('dist'+route+'index.html','utf8');
test('twelve industry pages and hub have real routes, product selections, metadata and sitemap entries',()=>{
 assert.equal(industries.length,12);
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8'),titles=new Set(),descriptions=new Set();
 for(const i of industries){
  const route=industryURL(i),html=read(route);titles.add(i.title);descriptions.add(i.description);
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.ok(sitemap.includes('<loc>https://quixprint.com'+route+'</loc>'));
  assert.ok(html.includes('<link rel="canonical" href="https://quixprint.com'+route+'">'));
  assert.match(html,new RegExp('og:image" content="https://quixprint.com/assets/products/industry-'+i.slug+'-1536.webp'));
  assert.equal(i.products.length,6);
  for(const [id] of i.products){assert.ok(catalog.products.some(p=>p.id===id));assert.ok(html.includes('data-industry-product="'+id+'"'));assert.ok(fs.existsSync('dist/products/'+id+'/index.html'));}
  assert.match(html,/One project. Ongoing printing./);assert.match(html,/No payment required/);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.about['@type'],'Service');assert.equal(schema.breadcrumb.itemListElement[1].item,'https://quixprint.com'+route);
 }
 assert.equal(titles.size,12);assert.equal(descriptions.size,12);
 assert.ok(sitemap.includes('<loc>https://quixprint.com/industries/</loc>'));
 assert.ok(read('/industries/').includes('Your kind of print.'));
});
test('industry links, anchors, responsive image sources and custom quote prefill targets exist',()=>{
 for(const route of ['/industries/',...industries.map(industryURL)]){
  const html=read(route),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,route+' duplicate IDs');
  for(const [,value] of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)){
   const u=new URL(value.replaceAll('&amp;','&'),'https://quixprint.com'),p=decodeURIComponent(u.pathname);let target=path.join('dist',p);if(p.endsWith('/'))target=path.join(target,'index.html');assert.ok(fs.existsSync(target),route+' '+p);
   if(u.hash&&target.endsWith('.html')){const body=fs.readFileSync(target,'utf8');assert.ok(body.includes('id="'+u.hash.slice(1)+'"'),route+' anchor '+value);}
   if(p==='/custom-printing/'&&u.searchParams.has('product'))assert.match(u.searchParams.get('product'),/^a recurring /);
  }
  for(const [,set] of html.matchAll(/srcset="([^"]+)"/g))for(const source of set.split(',')){assert.ok(fs.existsSync('dist'+source.trim().split(' ')[0]),source);}
 }
});
function menuFixture(){
 const node=()=>({hidden:true,listeners:{},attrs:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},setAttribute(k,v){this.attrs[k]=v},contains(target){return target===this},focus(){this.focused=true},fire(type,e={}){for(const fn of this.listeners[type]||[])fn(e)}});
 const nodes=Object.fromEntries(['#product-menu','#products-toggle','#menu-scrim','#industry-menu','#industries-toggle','.industries-nav','#industries-link'].map(k=>[k,node()]));
 const document=node(),anchor=node(),ctx={document,innerWidth:1200,$:(s)=>s==='a'?anchor:nodes[s],clearTimeout(){},setTimeout:fn=>{ctx.timer=fn;return 1},menuTimer:null};
 const menu=app.slice(app.indexOf('function menu(open)'),app.indexOf('function bindUnwindGuide'));
 const industry=app.slice(app.indexOf('let industryMenuTimer;'),app.indexOf('// Only non-personal'));
 vm.runInNewContext(menu+industry+';this.openProducts=menu;this.openIndustries=industryMenu;bindIndustryHeader();',ctx);
 return {nodes,document,anchor,ctx};
}
test('Industries menu opens by hover and tap, supports keyboard and never leaves both menus open',()=>{
 const {nodes:n,document:d,anchor,ctx}=menuFixture();
 n['.industries-nav'].fire('pointerenter',{pointerType:'mouse'});assert.equal(n['#industry-menu'].hidden,false);assert.equal(n['#industries-toggle'].attrs['aria-expanded'],'true');assert.equal(n['#menu-scrim'].hidden,false);
 ctx.openProducts(true);assert.equal(n['#industry-menu'].hidden,true);assert.equal(n['#product-menu'].hidden,false);assert.equal(n['#menu-scrim'].hidden,false);
 n['#industries-toggle'].fire('click');assert.equal(n['#industry-menu'].hidden,false);assert.equal(n['#product-menu'].hidden,true);
 d.fire('keydown',{key:'Escape'});assert.equal(n['#industry-menu'].hidden,true);assert.ok(n['#industries-link'].focused);
 n['#industries-link'].fire('keydown',{key:'ArrowDown',preventDefault(){}});assert.equal(n['#industry-menu'].hidden,false);assert.ok(anchor.focused);
 d.fire('focusin',{target:{}});assert.equal(n['#industry-menu'].hidden,true);
 ctx.innerWidth=375;n['.industries-nav'].fire('pointerenter',{pointerType:'touch'});assert.equal(n['#industry-menu'].hidden,true);
 n['#industries-toggle'].fire('click');assert.equal(n['#industry-menu'].hidden,false);
 n['#menu-scrim'].fire('click');assert.equal(n['#industry-menu'].hidden,true);assert.equal(n['#menu-scrim'].hidden,true);
 n['#industries-toggle'].fire('click');d.fire('click',{target:{closest:()=>({})}});assert.equal(n['#industry-menu'].hidden,true);
 assert.equal(n['#industries-link'].listeners.click,undefined,'Industries remains a normal hub link');
});
test('portable review contains the twelve pages and embeds their hero images',()=>{
 const html=fs.readFileSync('Quixprint-Full-Preview.html','utf8');const boot=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 const ctx={window:{},document:{querySelectorAll:()=>[]}};vm.runInNewContext(boot,ctx);
 for(const i of industries){assert.equal(ctx.window.QXP_PAGES[industryURL(i)].type,'industry');assert.match(ctx.window.QXP_ASSETS['/assets/products/industry-'+i.slug+'-1536.webp'],/^data:image\/webp;base64,/);assert.match(ctx.window.QXP_ASSETS['/assets/products/industry-'+i.slug+'-story-1536.webp'],/^data:image\/webp;base64,/);}
 for(const [,code] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(code);
});

test('expanded navigation includes twelve industry routes and religious requests use the main quote flow',()=>{
 const home=read('/');
 const menu=home.match(/<div class="industry-menu-grid">([\s\S]*?)<\/div>/)[1];
 for(const i of industries)assert.ok(menu.includes('href="'+industryURL(i)+'"'),i.slug);
 assert.equal((menu.match(/<a /g)||[]).length,12);
 const religious=read('/industries/religious/');
 assert.ok(religious.includes('/custom-printing/?product='));
 assert.ok(!religious.includes('/churches/'));
 assert.ok(!/TrueLife|25%|partnership discount/i.test(religious));
});
