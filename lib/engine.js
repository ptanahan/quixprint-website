(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../data/catalog.json'),require('../data/legacy.json'));else root.QXP=factory(root.QXP_CATALOG,root.QXP_LEGACY);})(typeof globalThis!=='undefined'?globalThis:this,function(catalog,legacyData){
'use strict';
const data = legacyData;
  const keys = {'Postcards':'postcards','Door hangers':'door','Flyers':'flyers','Brochures':'brochures','Posters':'posters','Calendars':'calendars','Envelopes':'mailingEnvelopes','Remittance Envelopes':'envelopes','Letterheads':'letterheads','Presentation folders':'folders','Christmas Cards':'greeting','Easter Cards':'greeting','Flag banners':'flag','X-frame banners':'xframe','Outdoor banners':'outdoor','Retractable banners with stand':'retractable','Yard signs':'yard','Stickers':'stickers','Window decals':'window'};
  // Resolve in dependency order. Only active fields survive in the returned state.
  const resolveLegacy = (name, previous = {}) => {
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
    if (key === 'mailingEnvelopes') {
      const size = select('Size',d.sizes,d.defaultSize);
      const variant = d.bySize[size];
      select('Paper',d.paper);
      const color = select('Color',variant.colors);
      quantities = variant.quantitiesByColor?.[color] || variant.quantities;
      return {fields,state,quantities};
    }
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

function product(id) { return catalog.products.find(p=>p.id===id); }
function matches(when,state) { return !when || Object.entries(when).every(([key,value])=>(Array.isArray(value)?value:[value]).includes(state[key])); }
function resolve(id,previous={}) {
  const p=product(id); if(!p)throw new Error('Unknown product');
  let out;
  if(p.legacyName) {
    out=resolveLegacy(p.legacyName,previous);
    out.fields=out.fields.map(f=>({...f,required:true}));
  } else {
    const state={},fields=[]; let config=p.config||{};
    const pick=f=>{
      if(!matches(f.when,state))return;
      let options=f.options;
      if(f.optionsBy)options=f.optionsBy.values[state[f.optionsBy.field]]||f.optionsBy.fallback||[];
      if(options && !options.length)return;
      const value=options?(options.includes(previous[f.label])?previous[f.label]:(options.includes(f.default)?f.default:options[0])):String(previous[f.label]??f.default??'');
      state[f.label]=value;fields.push({...f,options,value});
    };
    for(const f of config.fields||[])pick(f);
    if(config.variants){const v=config.variants[state[config.variantField]];for(const f of v?.fields||[])pick(f);if(v)config={...config,...v};}
    // Verified dependent rules only. Each rule modifies subsequent selectable choices.
    for(const rule of config.rules||[])if(matches(rule.when,state)) {
      for(const [label,options] of Object.entries(rule.options||{})){const f=fields.find(x=>x.label===label);if(f){f.options=options;f.value=options.includes(previous[label])?previous[label]:options[0];state[label]=f.value;}}
      for(const label of rule.hide||[]){const index=fields.findIndex(f=>f.label===label);if(index>=0)fields.splice(index,1);delete state[label];}
    }
    out={fields,state,quantities:config.quantities||[]};
  }
  const addSelect=(label,options)=>{const value=options.includes(previous[label])?previous[label]:options[0];out.state[label]=value;out.fields.push({label,options,value,required:true});return value;};
  const addInput=(label,type,required=false)=>{const value=String(previous[label]??'');out.state[label]=value;out.fields.push({label,type,value,required,maxLength:500});};
  if(id==='flyers') {
    if(addSelect('Mailing',['Without mailing','With mailing'])==='With mailing')addSelect('Mailing list',['I have a list','I need a list','Every Door Direct Mail']);
  }
  if(out.state.Mailing==='With mailing')addInput('Mailing details','text');
  if(p.customOnly){addInput('Project description','textarea',true);addInput('Width (in)','dimension');addInput('Height (in)','dimension');addInput('Preferred material / finish','text');}
  if(!out.fields.some(f=>f.label==='Versions')){const value=String(previous.Versions??'1');out.state.Versions=value;out.fields.push({label:'Versions',type:'integer',value,required:true,min:1,max:10000});}
  if(id==='booklets-catalogs'){const pages=out.fields.find(f=>f.label==='Page count including cover');if(pages){pages.min=out.state.Binding==='Perfect Binding'?48:8;pages.help='Including cover. '+(pages.min===48?'Perfect binding starts at 48 pages.':'Saddle-stitched booklets start at 8 pages.');}}
  return out;
}
function quantityUnit(p,choices={}){if(p.id==='stickers')return choices.Format==='Kiss-Cut Sticker Sheets'?'sheets':'stickers';return p.quantityUnit||(p.id==='notepads'?'pads':'pieces');}

function validateItem(raw) {
  const p=product(raw?.productId);if(!p)throw new Error('Please choose a product from the catalog.');
  if(!raw.choices||typeof raw.choices!=='object'||Array.isArray(raw.choices)||Object.keys(raw.choices).length>45)throw new Error('Check the product specifications.');
  const resolved=resolve(p.id,raw.choices);
  for(const field of resolved.fields){
    const value=raw.choices[field.label];
    if(typeof value!=='string'||value.length>(field.maxLength||500))throw new Error('Check '+field.label+'.');
    if(field.options && !field.options.includes(value))throw new Error('Choose an available '+field.label.toLowerCase()+'.');
    if(field.required && !value.trim())throw new Error('Complete '+field.label+'.');
    if(['dimension','integer','number'].includes(field.type)&&value!==''){
      const n=Number(value);if(p.id==='booklets-catalogs'&&field.label==='Page count including cover'&&resolved.state.Binding==='Perfect Binding'&&n<48)throw new Error('Perfect-bound booklets require at least 48 pages including cover.');if(!Number.isFinite(n)||n<=0||(field.type==='integer'&&!Number.isInteger(n))||(field.min!=null&&n<field.min)||(field.max!=null&&n>field.max))throw new Error('Check '+field.label+'.');
    }
  }
  // Inactive fields are rejected instead of silently accepting an incompatible configuration.
  for(const key of Object.keys(raw.choices))if(!(key in resolved.state))throw new Error('Your product options changed. Please update this item.');
  const quantity=Number(raw.quantity);if(!Number.isSafeInteger(quantity)||quantity<1||quantity>10000000)throw new Error('Enter a whole-number quantity between 1 and 10,000,000.');
  const versions=Number(resolved.state.Versions||1);if(!Number.isSafeInteger(versions)||versions<1||versions>10000)throw new Error('Check your artwork versions.');
  const clean=(value,max)=>{if(typeof value!=='string'||value.length>max)throw new Error('Some product details are too long.');return value.trim();};
  const breakdown=raw.quantityMode==='breakdown'||raw.artworkVersions!==undefined;
  let artworkVersions;
  if(breakdown){
    if(p.versionMode!=='breakdown'||!Array.isArray(raw.artworkVersions)||raw.artworkVersions.length!==versions)throw new Error('Check the quantity breakdown for each artwork version.');
    artworkVersions=raw.artworkVersions.map((v,i)=>{const n=Number(v?.quantity);if(!Number.isSafeInteger(n)||n<1||n>10000000)throw new Error('Enter a whole-number quantity for Version '+(i+1)+'.');return {name:clean(v.name||'',100),quantity:n};});
    const total=artworkVersions.reduce((n,v)=>n+v.quantity,0);if(total!==quantity||total>10000000)throw new Error('The total quantity must equal the quantities for all artwork versions.');
  }
  for(const prefix of ['', 'Sheet ', 'Sticker ']){const w=resolved.state[prefix+'Width (in)'],h=resolved.state[prefix+'Height (in)'];if((w&&!h)||(h&&!w))throw new Error('Enter both width and height.');}
  if(['Square','Circle'].includes(resolved.state.Shape)&&resolved.state.Size==='Custom size'&&Number(resolved.state['Width (in)'])!==Number(resolved.state['Height (in)']))throw new Error('Use matching width and height for a square or circle.');
  if(p.id==='booklets-catalogs'){
    const c=resolved.state,pages=Number(c['Page count including cover']);
    if(c.Binding==='Perfect Binding'&&pages<48)throw new Error('Perfect-bound booklets require at least 48 pages including cover.');
    if((artworkVersions?artworkVersions.some(v=>[25,50].includes(v.quantity)):[25,50].includes(quantity)) && (c['Interior paper']!=='100 lb. Gloss Book'||!['Self Cover','100 lb. Gloss Cover'].includes(c.Cover)||c.Binding!=='Saddle Stitch'||pages>40))throw new Error('For 25 or 50 booklets, choose 100 lb. Gloss Book, Self Cover or 100 lb. Gloss Cover, Saddle Stitch, and 8–40 pages. Otherwise request a custom project.');
  }
  const quantityCustom=Boolean(raw.quantityCustom)||!resolved.quantities.length||(breakdown&&versions>1);
  if(!quantityCustom && !resolved.quantities.includes(String(quantity)))throw new Error('Select an available quantity or request a custom quantity.');
  const buying=raw.buying===true;
  let currentPrice='';if(buying && raw.currentPrice!=='' && raw.currentPrice!=null){const n=Number(raw.currentPrice);if(!Number.isFinite(n)||n<0||n>100000000)throw new Error('Check your current price.');currentPrice=n.toFixed(2);}
  return {id:clean(String(raw.id||''),80),productId:p.id,product:p.name,quantity,quantityCustom,quantityMode:breakdown?'breakdown':'per-version',...(breakdown?{artworkVersions}:{}),quantityUnit:quantityUnit(p,resolved.state),choices:resolved.state,note:clean(raw.note||'',2000),buying,supplier:buying?clean(raw.supplier||'',250):'',currentPrice,buyingDetails:buying?clean(raw.buyingDetails||'',1000):'',reviewRequired:!!p.reviewRequired||quantityCustom||!!p.customOnly};
}
return {catalog,product,resolve,validateItem,quantityUnit};
});
