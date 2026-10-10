import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {stripAnalytics} from '../src/analytics.mjs';
import {normalizeIcons} from '../src/icons.mjs';
import {updateArticleCTA} from '../src/journal.mjs';
const root=new URL('../',import.meta.url).pathname;
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(d=>!d.name.startsWith('.')).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);
test('Churches files retain all content and functionality apart from the shared analytics tag',()=>{
 for(const file of walk(path.join(root,'legacy-site/churches'))){const relative=path.relative(path.join(root,'legacy-site'),file);if(file.endsWith('.html'))assert.equal(stripAnalytics(fs.readFileSync(path.join(root,'dist',relative),'utf8')),stripAnalytics(fs.readFileSync(file,'utf8')),relative);else assert.deepEqual(fs.readFileSync(path.join(root,'dist',relative)),fs.readFileSync(file),relative);}
 assert.deepEqual(fs.readFileSync(path.join(root,'netlify/functions/church-quote/index.mjs')),fs.readFileSync(path.join(root,'legacy-site/netlify/functions/church-quote/index.mjs')));
});
test('existing article and policy main content remain intact',()=>{
 for(const group of ['blog','privacy','terms'])for(const file of walk(path.join(root,'legacy-site',group)).filter(f=>f.endsWith('.html'))){
  const main=s=>s.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  const relative=path.relative(path.join(root,'legacy-site'),file);
  if(relative==='blog/index.html')continue;
  assert.equal(main(fs.readFileSync(path.join(root,'dist',relative),'utf8')),main(normalizeIcons(updateArticleCTA(fs.readFileSync(file,'utf8'),relative.split('/')[1]).replace(group==='privacy'?'Porter Ranch, CA 91326':'___NO_CHANGE___','Los Angeles, CA 91326'))),relative);
 }
});
test('new pages reference existing local pages and assets',()=>{
 const files=[path.join(root,'dist/index.html'),path.join(root,'dist/custom-printing/index.html'),...walk(path.join(root,'dist/products')),...walk(path.join(root,'dist/quote')),...walk(path.join(root,'dist/blog')).filter(f=>!f.includes('_post-template'))].filter(f=>f.endsWith('.html'));
 for(const file of files){const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/(?:src|href)="(\/[^\"]*)"/g)){
  const relative=decodeURIComponent(match[1].split(/[?#]/)[0]);let target=path.join(root,'dist',relative);if(relative.endsWith('/'))target=path.join(target,'index.html');assert.ok(fs.existsSync(target),`${path.relative(root,file)} → ${relative}`);
 }const preview=JSON.parse(fs.readFileSync(path.join(root,'build-report.json'),'utf8')).mode==='preview';if(preview||file.includes('/dist/quote/'))assert.match(html,/<meta name="robots" content="noindex,nofollow">/);else assert.ok(!/<meta name="robots" content="noindex,nofollow">/.test(html),file);}
});
