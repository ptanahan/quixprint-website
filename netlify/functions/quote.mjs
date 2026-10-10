import {createHash} from 'node:crypto';
import engine from '../../lib/engine.js';
import emailRenderer from '../../lib/email.js';
const MAX_FILE=3_000_000,MAX_REQUEST=3_400_000;
const EMAIL=/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/,UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reply=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function validate(raw){
 if(!raw||!UUID.test(raw.submissionId||''))throw new Error('Refresh the page and try again.');
 const limits={company:160,contact:120,email:254,phone:40,recipient:160,address1:200,address2:160,city:100,state:100,postal:20,country:100,promoCode:64,deliveryDate:10,notes:4000};
 const optional=new Set(['address2','promoCode','deliveryDate','notes']);const contact={};
 for(const [key,max] of Object.entries(limits)){const v=raw.contact?.[key]??'';if(typeof v!=='string'||v.length>max||(!optional.has(key)&&!v.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw new Error('Please check '+key+'.');contact[key]=v.trim();}
 if(!EMAIL.test(contact.email)||/[\r\n]/.test(contact.email))throw new Error('Enter a valid email address.');
 if(contact.phone.replace(/\D/g,'').length<7)throw new Error('Enter a complete phone number.');
 if(contact.deliveryDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(contact.deliveryDate)||new Date(contact.deliveryDate).toISOString().slice(0,10)!==contact.deliveryDate))throw new Error('Enter a valid requested delivery date.');
 if(!Array.isArray(raw.items)||raw.items.length<1||raw.items.length>30)throw new Error('Include between 1 and 30 products.');
 const items=raw.items.map(engine.validateItem);return {submissionId:raw.submissionId,contact,items};
}
export function validateAttachment(name,bytes){
 if(bytes.length>MAX_FILE)throw new Error('Artwork must be under 3 MB. You can send a larger file later.');
 const ext=name.toLowerCase().split('.').pop();const hex=bytes.subarray(0,8).toString('hex');
 const valid={pdf:bytes.subarray(0,5).toString()==='%PDF-',jpg:hex.startsWith('ffd8ff'),jpeg:hex.startsWith('ffd8ff'),png:hex==='89504e470d0a1a0a',tif:hex.startsWith('49492a00')||hex.startsWith('4d4d002a'),tiff:hex.startsWith('49492a00')||hex.startsWith('4d4d002a'),zip:hex.startsWith('504b0304')||hex.startsWith('504b0506')};
 if(!valid[ext])throw new Error('The artwork file does not match a supported PDF, image, or ZIP format. Export it again, or send artwork later.');
 return name.replace(/[\r\n\u0000-\u001f/\\]/g,'_').slice(-170);
}
function dedupe(value){const b=createHash('sha256').update(value).digest().subarray(0,16);b[6]=(b[6]&15)|0x40;b[8]=(b[8]&63)|0x80;const h=b.toString('hex');return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');}
async function send(mail,key){const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(mail),signal:AbortSignal.timeout(20000)});const data=await r.json().catch(()=>null);if(!r.ok&&data?.code==='duplicate_parameter')return true;if(!r.ok||!data?.messageId)throw new Error('Email provider did not confirm acceptance');return true;}
export default async function handler(request,context){
 if(request.method!=='POST')return reply(405,{error:'Use the quote form to submit a request.'});
 const production=process.env.SITE_MODE==='live'&&process.env.QUOTE_MODE==='live'&&context?.deploy?.context==='production';
 const origin=request.headers.get('origin');const allowed=new Set(['https://quixprint.com','https://www.quixprint.com']);
 if(!production)for(const v of [process.env.URL,process.env.DEPLOY_PRIME_URL,process.env.DEPLOY_URL,process.env.QUOTE_ALLOWED_ORIGIN]){try{if(v)allowed.add(new URL(v).origin)}catch{}}
 if(!allowed.has(origin))return reply(403,{error:'Submit your request from the Quixprint website.'});
 const contentType=request.headers.get('content-type')||'';if(!contentType.startsWith('multipart/form-data'))return reply(415,{error:'Submit using the quote form.'});
 if(Number(request.headers.get('content-length'))>MAX_REQUEST)return reply(413,{error:'The upload is too large. Use a file under 3 MB.'});
 let quote,filename='',bytes=null;
 try{
  const reader=request.body?.getReader();if(!reader)throw new Error('No request received.');let count=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>MAX_REQUEST){await reader.cancel();return reply(413,{error:'The upload is too large. Use a file under 3 MB.'});}chunks.push(value);}
  const form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':contentType}}).formData();if(String(form.get('company_website')||'').trim())throw new Error('We couldn’t process the form. Email sales@quixprint.com for help.');
  const payload=form.get('payload');if(typeof payload!=='string'||payload.length>200000)throw new Error('The request is too large. Split it into smaller projects.');quote=validate(JSON.parse(payload));
  const file=form.get('attachment');if(file&&typeof file!=='string'&&file.size){if(file.size>MAX_FILE)throw new Error('Artwork must be under 3 MB.');bytes=Buffer.from(await file.arrayBuffer());filename=validateAttachment(file.name,bytes);}
 }catch(e){return reply(400,{error:e instanceof SyntaxError?'We couldn’t read the quote. Please try again.':e.message||'Please check the form and try again.'});}
 const reference=(production?'QXP-':'PREVIEW-')+quote.submissionId.replaceAll('-','').slice(0,12).toUpperCase();
 if(!production)return reply(200,{ok:true,preview:true,reference,confirmationSent:false});
 const key=process.env.BREVO_API_KEY,rawFrom=process.env.QUOTE_FROM||process.env.CHURCH_QUOTE_FROM||'';const matched=rawFrom.match(/<([^<>]+)>/);const from=(matched?matched[1]:rawFrom).trim();
 if(!key||!EMAIL.test(from)||/[\r\n]/.test(rawFrom))return reply(503,{error:'Online requests are unavailable. Your quote is saved. Please email sales@quixprint.com.'});
 const sender={name:'Quixprint',email:from};const baseHash=createHash('sha256').update(JSON.stringify(quote)).update(filename).update(bytes||'').digest('hex');const team=emailRenderer.render(quote,reference,filename,false),customer=emailRenderer.render(quote,reference,filename,true);
 const teamMail={sender,to:[{email:'quotes@quixprint.com',name:'Quixprint'}],replyTo:{email:quote.contact.email,name:quote.contact.contact.replace(/[\r\n]/g,' ')},subject:`Quote request — ${quote.contact.company.replace(/[\r\n]/g,' ')} — ${reference}`,htmlContent:team.html,textContent:team.text,headers:{idempotencyKey:dedupe(baseHash+':team')}};
 if(bytes)teamMail.attachment=[{name:filename,content:bytes.toString('base64')}];
 try{await send(teamMail,key)}catch{console.error('Quote notification unconfirmed',{reference});return reply(502,{error:`We couldn’t confirm receipt. Your quote is saved. Try again, or email sales@quixprint.com with reference ${reference}.`});}
 let confirmationSent=false;try{confirmationSent=await send({sender,to:[{email:quote.contact.email,name:quote.contact.contact.replace(/[\r\n]/g,' ')}],replyTo:{email:'sales@quixprint.com',name:'Quixprint'},subject:`Your Quixprint request — ${reference}`,htmlContent:customer.html,textContent:customer.text,headers:{idempotencyKey:dedupe(baseHash+':customer')}},key)}catch{console.error('Quote confirmation unconfirmed',{reference});}
 return reply(200,{ok:true,preview:false,reference,confirmationSent});
}
export const config={path:'/api/quote',rateLimit:{windowLimit:8,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
