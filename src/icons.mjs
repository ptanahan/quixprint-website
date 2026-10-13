// One vector icon set for every screen size; no platform-dependent symbol glyphs.
const paths={
 'arrow-up-right':'M5 19 19 5M12 5h7v7',
 'arrow-right':'M4 12h16M15 7l5 5-5 5',
 'arrow-left':'M20 12H4M9 7l-5 5 5 5',
 'chevron-down':'m6 9 6 6 6-6',
 search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
 close:'m6 6 12 12M6 18 18 6',
 plus:'M12 5v14M5 12h14',
 minus:'M5 12h14'
};
export const icons=Object.fromEntries(Object.entries(paths).map(([name,d])=>[name,`<svg class="q-icon q-icon-${name}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="${name.startsWith('arrow')?'1.3':'1.6'}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`]));
export function normalizeIcons(html){const names={'↗':'arrow-up-right','→':'arrow-right','←':'arrow-left','⌄':'chevron-down','⌕':'search'};return html.replace(/[↗→←⌄⌕]/g,s=>icons[names[s]]).replaceAll('>×</button>','>'+icons.close+'</button>').replaceAll('<span>+</span>','<span aria-hidden="true">'+icons.plus+'</span>');}

// Original vector diagrams keep finishing options crisp at every pixel density.
const banner=(detail)=>`<svg class="finishing-diagram" viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true" focusable="false"><rect x="13" y="12" width="70" height="40" rx="1" fill="#f4f7fb" stroke="#a6afbd" stroke-width="1.2"/>${detail}</svg>`;
const edge=(d)=>`<path d="${d}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
const holes=(pts)=>pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="white" stroke="currentColor" stroke-width="1.5"/>`).join('');
Object.assign(icons,{
 'hem-none':banner(''),
 'hem-all':banner(edge('M16 15H80V49H16Z')),
 'hem-top-bottom':banner(edge('M16 15H80M16 49H80')),
 'hem-left-right':banner(edge('M16 15V49M80 15V49')),
 'pocket-top-bottom':banner(edge('M13 17H83M13 47H83')),
 'pocket-left-right':banner(edge('M19 12V52M77 12V52')),
 'pocket-top':banner(edge('M13 17H83')),
 'pocket-bottom':banner(edge('M13 47H83')),
 'pocket-left':banner(edge('M19 12V52')),
 'pocket-right':banner(edge('M77 12V52')),
 'grommets-corners':banner(holes([[19,18],[77,18],[19,46],[77,46]])),
 'grommets-top':banner(holes([[19,18],[77,18]])),
 'grommets-every':banner(holes([[19,18],[38,18],[58,18],[77,18],[19,46],[38,46],[58,46],[77,46],[19,32],[77,32]])),
 'grommets-custom':banner(holes([[19,18],[77,18],[19,46],[77,46]])+'<path d="M43 32h10m-5-5v10" stroke="currentColor" stroke-width="1.5"/>'),
 'banner-front':banner('<path d="M28 38l10-13 10 13 7-8 12 12H28Z" fill="#cbdaf2"/>'),
 'banner-both':banner('<path d="M23 21h50v22H23Z" stroke="currentColor"/><path d="M30 27h36M30 33h26M30 39h32" stroke="currentColor" stroke-width="1.5"/>')
});
