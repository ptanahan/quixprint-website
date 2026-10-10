import {esc} from './templates.mjs';
export const postURL=p=>'/blog/'+p.slug+'/';
export function topic(p){
 if(/label/.test(p.slug))return 'Materials & finishes';
 if(/ikea|dyson/.test(p.slug))return 'Print in perspective';
 if(/mail|variable/.test(p.slug))return 'Direct mail';
 if(/color/.test(p.slug))return 'Brand & design';
 return 'Ideas for your business';
}
export function postCard(p){return `<a class="journal-card" href="${postURL(p)}"><div class="journal-card-image"><img src="${esc(p.thumbnail||p.image)}" alt="${esc(p.imageAlt||p.title)}" width="800" height="600" loading="lazy"></div><div class="journal-meta"><span>${topic(p)}</span><time>${esc(p.date)}</time></div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="journal-read">Read article <span aria-hidden="true">↗</span></span></a>`;}
export function journalFeature(p,i){return `<a href="${postURL(p)}" class="journal-feature" data-journal-feature="${i}"${i?' hidden':''}><div class="journal-feature-image"><img src="${esc(p.image)}" alt="${esc(p.imageAlt||p.title)}" width="1200" height="900"></div><div class="journal-feature-copy"><span class="eyebrow">Featured article</span><div class="journal-meta"><span>${topic(p)}</span><time>${esc(p.date)}</time></div><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p><span class="journal-read">Read article <span aria-hidden="true">↗</span></span></div></a>`;}
export function journalIndex(posts){return `<main id="main" tabindex="-1" class="journal-page"><section class="wrap journal-heading"><span class="eyebrow">The Quixprint journal</span><div><h1>A little insight.<br>A better impression.</h1><p>Practical advice on print, materials, and marketing.</p></div></section><section class="wrap" id="journal-featured" aria-label="Featured article">${posts.map(journalFeature).join('')}</section><section class="wrap journal-archive"><div class="section-head"><div><span class="eyebrow">Keep exploring</span><h2>More from the journal.</h2><p>Ideas and expertise for your next print project.</p></div></div><div class="journal-grid" id="journal-archive">${posts.map((p,i)=>postCard(p).replace('<a class="journal-card"','<a class="journal-card" data-journal-archive="'+i+'"'+(i===0?' hidden':''))).join('')}</div></section><section class="wrap journal-close"><span class="eyebrow">Put an idea into practice</span><h2>Find the right print<br>for your next project.</h2><a class="button" href="/products/">Explore our products <span aria-hidden="true">↗</span></a></section></main>`;}
export const articleProducts={
 'bopp-vs-paper-labels':['/products/roll-labels/','Explore roll labels'],
 'custom-counter-mats':['/products/counter-mats/','Explore counter mats'],
 'custom-table-tent-printing':['/products/table-tents/','Explore table tents'],
 'ikea-catalog-history':['/products/booklets-catalogs/','Explore booklets & catalogs'],
 'direct-mail-response-rates':['/products/postcards/','Explore postcards'],
 'variable-data-printing':['/products/postcards/','Explore postcards'],
 'why-color-matters':['/products/','Explore all products'],
 'james-dyson-marketing-genius-flyer-strategy':['/products/','Explore all products']
};
export function updateArticleCTA(html,slug){const target=articleProducts[slug];if(!target)return html;return html.replace(/(<div class="article-cta">[\s\S]*?)<a\b[^>]*href="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>/,(_,before)=>before+`<a class="button" href="${target[0]}">${esc(target[1])} <span aria-hidden="true">↗</span></a>`);}
export function journalHome(posts){return `<section class="wrap journal-home"><div class="section-head"><div><span class="eyebrow">From the journal</span><h2>A fresh perspective on print.</h2></div><a class="text-link" href="/blog/">Explore the journal <span aria-hidden="true">↗</span></a></div><div class="journal-grid" id="home-journal">${posts.map((p,i)=>postCard(p).replace('<a class="journal-card"','<a class="journal-card" data-journal-index="'+i+'"'+(i<3?'':' hidden'))).join('')}</div></section>`;}
