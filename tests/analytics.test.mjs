import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {analyticsTag,measurementId} from '../src/analytics.mjs';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);
test('every deployable HTML page has exactly one shared analytics initializer',()=>{
 const files=walk('dist').filter(f=>f.endsWith('.html'));assert.equal(files.length,75);
 for(const f of files){const html=fs.readFileSync(f,'utf8');assert.equal((html.match(/<script data-qxp-analytics>/g)||[]).length,1,f);assert.equal((html.match(/googletagmanager.com\/gtag\/js/g)||[]).length,1,f);assert.ok(html.includes(measurementId),f);}
 assert.ok(!fs.readFileSync('src/app.js','utf8').includes('googletagmanager'));
 assert.ok(!fs.readFileSync('Quixprint-Full-Preview.html','utf8').includes('googletagmanager'));
});
test('analytics initializes once on production and stays inactive in previews and local files',()=>{
 for(const preview of [true,false])for(const host of ['quixprint.com','www.quixprint.com','review.netlify.app','']){
  const appended=[],window={};const context={window,location:{hostname:host,protocol:host?'https:':'file:'},document:{createElement:()=>({}),head:{append:tag=>appended.push(tag)}}};
  const script=analyticsTag(preview).replace(/^<script[^>]*>|<\/script>$/g,'');vm.runInNewContext(script,context);vm.runInNewContext(script,context);
  const active=!preview&&['quixprint.com','www.quixprint.com'].includes(host);assert.equal(appended.length,active?1:0);
  if(active){assert.equal(appended[0].async,true);assert.equal(window.dataLayer.length,2);assert.equal(window.dataLayer[1][0],'config');assert.equal(window.dataLayer[1][1],measurementId);}
 }
});
