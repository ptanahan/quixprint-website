import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {header,checkoutPage} from '../src/templates.mjs';
import Q from '../lib/engine.js';
test('Products remains a catalog link while mouse hover and the separate toggle open categories',()=>{
 const html=header(Q.catalog,true);assert.match(html,/<a id="products-link" href="\/products\/">Products<\/a>/);
 const node=()=>({listeners:{},hidden:true,addEventListener(k,f){this.listeners[k]=f;}});
 const nodes=Object.fromEntries(['#products-toggle','#products-link','.products-nav','#product-menu','#menu-scrim'].map(k=>[k,node()]));let focused=false;
 const ctx={$:s=>s==='a'?{focus(){focused=true;}}:nodes[s],$$:()=>[],innerWidth:1200,menu:v=>nodes['#product-menu'].hidden=!v,clearTimeout(){},setTimeout(){},menuTimer:null};
 const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');vm.runInNewContext(app.slice(app.indexOf('function bindHeader()'),app.indexOf("document.addEventListener('keydown'"))+'bindHeader();',ctx);
 nodes['.products-nav'].listeners.pointerenter({pointerType:'mouse'});assert.equal(nodes['#product-menu'].hidden,false);assert.equal(nodes['#products-link'].listeners.click,undefined);
 nodes['#products-toggle'].listeners.click();assert.equal(nodes['#product-menu'].hidden,true);
 nodes['#products-link'].listeners.keydown({key:'ArrowDown',preventDefault(){}});assert.equal(nodes['#product-menu'].hidden,false);assert.equal(focused,true);
 ctx.innerWidth=375;nodes['#product-menu'].hidden=true;nodes['.products-nav'].listeners.pointerenter({pointerType:'touch'});assert.equal(nodes['#product-menu'].hidden,true);nodes['#products-toggle'].listeners.click();assert.equal(nodes['#product-menu'].hidden,false);
});
test('checkout field labels contain their required markers and the question footer has email only',()=>{const html=checkoutPage(true);assert.match(html,/class="field-label">Company name <span aria-hidden="true">\*<\/span><\/span><input/);assert.match(html,/Questions\? <a href="mailto:sales@quixprint.com">sales@quixprint.com<\/a><\/p>/);assert.ok(!html.includes('Privacy Policy'));});
