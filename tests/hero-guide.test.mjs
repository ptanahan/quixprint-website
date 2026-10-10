import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {footer} from '../src/templates.mjs';
const app=fs.readFileSync('src/app.js','utf8');
function node(){return {listeners:{},attrs:{},hidden:false,complete:true,naturalWidth:1536,classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.listeners[k]=f;}};}
test('hero rotates, supports image-tap pause, respects reduced motion, and cleans up when leaving home',()=>{
 const slides=[node(),node(),node()],gallery=node(),pause=node(),description=node(),motion=node(),document=node();motion.matches=false;document.hidden=false;gallery.contains=()=>false;
 let hasHero=true,serial=0;const timers=new Map();
 const ctx={$:s=>s==='#hero-gallery'?(hasHero?gallery:null):s==='#hero-pause'?pause:description,$$:()=>slides,matchMedia:()=>motion,AbortController,document,setTimeout:(f,ms)=>{assert.equal(ms,4500);timers.set(++serial,f);return serial;},clearTimeout:id=>timers.delete(id)};
 vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('let destroyHero='),app.indexOf('let lastJournalFeature=')),ctx);
 const step=()=>{assert.equal(timers.size,1);const [id,fn]=[...timers][0];timers.delete(id);fn();};
 vm.runInContext('initHero()',ctx);step();assert.equal(slides[1].attrs['aria-hidden'],'false');step();assert.equal(slides[2].attrs['aria-hidden'],'false');step();assert.equal(slides[0].attrs['aria-hidden'],'false');
 pause.listeners.click();assert.equal(timers.size,0);assert.equal(pause.attrs['aria-label'],'Play image rotation');pause.listeners.click();assert.equal(timers.size,1);
 gallery.listeners.pointerenter({pointerType:'mouse'});assert.equal(timers.size,0);gallery.listeners.pointerleave();assert.equal(timers.size,1);
 document.hidden=true;document.listeners.visibilitychange();assert.equal(timers.size,0);document.hidden=false;document.listeners.visibilitychange();assert.equal(timers.size,1);
 motion.matches=true;motion.listeners.change();assert.equal(timers.size,0);assert.equal(pause.disabled,true);
 motion.matches=false;motion.listeners.change();assert.equal(timers.size,1);hasHero=false;vm.runInContext('initHero()',ctx);assert.equal(timers.size,0);
});
test('unwind guide has its note above the image, no bottom button, and closes only on a backdrop click',()=>{
 const html=footer();const guide=html.match(/<dialog id="unwind-guide"[\s\S]*?<\/dialog>/)[0];
 assert.ok(guide.indexOf('Choose Any for hand application.')<guide.indexOf('<img'));
 assert.doesNotMatch(guide,/Got it/);assert.match(guide,/aria-label="Close roll unwind guide"/);
 const dialog=node();let closes=0;dialog.close=()=>closes++;dialog.getBoundingClientRect=()=>({left:100,top:100,right:600,bottom:600});
 vm.runInNewContext(app.slice(app.indexOf('function bindUnwindGuide()'),app.indexOf('function bindHeader()'))+'bindUnwindGuide();',{$:()=>dialog});
 dialog.listeners.click({target:dialog,clientX:120,clientY:120});assert.equal(closes,0);
 dialog.listeners.click({target:{},clientX:50,clientY:50});assert.equal(closes,0);
 dialog.listeners.click({target:dialog,clientX:50,clientY:50});assert.equal(closes,1);
});
