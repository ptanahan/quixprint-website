import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const head=`(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../data/catalog.json'),require('../data/legacy.json'));else root.QXP=factory(root.QXP_CATALOG,root.QXP_LEGACY);})(typeof globalThis!=='undefined'?globalThis:this,function(catalog,legacyData){\n'use strict';\n`;
fs.writeFileSync(new URL('lib/engine.js',root),head+fs.readFileSync(new URL('lib/legacy-resolver.part',root),'utf8')+fs.readFileSync(new URL('lib/engine-tail.part',root),'utf8'));
