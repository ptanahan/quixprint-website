import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import * as T from '../src/templates.mjs';
import * as J from '../src/journal.mjs';
import {icons,normalizeIcons} from '../src/icons.mjs';
import {applyAnalytics} from '../src/analytics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const catalog=JSON.parse(fs.readFileSync('data/catalog.json'));
const legacy=JSON.parse(fs.readFileSync('data/legacy.json'));
const postContext={window:{}};vm.runInNewContext(fs.readFileSync('legacy-site/blog/posts.js','utf8'),postContext);
const posts=postContext.window.QUIXPRINT_POSTS.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
const style=['site.css','refinement.css','journal.css'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n');
const preview=process.env.SITE_MODE!=='live';
const out=path.join(root,'dist');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of fs.readdirSync('legacy-site')){if(['netlify','scripts','README.md','netlify.toml','sitemap.xml','robots.txt'].includes(name))continue;fs.cpSync(path.join('legacy-site',name),path.join(out,name),{recursive:true,filter:src=>!path.basename(src).startsWith('.')});}
// Remove only the GIF repeat-control metadata. Preserve every encoded image
// frame, palette and timing byte so the logo holds its own completed frame.
const logoGif=fs.readFileSync('legacy-site/qxp_logo_animated.gif');
const repeatControl=Buffer.from('21ff0b4e45545343415045322e300301000000','hex');
const repeatAt=logoGif.indexOf(repeatControl);
if(repeatAt<0)throw new Error('Expected the supplied logo GIF repeat metadata.');
const logoOnce=Buffer.concat([logoGif.subarray(0,repeatAt),logoGif.subarray(repeatAt+repeatControl.length)]);
fs.writeFileSync(path.join(out,'qxp-logo-once.gif'),logoOnce);
fs.mkdirSync(path.join(out,'assets/products'),{recursive:true});
for(const file of fs.readdirSync('artwork').filter(n=>n.endsWith('.webp')))fs.copyFileSync(path.join('artwork',file),path.join(out,'assets/products',file));
fs.writeFileSync(path.join(out,'assets/qxp.css'),style);fs.copyFileSync('src/app.js',path.join(out,'assets/qxp-app.js'));fs.copyFileSync('lib/engine.js',path.join(out,'assets/qxp-engine.js'));fs.copyFileSync('lib/email.js',path.join(out,'assets/qxp-email.js'));
const jsJSON=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const dataJS='window.QXP_ICONS='+jsJSON(icons)+';window.QXP_CATALOG='+jsJSON(catalog)+';\nwindow.QXP_LEGACY='+jsJSON(legacy)+';\nwindow.QXP_CONFIG='+jsJSON({preview})+';';
fs.writeFileSync(path.join(out,'assets/qxp-data.js'),dataJS);
const header=normalizeIcons(T.header(catalog,preview)),footer=normalizeIcons(T.footer());
const pages={};
const add=(route,type,title,description,html,product='')=>pages[route]={type,title,description,html:normalizeIcons(html),product};
add('/','home','Quixprint | Printing for leading businesses','Commercial printing for businesses nationwide. Explore brochures, labels, catalogs, signs, and more. Build a quote with personal service from Quixprint.',T.home(catalog,posts));
add('/blog/','journal','The Quixprint Journal | Ideas, Materials & Print Marketing','Practical advice on print, materials, and marketing. Explore the Quixprint journal.',J.journalIndex(posts));
add('/products/','catalog','Printing Products | Quixprint','Explore business printing, marketing materials, labels, stickers, signs, and displays. Select your specifications and request one simple quote.',T.catalogPage(catalog));
for(const p of catalog.products)add(T.url(p),'product',p.name+' Printing & Quotes | Quixprint',p.description,T.productPage(p,catalog),p.id);
add('/quote/cart/','cart','Your Quote | Quixprint','Review the products and specifications in your Quixprint quote.',T.cartPage());
add('/quote/checkout/','checkout','Request Your Quote | Quixprint','Share your project and shipping details to request printing prices.',T.checkoutPage(preview));
add('/quote/received/','receipt','Quote Request | Quixprint','Your Quixprint quote request summary.',T.successPage());
add('/404/','notfound','Page Not Found | Quixprint','Find printing products or request a custom quote.',T.notFound());
const scripts='<script src="/assets/qxp-data.js" defer></script><script src="/assets/qxp-engine.js" defer></script><script src="/assets/qxp-email.js" defer></script><script src="/assets/qxp-app.js" defer></script>';
function doc(route,p){const noindex=preview||route.startsWith('/quote/')||route==='/404/';const canonical='https://quixprint.com'+route;const image= p.product?catalog.products.find(x=>x.id===p.product).image:(route==='/'?'/assets/products/hero-forma-v2.webp':'/assets/products/hero-print.webp');const schema={'@context':'https://schema.org','@type':'WebPage',name:p.title,description:p.description,url:canonical};return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1455ee"><title>${T.esc(p.title)}</title><meta name="description" content="${T.esc(p.description)}"><meta name="robots" content="${noindex?'noindex,nofollow':'index,follow'}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${T.esc(p.title)}"><meta property="og:description" content="${T.esc(p.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://quixprint.com${image}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="/QXP%20Favicon.png"><link rel="stylesheet" href="/assets/qxp.css"><script type="application/ld+json">${jsJSON(schema)}</script>${scripts}</head><body data-page="${p.type}" data-product="${p.product}">${header}${p.html}${footer}</body></html>`;}
for(const [route,p] of Object.entries(pages)){const file=route==='/404/'?path.join(out,'404.html'):path.join(out,route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,doc(route,p));}
// Preserve article and policy body content and URLs, while using the shared navigation.
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).filter(d=>!d.name.startsWith('.')).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);}
for(const group of ['blog','privacy','terms'])for(const file of walk(path.join(out,group)).filter(f=>f.endsWith('.html'))){
 if(group==='blog'&&file===path.join(out,'blog/index.html'))continue;
 let html=fs.readFileSync(file,'utf8');html=html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/i,header).replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i,footer);
 html=html.replace(/<script\b[^>]*src="https:\/\/www\.googletagmanager\.com\/gtag\/js[^>]*><\/script>/g,'').replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/g,'');
 html=html.replace(/<script\b[^>]*src="\/script\.js"[^>]*><\/script>/g,'');
 html=html.replace(/<link\b[^>]*href="(?:\/styles\.css|\/blog\.css|\/legal\.css|https:\/\/fonts\.[^"]*)"[^>]*>/g,'');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/qxp.css">'+scripts+'</head>');
 if(!/<main[^>]*id=/.test(html))html=html.replace(/<main([^>]*)>/,'<main$1 id="main" tabindex="-1">');
 if(preview)html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
 const relative='/'+path.relative(out,file).replaceAll(path.sep,'/').replace(/index\.html$/,'');
 if(!/rel="canonical"/.test(html))html=html.replace('</head>',`<link rel="canonical" href="https://quixprint.com${relative}"></head>`);
 if(group==='privacy')html=html.replace('Porter Ranch, CA 91326','Los Angeles, CA 91326');
 if(group==='blog')html=J.updateArticleCTA(html,relative.split('/')[2]);
 html=normalizeIcons(html);
 fs.writeFileSync(file,html);
 if(group!=='blog')add(relative,'legal',group==='privacy'?'Privacy Policy | Quixprint':'Terms and Conditions | Quixprint','Quixprint '+group+'.',html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)[0]);
 if(group==='blog'&&!file.includes('_post-template')){
  const post=posts.find(p=>relative===J.postURL(p));
  if(post)add(relative,'article',post.title+' | Quixprint',post.excerpt,html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)[0]);
 }
}
// One independent GA4 initializer on every HTML page, including retained legacy routes.
// The portable file is assembled separately without this tag.
const analyticsFiles=walk(out).filter(file=>file.endsWith('.html'));
for(const file of analyticsFiles)fs.writeFileSync(file,applyAnalytics(fs.readFileSync(file,'utf8'),{preview}));
const urls=walk(out).filter(f=>f.endsWith('/index.html')&&!/\/(quote|_post-template|email-preview|thanks|cart|checkout)\//.test(f)).map(f=>'/'+path.relative(out,f).replaceAll(path.sep,'/').replace(/index\.html$/,''));
fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'  <url><loc>https://quixprint.com'+u+'</loc></url>').join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(out,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\nDisallow: /quote/\nDisallow: /churches/cart/\nDisallow: /churches/checkout/\nDisallow: /churches/email-preview/\nDisallow: /blog/_post-template/\nSitemap: https://quixprint.com/sitemap.xml\n');
fs.writeFileSync(path.join(out,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n${preview?'  X-Robots-Tag: noindex, nofollow\n':''}/quote/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n/assets/products/*\n  Cache-Control: public, max-age=86400\n`);
fs.writeFileSync(path.join(out,'_redirects'),'/cart /quote/cart/ 301\n/cart/ /quote/cart/ 301\n/checkout /quote/checkout/ 301\n/checkout/ /quote/checkout/ 301\n');
// Portable, self-contained design preview. No server, upload, email or tracking requests.
const mime={'.gif':'image/gif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};const cached={};const previewImages=JSON.parse(fs.readFileSync('data/preview-images.json'));
function register(asset){const absolute=previewImages[asset]?path.join(root,previewImages[asset]):path.join(out,decodeURIComponent(asset));if(!fs.existsSync(absolute))return;cached[asset]??='data:'+mime[path.extname(absolute)]+';base64,'+fs.readFileSync(absolute).toString('base64');}
function embedded(html){return html.replace(/\s+srcset="[^"]*"/g,'').replace(/src="(\/[^"?]+\.(?:webp|png|jpg|jpeg))"/g,(match,asset)=>{register(asset);return 'data-qxp-src="'+asset+'"';});}
const offlinePages=Object.fromEntries(Object.entries(pages).map(([k,p])=>[k,{...p,html:embedded(k==='/quote/checkout/'?normalizeIcons(T.checkoutPage(true)):p.html)}]));
for(const p of catalog.products)register(p.image);
register('/qxp-logo-once.gif');
const offlineHeader=embedded(normalizeIcons(T.header(catalog,true))),offlineFooter=embedded(footer);
const offline=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Quixprint — Full Website Preview</title><link rel="icon" href="data:image/png;base64,${fs.readFileSync(path.join(out,'QXP Favicon.png')).toString('base64')}"><style>${style}</style></head><body>${offlineHeader}<main id="main" tabindex="-1"></main>${offlineFooter}<script>window.QXP_ICONS=${jsJSON(icons)};window.QXP_OFFLINE=true;window.QXP_CONFIG={preview:true};window.QXP_PAGES=${jsJSON(offlinePages)};window.QXP_ASSETS=${jsJSON(cached)};window.QXP_CATALOG=${jsJSON(catalog)};window.QXP_LEGACY=${jsJSON(legacy)};window.QXP_HYDRATE=function(root){root.querySelectorAll('img').forEach(function(img){const key=img.getAttribute('data-qxp-src')||img.getAttribute('src');if(window.QXP_ASSETS[key]){img.removeAttribute('srcset');img.src=window.QXP_ASSETS[key];img.removeAttribute('data-qxp-src');}});};window.QXP_HYDRATE(document);</script><script>${fs.readFileSync('lib/engine.js','utf8')}</script><script>${fs.readFileSync('lib/email.js','utf8')}</script><script>${fs.readFileSync('src/app.js','utf8')}</script></body></html>`;
fs.writeFileSync('Quixprint-Full-Preview.html',offline);
fs.writeFileSync('build-report.json',JSON.stringify({mode:preview?'preview':'live',newPages:Object.keys(pages).length,catalogProducts:catalog.products.length-1,analyticsPages:analyticsFiles.length,analyticsMeasurementId:'G-D2CW5LWNT1',menuEntries:catalog.categories.reduce((n,c)=>n+c.links.length,0),sitemapURLs:urls.length,generated: new Date().toISOString()},null,2));
console.log(`Built ${Object.keys(pages).length} new pages, ${catalog.products.length-1} products, ${urls.length} sitemap URLs. Mode: ${preview?'PREVIEW':'LIVE'}.`);
