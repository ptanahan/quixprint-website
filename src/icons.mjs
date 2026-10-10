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
