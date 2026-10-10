import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('data/catalog.json'));
const research=JSON.parse(fs.readFileSync('research/gotprint.json'));
const ids={'catalogs':'booklets-catalogs','posters':'bulk-posters'};
for(const source of research.products){
 const p=catalog.products.find(p=>p.id===(ids[source.slug]||source.slug));if(!p)throw new Error(source.slug);
 const labels=Object.fromEntries(source.fields.map(f=>[f.key,f.label]));
 const fields=source.fields.filter(f=>!['corners','centerSplit'].includes(f.key)).map(f=>{
  const out={label:f.label,required:true};if(f.values?.length)out.options=f.values.map(String);else out.type=f.type||'text';
  if(f.show_when)out.when=Object.fromEntries(Object.entries(f.show_when).map(([k,v])=>[labels[k],v]));
  if(f.options_by)out.optionsBy={...f.options_by,field:labels[f.options_by.field]};
  if(f.key==='specialtyFinish')out.optionsBy={field:'Paper',values:{'16 pt. Premium Matte Cover':['None','Raised UV','Raised Foil']},fallback:['None']};
  if(f.key==='pageCount'){out.min=8;out.max=96;out.help='Include the cover in your page count. We’ll confirm the final pagination.';}
  return out;
 });
 if(p.id==='greeting-cards')fields.push({label:'Matching envelopes',options:['Not needed','Please include in my quote'],required:true});
 p.config={fields,quantityMode:'requested'};p.reviewRequired=true;p.sources=[source.source_url];p.sourceStatus=source.verification;p.manualReview=source.manual_review;p.facts=source.facts.filter(f=>!f.includes('vendor')&&!f.includes('General product')&&!f.includes('Quote quantity'));
 if(p.id==='notepads')p.quantityUnit='pads';
}
catalog.products.find(p=>p.id==='remittance-envelopes').image='/assets/products/remittance-envelopes.webp';
fs.writeFileSync('data/catalog.json',JSON.stringify(catalog,null,2));
