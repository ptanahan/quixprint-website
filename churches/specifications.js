(() => {
  'use strict';
  const data = window.QUIXPRINT_SPEC_DATA;
  const keys = {'Postcards':'postcards','Door hangers':'door','Flyers':'flyers','Brochures':'brochures','Posters':'posters','Calendars':'calendars','Remittance Envelopes':'envelopes','Letterheads':'letterheads','Presentation folders':'folders','Christmas Cards':'greeting','Easter Cards':'greeting','Flag banners':'flag','X-frame banners':'xframe','Outdoor banners':'outdoor','Retractable banners with stand':'retractable','Yard signs':'yard','Stickers':'stickers','Window decals':'window'};
  // Resolve in dependency order. Only active fields survive in the returned state.
  window.quixprintSpecifications = (name, previous = {}) => {
    const key = keys[name], d = data[key], state = {}, fields = [];
    function select(label, options, preferred) {
      if (!options?.length) return '';
      const value = options.includes(previous[label]) ? previous[label] : options.includes(preferred) ? preferred : options[0];
      state[label] = value; fields.push({label,options,value}); return value;
    }
    function input(label, type = 'text', value = '') {
      const current = previous[label] ?? value;
      state[label] = current; fields.push({label,type,value:current}); return current;
    }
    function orientation(size) {
      const dimensions = size?.match(/[\d.]+/g);
      if (dimensions?.length >= 2 && dimensions[0] !== dimensions[1]) select('Orientation',['Horizontal','Vertical']);
    }
    function customDimensions(size, shape) {
      if (size !== 'Custom Size') return;
      select('Dimension units',['Inches','Feet']);
      if (shape === 'Circle') input('Diameter','dimension');
      else if (shape === 'Square') input('Side length','dimension');
      else { input('Width','dimension'); input('Height','dimension'); }
    }
    let quantities = [];
    if (!d) return {fields,state,quantities:['25','50','100','250','500','1000','2500','5000','10000']};
    if (d.fields) {
      const size = select('Size',d.fields.Size,d.defaults.Size);
      if (!['envelopes','folders','door','calendars'].includes(key)) orientation(size);
      const paper = select(key === 'calendars' ? 'Inside paper' : 'Paper',d.fields.Paper,d.defaults.Paper);
      const variant = d.paper?.[paper] || d.fields;
      if (key === 'calendars') {
        select('Cover Paper',d.fields['Cover Paper'],d.defaults['Cover Paper']);
        select('Pages',d.fields.Page,d.defaults.Page);
        select('Hole drilling',['No','Yes']);
      }
      select('Color',variant.Color,d.defaults.Color);
      if (key === 'brochures') select('Folding',d.size[size].Folding,'Tri-Fold');
      if (key === 'greeting') select('Folding',variant.Folding);
      if (key === 'folders') {
        const pocket = select('Pocket',d.size[size].Pocket,'Double');
        select('Business card slit',pocket === 'Double' ? ['No Slit','Right Pocket Slit','Both Pockets Slit'] : ['No Slit','Right Pocket Slit']);
      }
      if (key === 'calendars') {
        if (/Gloss/.test(paper)) select('Inside coating',['Gloss Aqueous Coating']);
        if (/Matte/.test(paper)) select('Inside coating',['Matte Aqueous Coating']);
      } else select('Coating',variant.Coating);
      select('Finish',variant.Finish);
      select('Rounded Corner',variant['Rounded Corner']);
      const raised = select('Raised Print',variant['Raised Print']);
      if (raised.includes('Foil')) select('Foil color',['Gold','Rose Gold','Silver']);
      if (key === 'postcards') {
        if (select('Mailing',['Without mailing','With mailing']) === 'With mailing') {
          select('Mailing list',['I have a list','I need a list','Every Door Direct Mail']);
        }
      }
      if (key === 'greeting') select('Envelopes',['With envelopes','Without envelopes']);
      quantities = variant.Quantity;
    } else {
      let shape = 'Rectangle';
      if (key === 'stickers') shape = select('Shape',['Rectangle','Square','Circle','Die Cut']);
      if (key === 'window') shape = select('Shape',['Rectangle','Square','Circle','Custom Shape']);
      const sizes = d.byShape?.[shape]?.size || d.byShape?.[shape] || d.size;
      const size = select('Size',sizes);
      if (['outdoor','yard','stickers','window'].includes(key)) { customDimensions(size,shape); orientation(size); }
      if (key === 'flag') {
        select('Material',['4 oz. Polyester']); select('Print sides',['Front Only','Front and Back']);
        select('Hardware',d.hardware); select('Carry bag',d.bag);
      }
      if (key === 'xframe') {
        select('Material',['Vinyl Banner']); select('Stand',[size.startsWith('24') ? 'X-Frame (24" Wide)' : 'X-Frame (32" Wide)']);
        select('Grommets',['4 Corners']);
      }
      if (key === 'outdoor') {
        select('Material',['13 oz. Matte Vinyl','16 oz. Matte Vinyl']); select('Print sides',['Front Only','Front and Back']);
        select('Hemming',['4 Sides','No']);
        select('Pole pockets',['No','Top & Bottom','Left & Right','Top Only','Left Only','Bottom Only']);
        if (select('Grommets',['4 Corners','Every 2 ft','Top 2 Corners','No','Custom']) === 'Custom') input('Grommet placement');
      }
      if (key === 'retractable') {
        select('Material',d.material);
        const variant = d.bySize[size], both = select('Print sides',variant.sides) === 'Front and Back';
        select('Stand',both ? ['Deluxe Stand (33" Wide) - Double Sided'] : variant.stand);
        select('Stand color',both ? ['Silver'] : variant.standColor);
      }
      if (key === 'yard') {
        select('Material',['4 mm White Coroplast']); select('Print sides',d.sides);
        select('Grommets',d.grommets); select('H-stakes',d.stakes);
      }
      if (key === 'window') {
        const clear = select('Material',d.material) === 'Clear Cling';
        if (select('Print sides',clear ? ['Front Only','Front and Back'] : ['Front Only']) === 'Front and Back') select('Artwork',d.artwork);
      }
      if (key === 'stickers') {
        const material = select('Material',d.material), clear = material === 'Clear Gloss Vinyl';
        select('Print',['Full Color'+(clear ? ' + White (5/0)' : ' (4/0)')]);
        if (!clear) select('Back liner',['Crack & Peel']);
        if (['Rectangle','Square'].includes(shape)) select('Round corners',['No','1/8" Round','1/4" Round']);
        const finishes = clear ? ['Gloss Lamination - 1 Mil'] : d.byMaterial[material]?.finishing || d.finishing;
        select('Finishing',finishes);
        const foil = select('Foil',d.foil);
        if (foil !== 'No') select('Foil color',foil === 'Digital Foil' ? d.digitalFoilColors : d.raisedFoilColors);
        select('Raised spot UV',d.uv);
      }
      input('Versions','integer','1');
      quantities = d.quantity;
    }
    return {fields,state,quantities};
  };
})();
