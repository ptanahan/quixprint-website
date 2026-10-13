import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import Q from '../lib/engine.js';
import * as T from '../src/templates.mjs';
const make=(id,choices={})=>{const r=Q.resolve(id,choices);return {id:'update-test',productId:id,choices:r.state,quantity:Number(r.quantities[0]),quantityCustom:false,note:'',buying:false};};

test('fixed-quantity products reject custom quantities and hidden artwork versions on the server',()=>{
 for(const id of ['booklets-catalogs','table-tents','greeting-cards','notepads','bulk-posters','laminated-menus']){
  const item=make(id),r=Q.resolve(id);assert.ok(r.quantities.length,id);assert.ok(!r.fields.some(f=>f.label==='Versions'),id);assert.equal(Q.validateItem(item).quantity,item.quantity);
  assert.throws(()=>Q.validateItem({...item,quantityCustom:true}),/listed quantities/,id);
  assert.throws(()=>Q.validateItem({...item,quantity:1234567}),/listed quantities/,id);
  assert.throws(()=>Q.validateItem({...item,choices:{...item.choices,Versions:'2'}}),/options changed/,id);
  assert.throws(()=>Q.validateItem({...item,quantityMode:'breakdown',artworkVersions:[{name:'A',quantity:item.quantity}]}),/breakdown/,id);
 }
});
test('mailing removes UV on the back and rejects a tampered mailing quote',()=>{
 const r=Q.resolve('postcards',{Paper:'14 pt. Gloss',Color:'Full Color Both Sides',Coating:'High Gloss UV Coating Both Sides',Mailing:'With mailing'});
 assert.equal(r.state.Coating,'High Gloss UV Coating Front');assert.ok(!r.fields.find(f=>f.label==='Coating').options.some(v=>v.includes('Both Sides')));
 const item=make('postcards',r.state);assert.throws(()=>Q.validateItem({...item,choices:{...item.choices,Coating:'High Gloss UV Coating Both Sides'}}),/coating/);
 const both=Q.resolve('postcards',{...r.state,Mailing:'Without mailing'});assert.ok(both.fields.find(f=>f.label==='Coating').options.includes('High Gloss UV Coating Both Sides'));
});
test('takeout menus share brochure specifications and quantities for every size and paper',()=>{
 const r=Q.resolve('brochures');for(const size of r.fields.find(f=>f.label==='Size').options)for(const paper of r.fields.find(f=>f.label==='Paper').options){const state={Size:size,Paper:paper};assert.deepEqual(Q.resolve('takeout-menus',state),Q.resolve('brochures',state));}
});
test('all product pages offer a design template request',()=>{for(const p of Q.catalog.products)assert.match(T.productPage(p,Q.catalog),/Design templates available upon request/);});
test('homepage rotates four unique articles and hides the rest',()=>{
 const nodes=Array.from({length:8},(_,i)=>({dataset:{journalIndex:String(i)},hidden:false})),root={append(){}};
 const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');const start=app.indexOf('function initHomeJournal()'),end=app.indexOf('\nfunction ',start+1);
 vm.runInNewContext(app.slice(start,end)+';initHomeJournal();',{$:()=>root,$$:()=>nodes,Date});assert.equal(nodes.filter(n=>!n.hidden).length,4);
});
test('checkout gives mobile date and promo fields their own stacked grid',()=>{assert.match(T.checkoutPage(false),/class="field-grid checkout-extras"/);const css=fs.readFileSync(new URL('../src/refinement.css',import.meta.url),'utf8');assert.match(css,/@media\(max-width:600px\)\{\.checkout-extras\{grid-template-columns:minmax\(0,1fr\)/);});

test('banner pockets clear incompatible hemming and custom dimensions follow units',()=>{
 const r=Q.resolve('outdoor-banners',{'Pole pockets':'Top & Bottom',Hemming:'4 Sides',Units:'Feet',Size:'Custom size','Width (ft)':'6','Height (ft)':'3'});
 assert.equal(r.state.Hemming,'No');assert.ok(!('Width (in)' in r.state));
 const item=make('outdoor-banners',r.state);assert.equal(Q.validateItem(item).choices['Width (ft)'],'6');
 assert.throws(()=>Q.validateItem({...item,choices:{...item.choices,Hemming:'4 Sides'}}),/hemming/);
});
test('clear decals preserve shape sizing and reject a noncircular custom circle in feet',()=>{
 const r=Q.resolve('window-decals',{Shape:'Circle',Units:'Feet'});assert.equal(Q.product('window-decals').name,'Clear Window Decals');assert.ok(!('Orientation' in r.state));assert.equal(r.state.Size,'2 x 2 ft');
 const item=make('window-decals',{Shape:'Circle',Units:'Feet',Size:'Custom size','Width (ft)':'2','Height (ft)':'3'});assert.throws(()=>Q.validateItem(item),/matching width and height/);
 item.choices['Height (ft)']='2';assert.equal(Q.validateItem(item).choices['Height (ft)'],'2');
});
test('poster paper updates fixed minimum quantities',()=>{
 const r=Q.resolve('bulk-posters',{Paper:'80 lb. Matte Text'});assert.equal(r.quantities[0],'500');const item=make('bulk-posters',r.state);assert.throws(()=>Q.validateItem({...item,quantity:100}),/listed quantities/);
});

test('booklets enforce four-page increments and separate perfect-bound covers',()=>{
 for(const n of [8,12,44,48,52,96]){const r=Q.resolve('booklets-catalogs',{'Interior paper':'80 lb. Gloss Book','Page count including cover':String(n)});assert.ok(r.fields.find(f=>f.label==='Page count including cover').options.every(v=>Number(v)%4===0));assert.equal(r.fields.find(f=>f.label==='Binding').options.includes('Perfect Binding'),n>=48);}
 const item=make('booklets-catalogs',{'Page count including cover':'48',Binding:'Perfect Binding'});assert.notEqual(item.choices.Cover,'Self Cover');
 assert.throws(()=>Q.validateItem({...item,choices:{...item.choices,Cover:'Self Cover'}}),/cover/);
 assert.throws(()=>Q.validateItem({...item,choices:{...item.choices,'Page count including cover':'49'}}),/page count/);
 const reduced=Q.resolve('booklets-catalogs',{...item.choices,'Page count including cover':'44'});assert.equal(reduced.state.Binding,'Saddle Stitch');
});

test('booklet stock, page count and digital-run rules update the quantity dropdown',()=>{
 const r=Q.resolve('booklets-catalogs');assert.equal(r.quantities[0],'25');
 for(const choices of [{Orientation:'Horizontal'},{Stitching:'Top Edge (Calendar Style)'},{'Page count including cover':'44'},{Cover:'14 pt. Uncoated Cover'}])assert.ok(!Q.resolve('booklets-catalogs',choices).quantities.includes('25'));
 assert.equal(Q.resolve('booklets-catalogs',{'Interior paper':'80 lb. Matte Text'}).quantities[0],'500');
 assert.equal(Q.resolve('booklets-catalogs',{'Interior paper':'80 lb. Gloss Book'}).quantities[0],'250');
 assert.equal(Q.resolve('booklets-catalogs',{'Page count including cover':'40'}).quantities.at(-1),'25000');
 assert.equal(r.quantities.at(-1),'100000');
 assert.equal(r.fields.find(f=>f.label==='Page count including cover').options.at(-1),'84');
});
