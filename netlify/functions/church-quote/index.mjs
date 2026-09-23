import { createHash } from 'node:crypto';

const MAX_FILE = 4_000_000;
const MAX_REQUEST = 4_200_000;
const RECIPIENT = 'churches@quixprint.com';
const PRODUCTS = new Set(['Flag banners','X-frame banners','Outdoor banners','Retractable banners with stand','Yard signs','Posters','Window decals','Postcards','Door hangers','Flyers','Brochures','Remittance Envelopes','Letterheads','Presentation folders','Christmas Cards','Easter Cards','Calendars','Custom product','Stickers']);
const EXTENSIONS = /\.(pdf|eps|jpg|jpeg|png|tif|tiff|zip)$/i;
const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const font = "font-family:'Times New Roman',Times,serif;";
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const result = (status,body) => Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class Invalid extends Error {}
function text(value,label,max=250,required=true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Invalid(`Please check ${label}.`);
  return value.trim().replace(/\r\n?/g,'\n');
}
function validate(raw) {
  if (!raw || !UUID.test(raw.submissionId || '')) throw new Invalid('Refresh the page and try again.');
  const contact = {};
  const limits = {church:160,contact:120,email:254,phone:40,recipient:160,address1:200,address2:160,city:100,state:100,postal:20,country:100,notes:4000};
  for (const [key,max] of Object.entries(limits)) contact[key] = text(raw.contact?.[key] ?? '',key,max,!['address2','notes'].includes(key));
  if (!EMAIL.test(contact.email) || /[\r\n]/.test(contact.email)) throw new Invalid('Enter a valid email address.');
  if (contact.phone.replace(/\D/g,'').length < 7) throw new Invalid('Enter a complete phone number.');
  if (!Array.isArray(raw.items) || !raw.items.length || raw.items.length > 30) throw new Invalid('Include between 1 and 30 products per request.');
  const items=raw.items.map(item=>{
    if (!item || !PRODUCTS.has(item.product)) throw new Invalid('One of your products is unavailable. Please add it again.');
    const quantity=Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity<1 || quantity>10000000) throw new Invalid('Choose a valid quantity for every product.');
    if (!item.choices || Array.isArray(item.choices) || typeof item.choices!=='object') throw new Invalid('Check your product specifications.');
    const entries=Object.entries(item.choices);
    if (entries.length>35) throw new Invalid('Too many specifications for a product.');
    const choices=Object.fromEntries(entries.map(([label,value])=>[text(label,'specification',80),text(value,'specification value',300)]));
    if (choices.Versions && (!Number.isSafeInteger(Number(choices.Versions)) || Number(choices.Versions)<1 || Number(choices.Versions)>10000)) throw new Invalid('Check the number of artwork versions.');
    let currentPrice='';
    if (item.currentPrice !== '' && item.currentPrice != null) {
      const price=Number(item.currentPrice);
      if (!Number.isFinite(price) || price<0 || price>100000000) throw new Invalid('Check the current price.');
      currentPrice=price.toFixed(2);
    }
    const custom=item.product==='Custom product';
    return {product:item.product,customName:text(item.customName??'','custom product name',160,custom),quantity,choices,note:text(item.note??'','product notes',2000,custom),supplier:text(item.supplier??'','supplier',250,false),currentPrice};
  });
  return {submissionId:raw.submissionId,contact,items};
}
export function renderEmail(quote,reference,filename) {
  const c=quote.contact;
  const sections=[
    ['Request',[c.church,`Reference: ${reference}`,`${quote.items.length} product${quote.items.length===1?'':'s'}`]],
    ['Contact',[`Name: ${c.contact}`,`Email: ${c.email}`,`Phone: ${c.phone}`]],
    ['Shipping',[c.recipient,c.address1,c.address2,`${c.city}, ${c.state} ${c.postal}`,c.country].filter(Boolean)]
  ];
  quote.items.forEach((item,i)=>{
    const multiple=Number(item.choices.Versions)>1;
    const lines=[`Quantity: ${item.quantity.toLocaleString('en-US')} pieces${multiple?' per artwork version':''}`,...Object.entries(item.choices).filter(([k,v])=>!(k==='Versions'&&Number(v)===1)).map(([k,v])=>`${k}: ${v}`)];
    if(multiple)lines.push(`Total pieces: ${(item.quantity*Number(item.choices.Versions)).toLocaleString('en-US')}`);
    if(item.note)lines.push(`Notes: ${item.note}`);
    if(item.currentPrice!=='')lines.push(`Current price: ${Number(item.currentPrice).toLocaleString('en-US',{style:'currency',currency:'USD'})} USD including shipping and tax`);
    if(item.supplier)lines.push(`Supplier: ${item.supplier}`);
    sections.push([`${i+1}. ${item.product==='Custom product'?item.customName:item.product}`,lines]);
  });
  sections.push(['Artwork',[filename?`Attached: ${filename}`:'Artwork will follow. No file attached.']]);
  if(c.notes)sections.push(['Project notes',[c.notes]]);
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Church printing quote request</title></head><body style="margin:0;padding:24px 16px;background:#fff;color:#202020;${font}"><main style="max-width:640px;margin:0 auto;${font}"><h1 style="margin:0 0 24px;font-size:26px;line-height:1.25;${font}">Church printing quote request</h1>${sections.map(([heading,lines])=>`<section style="margin:0 0 24px;padding:0 0 20px;border-bottom:1px solid #dedede;${font}"><h2 style="margin:0 0 10px;font-size:20px;line-height:1.3;${font}">${escape(heading)}</h2><div style="font-size:18px;line-height:1.5;overflow-wrap:anywhere;${font}">${lines.map(line=>{const colon=line.indexOf(':');return colon>0&&colon<65?`<strong>${escape(line.slice(0,colon+1))}</strong>${escape(line.slice(colon+1)).replace(/\n/g,'<br>')}`:escape(line).replace(/\n/g,'<br>');}).join('<br>')}</div></section>`).join('')}<p style="font-size:16px;${font}">Quixprint · Church printing</p></main></body></html>`;
  return {html,text:sections.map(([title,lines])=>title+'\n'+lines.join('\n')).join('\n\n')};
}
export default async function handler(request) {
  if(request.method!=='POST')return result(405,{error:'Use the quote form to submit a request.'});
  const allowed=new Set(['https://quixprint.com','https://www.quixprint.com',process.env.URL,process.env.CHURCH_QUOTE_ALLOWED_ORIGIN].filter(Boolean).map(url=>{try{return new URL(url).origin;}catch{return '';}}));
  if(!allowed.has(request.headers.get('origin')))return result(403,{error:'Submit your request from the Quixprint website.'});
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return result(415,{error:'Submit using the quote form.'});
  if(Number(request.headers.get('content-length'))>MAX_REQUEST)return result(413,{error:'This upload is too large. Use a file under 4 MB or send artwork later.'});
  try {
    // Bound the complete stream as well as the optional Content-Length header.
    const chunks=[];let length=0;
    const reader=request.body?.getReader();if(!reader)return result(400,{error:'No quote details received.'});
    while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>MAX_REQUEST){await reader.cancel();return result(413,{error:'This upload is too large. Use a file under 4 MB or send artwork later.'});}chunks.push(value);}
    const body=Buffer.concat(chunks);
    const form=await new Response(body,{headers:{'Content-Type':request.headers.get('content-type')}}).formData();
    if(String(form.get('company_website')||'').trim())return result(400,{error:'We couldn’t submit this request. Email churches@quixprint.com for help.'});
    const payload=form.get('payload');if(typeof payload!=='string'||payload.length>150000)throw new Invalid('The quote details are too large. Split this into smaller requests.');
    let raw;try{raw=JSON.parse(payload);}catch{throw new Invalid('The quote details could not be read. Please try again.');}
    const quote=validate(raw);
    const attachment=form.get('attachment');let filename='',bytes;
    if(attachment&&typeof attachment!=='string'&&attachment.size){
      if(attachment.size>MAX_FILE)return result(413,{error:'Artwork must be under 4 MB. Send a smaller file or provide it later by email.'});
      if(!EXTENSIONS.test(attachment.name))throw new Invalid('Choose a PDF, EPS, JPG, PNG, TIFF, or ZIP. ZIP AI, PSD, and InDesign files before uploading.');
      filename=attachment.name.replace(/[\r\n\u0000-\u001f/\\]/g,'_').slice(0,180);
      bytes=Buffer.from(await attachment.arrayBuffer());
    }
    const key=process.env.BREVO_API_KEY,from=process.env.CHURCH_QUOTE_FROM || '';
    const senderMatch=from.match(/^([^<>]+)\s*<([^<>]+)>$/);
    const sender={name:senderMatch ? senderMatch[1].trim() : 'Quixprint Churches',email:senderMatch ? senderMatch[2].trim() : from.trim()};
    if(!key||/[\r\n]/.test(from)||!EMAIL.test(sender.email))return result(503,{error:'Online requests are not available yet. Your cart is saved. Please email churches@quixprint.com.'});
    const reference='QXP-'+quote.submissionId.slice(0,8).toUpperCase();
    const email=renderEmail(quote,reference,filename);
    // UUID v5 derived from the complete request prevents a changed attachment
    // from sharing a retry key. Brevo receives this key in JSON email headers.
    const digest=createHash('sha256').update(JSON.stringify(quote)).update(filename).update(bytes||'').digest('hex');
    const uuidBytes=createHash('sha1').update(Buffer.from('6ba7b8119dad11d180b400c04fd430c8','hex')).update('quixprint-church-quote:'+digest).digest().subarray(0,16);
    uuidBytes[6]=(uuidBytes[6]&0x0f)|0x50;uuidBytes[8]=(uuidBytes[8]&0x3f)|0x80;
    const hex=uuidBytes.toString('hex');
    const idempotencyKey=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
    const mail={sender,to:[{email:RECIPIENT,name:'Quixprint Churches'}],replyTo:{email:quote.contact.email},subject:`Church quote — ${quote.contact.church.replace(/[\r\n]/g,' ')} — ${reference}`,htmlContent:email.html,textContent:email.text,headers:{idempotencyKey}};
    if(bytes)mail.attachment=[{name:filename,content:bytes.toString('base64')}];
    let response;
    try{response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(mail),signal:AbortSignal.timeout(25000)});}catch{return result(502,{error:'The email service did not confirm your request. Your cart is saved; please try again.'});}
    const data=await response.json().catch(()=>null);
    if(!response.ok && data?.code==='duplicate_parameter')return result(409,{error:`A matching request may already be processing. Your cart is saved. Please email churches@quixprint.com with reference ${reference} before submitting again.`});
    if(response.status===429)return result(503,{error:'Online requests are temporarily busy. Your cart is saved. Please try again later or email churches@quixprint.com.'});
    if(!response.ok||typeof data?.messageId!=='string'||!data.messageId.trim()){console.error('Church quote email rejected',{status:response.status,reference});return result(502,{error:'We couldn’t confirm your request. Your cart is saved. Please try again or email churches@quixprint.com.'});}
    return result(200,{ok:true,reference});
  } catch(error) {
    if(error instanceof Invalid)return result(400,{error:error.message});
    console.error('Church quote processing error',{type:error?.name||'Error'});
    return result(400,{error:'We couldn’t read this request. Your cart is saved. Please try again.'});
  }
}

// Protect the quote endpoint without adding a CAPTCHA to the visitor's form.
export const config = {path:'/churches/api/quote',rateLimit:{windowLimit:10,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
