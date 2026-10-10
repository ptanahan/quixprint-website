import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {articleProducts} from '../src/journal.mjs';
test('journal changes its feature on each visit without duplicating it in the archive',()=>{
 const app=fs.readFileSync('src/app.js','utf8');
 const source=app.slice(app.indexOf('let lastJournalFeature=null;'),app.indexOf('function initialize()'));
 const features=Array.from({length:8},(_,i)=>({dataset:{journalFeature:String(i)},getAttribute:()=>'/blog/article-'+i+'/'}));
 const archive=features.map((_,i)=>({dataset:{journalArchive:String(i)}}));
 const store=new Map();
 const context={$$:s=>s==='[data-journal-feature]'?features:archive,sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},Math};
 vm.createContext(context);vm.runInContext(source,context);
 let last;
 for(let i=0;i<40;i++){
  vm.runInContext('initJournal()',context);
  const selected=features.filter(x=>!x.hidden);assert.equal(selected.length,1);assert.notEqual(selected[0],last);last=selected[0];
  assert.equal(archive.filter(x=>x.hidden).length,1);assert.equal(archive.findIndex(x=>x.hidden),features.indexOf(last));
 }
 context.sessionStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 vm.runInContext('initJournal()',context);assert.notEqual(features.find(x=>!x.hidden),last);
});
test('all eight closing article buttons navigate to relevant products',()=>{
 assert.equal(Object.keys(articleProducts).length,8);
 for(const [slug,[url]] of Object.entries(articleProducts)){
  const html=fs.readFileSync('dist/blog/'+slug+'/index.html','utf8');
  const cta=html.match(/<div class="article-cta">[\s\S]*?<\/div>/)[0];
  assert.ok(cta.includes('href="'+url+'"'));assert.doesNotMatch(cta,/mailto:/);
  assert.ok(fs.existsSync('dist'+url+'index.html'));
 }
});
test('portable preview includes both restyled legal pages and the supplied guide',()=>{
 const html=fs.readFileSync('Quixprint-Full-Preview.html','utf8');
 const boot=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 const context={window:{},document:{querySelectorAll:()=>[]}};vm.runInNewContext(boot,context);
 for(const route of ['/privacy/','/terms/']){
  assert.equal(context.window.QXP_PAGES[route].type,'legal');
  const page=fs.readFileSync('dist'+route+'index.html','utf8');
  assert.doesNotMatch(page,/href="\/(?:styles|legal)\.css"/);assert.match(page,/href="\/assets\/qxp.css"/);
 }
 assert.match(context.window.QXP_ASSETS['/assets/products/roll-unwind-guide.webp'],/^data:image\/webp;base64,/);
 assert.match(html,/class="unwind-guide-image"/);
});
