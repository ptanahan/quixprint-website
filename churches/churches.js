(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const products = window.QUIXPRINT_PRODUCTS, page = document.body.dataset.page;
  const CART = 'quixprint.quote-cart.v1', CONTACT = 'quixprint.quote-contact.v1';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const productURL = item => `/churches/products/${slug(item.product)}/?edit=${encodeURIComponent(item.id)}`;
  const title = item => item.product === 'Custom product' ? item.customName : item.product;
  let storageAvailable = true;
  function read(key, fallback) {
    try { return JSON.parse(sessionStorage.getItem(key)) || fallback; } catch { return fallback; }
  }
  try { sessionStorage.setItem('quixprint.test','1'); sessionStorage.removeItem('quixprint.test'); } catch { storageAvailable = false; }
  let items = read(CART,[]);
  if (!Array.isArray(items)) items = [];
  // Preserve quote items saved before this product was renamed.
  items = items.map(item => item?.product === 'Offering envelopes' ? {...item, product:'Remittance Envelopes', choices:{...item.choices, ...(item.choices?.Size === 'Standard offering envelope' ? {Size:'Standard remittance envelope'} : {})}} : item);
  items = items.filter(item => item && typeof item.id === 'string' && products.some(p => p[0] === item.product) && item.choices && typeof item.choices === 'object');
  function saveCart(next, errorTarget) {
    try { sessionStorage.setItem(CART, JSON.stringify(next)); items = next; return true; }
    catch { showError(errorTarget,'Your browser can’t save this cart. Allow browser storage and try again, or email your request to sales@quixprint.com.'); return false; }
  }
  function showError(target,message) { target.textContent = message; target.hidden = false; target.setAttribute('tabindex','-1'); target.focus(); }
  function updateNav() {
    if ($('#nav-request')) $('#nav-request').textContent = `Quote cart (${items.length})`;
    if ($('#item-count')) $('#item-count').textContent = `Quote cart: ${items.length} item${items.length === 1 ? '' : 's'}`;
    document.querySelectorAll('[data-product]').forEach(card => {
      const count = items.filter(i => i.product === card.dataset.product).length;
      card.classList.toggle('in-request',count > 0);
      if (count) card.querySelector('.product-action').innerHTML = `${count} in cart · Add more <span aria-hidden="true">+</span>`;
    });
  }
  function renderItems(editable) {
    const selected = $('#selected'); if (!selected) return;
    selected.innerHTML = items.length ? items.map(item => `<article class="request-item"><div class="request-item-heading"><h3>${escape(title(item))}</h3><span class="quantity-summary">${item.unknownQuantity ? 'Quantity: please advise' : `Qty${Number(item.choices.Versions) > 1 ? " per version" : ""}: ${Number(item.quantity).toLocaleString()}`}</span></div><p class="spec-summary">${Object.entries(item.choices).map(([k,v]) => `${escape(k)}: ${escape(v)}`).join(' · ')}</p>${item.note ? `<p class="item-note-text">${escape(item.note)}</p>` : ''}${item.currentPrice !== '' && item.currentPrice != null ? `<p class="spec-summary">Current total: $${Number(item.currentPrice).toFixed(2)} USD (shipping &amp; tax included)</p>` : ''}${item.supplier ? `<p class="spec-summary">Current supplier: ${escape(item.supplier)}</p>` : ''}${editable ? `<div class="item-actions"><a class="text-link" href="${productURL(item)}" aria-label="Edit ${escape(title(item))}">Edit</a><button class="text-button remove" data-remove="${escape(item.id)}" type="button" aria-label="Remove ${escape(title(item))}">Remove</button></div>` : ''}</article>`).join('') : '<div class="empty-request"><h3>Your quote cart is empty.</h3><p>Choose a product or tell us about an item you don’t see in the catalog.</p><a class="button" href="/churches/#request">Browse products</a><p><a class="text-link" href="/churches/products/custom-product/">Inquire about a specific product</a></p></div>';
    if ($('#checkout-link')) $('#checkout-link').hidden = !items.length;
  }
  updateNav();
  if (page === 'product') {
    const name = $('[data-product-name]').dataset.productName;
    const form = $('#product-form');
    const editId = new URLSearchParams(location.search).get('edit');
    const existing = items.find(i => i.id === editId && i.product === name);
    const custom = name === 'Custom product';
    let choices = {...existing?.choices}, resolved;
    $('#product-fields').innerHTML = `${custom ? `<label class="full">What product are you looking for? *<input name="custom_name" required maxlength="160" placeholder="For example: volunteer name badges" value="${escape(existing?.customName || '')}"></label>` : ''}<fieldset class="specification-card"><legend>Product specifications</legend><div id="spec-options" class="options"></div><p id="spec-guidance" class="field-guidance" hidden></p></fieldset><div class="quantity-section"><label id="quantity-label">Quantity *<select name="quantity" required aria-describedby="quantity-guidance"></select></label><p id="quantity-guidance" class="field-guidance">Choose the number of pieces you’d like quoted.</p></div><p id="spec-notice" class="field-guidance" role="status" aria-live="polite"></p><label class="full">${custom ? 'Product details *' : 'Item notes <span class="optional">(optional)</span>'}<textarea name="item_notes" rows="3" maxlength="2000" ${custom ? 'required' : ''} placeholder="${custom ? 'Describe the product, sizes, materials, or a link to an example.' : 'Tell us about your project or ask a question about these options.'}">${escape(existing?.note || '')}</textarea></label><fieldset class="comparison-fields"><legend>Already buying this product?</legend><p class="field-guidance">Optional: share your current pricing so we can compare the same quantity and specifications.</p><label>Current total price, including shipping and tax (USD)<input name="current_price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 245.00" value="${escape(existing?.currentPrice ?? '')}"></label><label class="full">Where are you currently buying it?<input name="supplier" maxlength="250" placeholder="Supplier name or website" value="${escape(existing?.supplier || '')}"></label></fieldset>`;
    function collectChoices() {
      const selected = {};
      form.querySelectorAll('[data-choice]').forEach(field => { selected[field.dataset.choice] = field.value.trim(); });
      return selected;
    }
    function renderSpecifications(quantity = '', changed = '') {
      const before = {...choices};
      resolved = window.quixprintSpecifications(name,choices);
      choices = resolved.state;
      $('#spec-options').innerHTML = resolved.fields.map(field => {
        const id = `spec-${slug(field.label)}`, fixed = field.options?.length === 1;
        const label = escape(field.label);
        if (field.options) return `<label for="${id}" class="spec-field">${label}${fixed ? '<span class="included-tag">Included</span>' : ''}<select id="${id}" data-choice="${label}" required ${fixed ? 'class="fixed-spec"' : ''}>${field.options.map(value => `<option value="${escape(value)}" ${value === field.value ? 'selected' : ''}>${escape(value)}</option>`).join('')}</select></label>`;
        return `<label for="${id}" class="spec-field">${label} *<input id="${id}" data-choice="${label}" required ${field.type === 'dimension' ? 'type="number" min="0.01" step="0.01" inputmode="decimal"' : field.type === 'integer' ? 'type="number" min="1" step="1" inputmode="numeric"' : 'type="text" maxlength="250"'} value="${escape(field.value)}"></label>`;
      }).join('');
      $('.specification-card').hidden = !resolved.fields.length;
      const guidance = [];
      if (choices['Mailing list'] === 'I need a list') guidance.push('In your item notes, tell us the area and audience you’d like to reach.');
      if (choices['Mailing list'] === 'I have a list') guidance.push('We’ll arrange your mailing-list transfer when we review your quote.');
      if (choices['Mailing list'] === 'Every Door Direct Mail') guidance.push('Tell us your preferred neighborhoods or carrier routes in your item notes.');
      if (choices['Cover Paper'] === 'Self Cover') guidance.push('The cover will use the same paper as the inside pages.');
      $('#spec-guidance').textContent = guidance.join(' '); $('#spec-guidance').hidden = !guidance.length;
      const quantityValid = resolved.quantities.includes(String(quantity));
      form.elements.quantity.innerHTML = '<option value="">Choose a quantity</option>'+resolved.quantities.map(value => `<option value="${value}" ${quantityValid && String(quantity) === value ? 'selected' : ''}>${Number(value).toLocaleString()}</option>`).join('');
      const versions = Object.hasOwn(choices,'Versions');
      $('#quantity-guidance').textContent = versions ? 'Quantity is per artwork version. Versions are different designs with the same specifications.' : 'Choose the number of pieces you’d like quoted.';
      const adjustments = Object.keys(before).filter(label => label !== changed && before[label] !== choices[label]);
      $('#spec-notice').textContent = quantity && !quantityValid ? 'Quantity options changed. Please choose a quantity for these specifications.' : adjustments.length ? 'The available specifications have been updated to match your selection.' : '';
      if (changed) document.getElementById(`spec-${slug(changed)}`)?.focus({preventScroll:true});
    }
    renderSpecifications(existing?.quantity || '');
    if (existing) $('#save-product').textContent = 'Save changes →';
    form.addEventListener('change',event => {
      if (event.target.matches('select[data-choice]')) {
        choices = collectChoices(); renderSpecifications(form.elements.quantity.value,event.target.dataset.choice);
      }
    });
    form.addEventListener('submit',event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      const fields = form.elements, selected = collectChoices();
      const verified = window.quixprintSpecifications(name,selected);
      if (!verified.quantities.includes(fields.quantity.value) || Object.entries(verified.state).some(([k,v]) => selected[k] !== v)) {
        choices = selected; renderSpecifications(fields.quantity.value);
        showError($('#product-error'),'Review the updated options and choose an available quantity.'); return;
      }
      const item = {id: existing?.id || crypto.randomUUID(), product:name, customName: custom ? fields.custom_name.value.trim() : '', quantity:fields.quantity.value, unknownQuantity:false, choices:verified.state, note:fields.item_notes.value.trim(), currentPrice:fields.current_price.value, supplier:fields.supplier.value.trim()};
      if (custom && (!item.customName || !item.note)) { showError($('#product-error'),'Tell us the product name and a few details so we can help.'); return; }
      const next = [...items], index = next.findIndex(i => i.id === item.id);
      if (index >= 0) next[index] = item; else next.push(item);
      if (saveCart(next,$('#product-error'))) location.assign(`/churches/cart/?${existing ? 'updated' : 'added'}=${encodeURIComponent(item.id)}`);
    });
    $('#save-product').disabled = false;
    if (!storageAvailable) showError($('#product-error'),'Your browser needs to allow storage to carry items between pages. You can also email sales@quixprint.com.');
  }
  if (page === 'cart') {
    renderItems(true);
    const params = new URLSearchParams(location.search), updated = params.has('updated');
    const changed = items.find(i => i.id === (params.get('added') || params.get('updated')));
    if (changed) { $('#cart-notice').textContent = `${title(changed)} ${updated ? 'updated' : 'added to your quote cart'}. Continue shopping or check out below.`; $('#cart-notice').hidden = false; history.replaceState(null,'',location.pathname); }
    $('#selected').addEventListener('click',event => {
      const button = event.target.closest('[data-remove]'); if (!button) return;
      const removed = items.find(i => i.id === button.dataset.remove);
      if (saveCart(items.filter(i => i.id !== button.dataset.remove),$('#cart-error'))) {
        renderItems(true); updateNav(); $('#cart-notice').textContent = `${title(removed)} removed.`; $('#cart-notice').hidden = false; $('#cart-notice').setAttribute('tabindex','-1'); $('#cart-notice').focus();
      }
    });
    if (!storageAvailable) showError($('#cart-error'),'Browser storage is unavailable. Allow storage to build your cart, or email sales@quixprint.com.');
  }
  if (page === 'checkout') {
    renderItems(false);
    const form = $('#quote-form'), heading = $('.checkout-heading');
    if (!items.length) { form.hidden = true; heading.querySelector('h1').textContent = 'Choose your products first.'; heading.querySelector('p').textContent = 'Add at least one product or a custom inquiry to request a quote.'; }
    const draft = read(CONTACT,{});
    for (const field of form.elements) if (field.name && !field.name.startsWith('_') && field.type !== 'hidden' && field.type !== 'file' && typeof draft[field.name] === 'string') field.value = draft[field.name];
    function saveDraft() {
      const draft = {}; for (const field of form.elements) if (field.name && !field.name.startsWith('_') && field.type !== 'hidden' && field.type !== 'file') draft[field.name] = field.value;
      try { sessionStorage.setItem(CONTACT,JSON.stringify(draft)); } catch { /* The form remains usable on this page. */ }
    }
    form.addEventListener('input',saveDraft); form.addEventListener('change',saveDraft);
    const fileInput = $('#artwork'), remove = $('#remove-file');
    fileInput.addEventListener('change',() => { remove.hidden = !fileInput.files.length; });
    remove.addEventListener('click',() => { fileInput.value = ''; remove.hidden = true; });
    let submitting = false;
    form.addEventListener('submit',async event => {
      event.preventDefault(); if (submitting) return; $('#form-error').hidden = true;
      if (!items.length) { showError($('#form-error'),'Add a product or custom inquiry before checking out.'); return; }
      if (!form.reportValidity()) return;
      const file = fileInput.files[0];
      if (file && file.size > 4_000_000) { $('.artwork-section').open = true; showError($('#form-error'),'This file is over 4 MB. Remove it to continue; you can provide artwork later by email.'); return; }
      if (file && !/\.(pdf|eps|jpg|jpeg|png|tif|tiff|zip)$/i.test(file.name)) { $('.artwork-section').open = true; showError($('#form-error'),'Choose a PDF, EPS, JPG, PNG, TIFF, or ZIP. ZIP AI, PSD, and InDesign files before uploading.'); return; }
      const value = key => form.elements[key]?.value?.trim() || '';
      const contact = {};
      for (const name of ['church','contact','email','phone','promoCode','recipient','address1','address2','city','state','postal','country','notes']) contact[name] = value(name);
      if (contact.phone.replace(/\D/g,'').length < 7) { showError($('#form-error'),'Enter a complete phone number.'); return; }
      if (items.length > 30) { showError($('#form-error'),'Please include up to 30 products per request.'); return; }
      // Reuse a request identifier when retrying the same saved quote after a network error.
      const fingerprint = JSON.stringify({contact,items,file:file ? {name:file.name,size:file.size,lastModified:file.lastModified} : null});
      const prior = read('quixprint.submission-attempt',null);
      const submissionId = prior?.fingerprint === fingerprint ? prior.submissionId : crypto.randomUUID();
      try { sessionStorage.setItem('quixprint.submission-attempt',JSON.stringify({fingerprint,submissionId})); } catch { /* A request can still be sent without retry persistence. */ }
      const payload = {submissionId,contact,items};
      const data = new FormData(); data.set('payload',JSON.stringify(payload));
      data.set('company_website',form.elements.company_website.value);
      if (file) data.set('attachment',file,file.name);
      saveDraft();
      submitting = true; $('#submit-button').disabled = true; $('#submit-button').textContent = 'Sending request…';
      form.setAttribute('aria-busy','true');
      try {
        const response = await fetch(form.action,{method:'POST',body:data,credentials:'same-origin',signal:AbortSignal.timeout(45000)});
        const reply = await response.json().catch(()=>null);
        if (response.status === 429) throw new Error('Too many attempts. Please wait a minute and try again. Your cart is saved.');
        if (!response.ok || !reply?.ok || !/^QXP-[A-F0-9]{8}$/.test(reply.reference || '')) throw new Error(reply?.error || 'The email service did not confirm your request. Please try again or email churches@quixprint.com.');
        const reference=reply.reference;
        try { sessionStorage.setItem('quixprint.pending-submission',JSON.stringify({reference,cart:items}));sessionStorage.removeItem('quixprint.submission-attempt'); } catch { /* Confirmation still renders below. */ }
        const remaining = [];
        try { sessionStorage.setItem(CART,JSON.stringify(remaining)); items=remaining; updateNav(); } catch { /* A successful send must still be acknowledged. */ }
        $('.checkout-layout').hidden=true; heading.hidden=true;
        const receipt=document.createElement('section');receipt.className='preview-result';receipt.tabIndex=-1;
        receipt.innerHTML=`<span class="eyebrow">REQUEST SUBMITTED</span><h2>Thank you. We’ll take it from here.</h2><p>Your request has been submitted to our church printing team. We’ll review your specifications and reply by email.</p><p>Reference: <strong>${escape(reference)}</strong></p><p>Questions? <a class="text-link" href="mailto:churches@quixprint.com">churches@quixprint.com</a></p><a class="button" href="/churches/">Browse products</a>`;
        $('.flow-page').append(receipt);receipt.focus();receipt.scrollIntoView({behavior:'smooth',block:'start'});
      } catch (error) {
        submitting=false; $('#submit-button').disabled=false; $('#submit-button').textContent='Submit quote request →';
        showError($('#form-error'),error.name === 'TimeoutError' ? 'The request timed out. Your cart is saved. Please try again.' : error.message || 'We couldn’t send your request. Please try again.');
      } finally { form.removeAttribute('aria-busy'); }
    });
    $('#submit-button').disabled = false;
  }
  if (page === 'thanks') {
    const reference = new URLSearchParams(location.search).get('reference');
    const pending = read('quixprint.pending-submission',null);
    if (reference && reference === pending?.reference) {
      $('#confirmation').innerHTML = `<span class="eyebrow">REQUEST SUBMITTED</span><h1>Thank you. We’ll take it from here.</h1><p>Your quote request has been submitted to our church printing team. We’ll review your specifications and reply by email.</p><p>Reference: <strong>${escape(reference)}</strong></p><p>Questions? Email <a class="text-link" href="mailto:churches@quixprint.com">churches@quixprint.com</a>.</p><a class="button" href="/churches/">Browse products</a>`;
      // Preserve any items added in another tab after submission.
      const submitted = new Map(pending.cart.map(item => [item.id,JSON.stringify(item)]));
      const remaining = items.filter(item => submitted.get(item.id) !== JSON.stringify(item));
      try { sessionStorage.setItem(CART,JSON.stringify(remaining)); items = remaining; } catch { /* The receipt stays readable. */ }
      updateNav();
    }
  }
})();
