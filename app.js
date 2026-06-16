/* ===== CONSTANTS ===== */
const CO = {
  name: 'NAMAN SCALE',
  addr: '1st Floor, Shop No. 9, New Sanatan Dharam Market,\nLaxman Mandir, Bharatpur (Raj.) 321001',
  gstin: '08ASYPA0441K1ZK', pan: 'ASYPA0441K',
  email: 'anilnaman44@gmail.com', phone: '+91 99821 29592'
};
const BK = { name: 'Naman Scale', bank: 'HDFC Bank', acc: '50200064524792', ifsc: 'HDFC0001055' };
let taxMode = 'intra', idc = 0, itemType = 'standard', gstEnabled = false;

/* ===== WEIGHBRIDGE ITEMS ===== */
const WB_ITEMS = [
  { id: 'joists',   name: 'JOISTS',                      dim: true,  dimHint: 'e.g. 18m × 3m' },
  { id: 'gattu',    name: 'GATTU JOISTS',                dim: true,  dimHint: 'e.g. 18m × 3m' },
  { id: 'plates',   name: 'PLATES',                      dim: true,  dimHint: 'Dimensions' },
  { id: 'loadcell', name: 'LOAD CELL',                   dim: false },
  { id: 'grount',   name: 'GROUTING PLATE',              dim: false },
  { id: 'mounting', name: 'MOUNTING PLATE',              dim: false },
  { id: 'junction', name: 'JUNCTION BOX',                dim: false },
  { id: 'it',       name: 'INTELLIGENT TERMINAL (I.T.)', dim: false },
  { id: 'cable',    name: 'STANDARD CABLE',              dim: true,  dimHint: 'Length (e.g. 30m)' },
  { id: 'printer',  name: 'PRINTER',                     dim: false },
  { id: 'display',  name: 'EXTRA DISPLAY',               dim: false },
];

function initWBTable() {
  const tb = document.getElementById('wb-body');
  tb.innerHTML = WB_ITEMS.map(it => `
    <tr id="wbrow-${it.id}" style="opacity:.35;transition:opacity .15s">
      <td style="text-align:center">
        <input type="checkbox" id="wbck-${it.id}" onchange="toggleWB('${it.id}')"
               style="width:17px;height:17px;cursor:pointer;accent-color:#111">
      </td>
      <td style="font-weight:600;font-size:12px">${it.name}</td>
      <td><input type="number" id="wbq-${it.id}" value="1" min="0" step="any"
                 style="width:56px" disabled></td>
      <td><input type="text" id="wbd-${it.id}"
                 placeholder="${it.dim ? it.dimHint : '—'}"
                 ${!it.dim ? 'disabled style="background:transparent;border-color:transparent;color:#ccc;pointer-events:none"' : 'disabled'}></td>
    </tr>`).join('');
}

function toggleWB(id) {
  const on = document.getElementById('wbck-' + id).checked;
  document.getElementById('wbrow-' + id).style.opacity = on ? '1' : '.35';
  const q = document.getElementById('wbq-' + id); if (q) q.disabled = !on;
  const item = WB_ITEMS.find(i => i.id === id);
  if (item && item.dim) { const d = document.getElementById('wbd-' + id); if (d) d.disabled = !on; }
}

function setItemType(type) {
  itemType = type;
  document.getElementById('std-btn').classList.toggle('on', type === 'standard');
  document.getElementById('wb-btn').classList.toggle('on', type === 'weighbridge');
  document.getElementById('std-section').style.display = type === 'standard' ? '' : 'none';
  document.getElementById('wb-section').style.display = type === 'weighbridge' ? '' : 'none';
  document.getElementById('scope-card').style.display = type === 'weighbridge' ? '' : 'none';
  calcTotals();
}

/* ===== GST TOGGLE ===== */
function setGST(enabled) {
  gstEnabled = enabled;
  document.getElementById('gst-on-btn').classList.toggle('on', enabled);
  document.getElementById('gst-off-btn').classList.toggle('on', !enabled);
  const show = enabled ? 'table-row' : 'none';
  document.getElementById('s-subtotal-row').style.display = show;
  document.getElementById('s-gst-row').style.display      = show;
  document.getElementById('s-divrow').style.display       = show;
  calcTotals();
}

/* ===== INIT ===== */
window.onload = () => {
  document.getElementById('q-date').value = new Date().toISOString().split('T')[0];
  initWBTable();
  addItem();
};

/* ===== ITEMS ===== */
function autoResizeDesc(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function addDescLine(id, type) {
  const ta = document.getElementById('d' + id);
  const val = ta.value;
  const lines = val.split('\n');
  let prefix;
  if (type === 'bullet') {
    prefix = '• ';
  } else {
    const count = lines.filter(l => /^\d+\./.test(l.trim())).length;
    prefix = (count + 1) + '. ';
  }
  ta.value = val + (val && !val.endsWith('\n') ? '\n' : '') + prefix;
  autoResizeDesc(ta);
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
}

function handleDescKey(e, id) {
  const ta = e.target;
  const pos = ta.selectionStart;
  const val = ta.value;
  const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
  const currentLine = val.substring(lineStart, pos);

  const bulletMatch = currentLine.match(/^(• )(.*)/);
  const numberMatch = currentLine.match(/^(\d+)\. (.*)/);

  if (e.key === 'Enter' && (bulletMatch || numberMatch)) {
    e.preventDefault();
    if (bulletMatch) {
      if (!bulletMatch[2].trim()) {
        // Empty bullet — exit list
        ta.value = val.substring(0, lineStart) + val.substring(lineStart + 2);
        ta.selectionStart = ta.selectionEnd = lineStart;
      } else {
        const ins = '\n• ';
        ta.value = val.substring(0, pos) + ins + val.substring(pos);
        ta.selectionStart = ta.selectionEnd = pos + ins.length;
      }
    } else {
      const num = parseInt(numberMatch[1]);
      if (!numberMatch[2].trim()) {
        // Empty numbered line — exit list
        const prefixLen = String(num).length + 2;
        ta.value = val.substring(0, lineStart) + val.substring(lineStart + prefixLen);
        ta.selectionStart = ta.selectionEnd = lineStart;
      } else {
        const ins = '\n' + (num + 1) + '. ';
        ta.value = val.substring(0, pos) + ins + val.substring(pos);
        ta.selectionStart = ta.selectionEnd = pos + ins.length;
      }
    }
    autoResizeDesc(ta);
  }

  if (e.key === 'Backspace' && (bulletMatch || numberMatch)) {
    const content = bulletMatch ? bulletMatch[2] : numberMatch[2];
    if (!content) {
      // Cursor right after prefix with no content — remove prefix
      e.preventDefault();
      const prefixLen = bulletMatch ? 2 : String(numberMatch[1]).length + 2;
      ta.value = val.substring(0, lineStart) + val.substring(lineStart + prefixLen);
      ta.selectionStart = ta.selectionEnd = lineStart;
      autoResizeDesc(ta);
    }
  }
}

function addItem() {
  idc++;
  const id = idc, tb = document.getElementById('items-body');
  const tr = document.createElement('tr'); tr.id = 'row' + id;
  tr.innerHTML = `
    <td style="text-align:center;color:var(--gray-400);font-size:11px">${tb.rows.length + 1}</td>
    <td>
      <input type="text" id="n${id}" placeholder="Item name" oninput="calcTotals()">
      <div class="desc-wrap">
        <div class="desc-btns">
          <button type="button" class="desc-pt-btn" onclick="addDescLine(${id},'bullet')">• Bullet</button>
          <button type="button" class="desc-pt-btn" onclick="addDescLine(${id},'number')">1. Number</button>
        </div>
        <textarea id="d${id}" class="desc-in" placeholder="Description points…" oninput="autoResizeDesc(this)" onkeydown="handleDescKey(event,${id})"></textarea>
      </div>
    </td>
    <td><input type="text" id="h${id}" placeholder="—" style="width:82px"></td>
    <td><input type="number" id="q${id}" value="1" min="0" step="any" oninput="calcTotals()" style="width:58px"></td>
    <td><select id="u${id}" style="width:66px">
      <option>Nos</option><option>Set</option><option>Piece</option>
      <option>Kg</option><option>Gram</option><option>Meter</option><option>Box</option><option>Pair</option>
    </select></td>
    <td><input type="number" id="rt${id}" min="0" step="any" placeholder="0.00" oninput="calcTotals()"></td>
    <td class="c" id="tt${id}">₹0.00</td>
    <td class="act"><button class="del-btn" onclick="delItem(${id})" title="Remove">×</button></td>`;
  tb.appendChild(tr); renum();
}

function delItem(id) { const r = document.getElementById('row' + id); if (r) r.remove(); renum(); calcTotals(); }
function renum() { document.querySelectorAll('#items-body tr').forEach((r, i) => r.querySelector('td:first-child').textContent = i + 1); }
function ids() { return Array.from(document.querySelectorAll('#items-body tr')).map(r => +r.id.slice(3)); }

function calcTotals() {
  let grand = 0;
  if (itemType === 'standard') {
    ids().forEach(id => {
      const qty  = parseFloat(document.getElementById('q'  + id)?.value) || 0;
      const rate = parseFloat(document.getElementById('rt' + id)?.value) || 0;
      const tot = qty * rate; grand += tot;
      const el = document.getElementById('tt' + id);
      if (el) el.textContent = '₹' + tot.toFixed(2);
    });
  } else {
    const qty  = parseFloat(document.getElementById('wb-item-qty')?.value)  || 0;
    const rate = parseFloat(document.getElementById('wb-item-rate')?.value) || 0;
    grand = qty * rate;
    const el = document.getElementById('wb-item-total');
    if (el) el.textContent = '₹' + grand.toFixed(2);
  }
  const gstAmt = gstEnabled ? grand * 0.18 : 0;
  const grandTotal = grand + gstAmt;
  if (gstEnabled) {
    document.getElementById('s-subtotal').textContent = '₹' + grand.toFixed(2);
    document.getElementById('s-gst').textContent      = '₹' + gstAmt.toFixed(2);
  }
  document.getElementById('s-grand').textContent = '₹' + grandTotal.toFixed(2);
  document.getElementById('s-words').textContent = n2w(grandTotal);
}

/* ===== NUMBER TO WORDS ===== */
function n2w(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two   = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  const three = n => !n ? '' : n < 100 ? two(n) : ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '');
  if (!num) return 'Zero Rupees Only';
  let ip = Math.floor(num), dec = Math.round((num - ip) * 100), r = '';
  const cr = Math.floor(ip / 1e7); ip %= 1e7;
  const lk = Math.floor(ip / 1e5); ip %= 1e5;
  const th = Math.floor(ip / 1e3); ip %= 1e3;
  if (cr) r += three(cr) + ' Crore ';
  if (lk) r += two(lk)   + ' Lakh ';
  if (th) r += two(th)   + ' Thousand ';
  if (ip) r += three(ip);
  r = r.trim() + ' Rupees';
  if (dec > 0) r += ' and ' + two(dec) + ' Paise';
  return r + ' Only';
}

function fmtDate(s) {
  if (!s) return '';
  return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}
function esc(s) { if (!s) return ''; return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ===== GENERATE ===== */
function generate() {
  const qn  = document.getElementById('q-num').value.trim()    || '—';
  const qd  = fmtDate(document.getElementById('q-date').value);
  const ref = document.getElementById('q-ref').value.trim();
  const cn  = document.getElementById('c-name').value.trim();
  const cg  = document.getElementById('c-gstin').value.trim();
  const ca  = document.getElementById('c-addr').value.trim();
  const cda = document.getElementById('c-daddr').value.trim();
  const cp  = document.getElementById('c-person').value.trim();
  const cph = document.getElementById('c-phone').value.trim();

  if (!cn || !ca) { alert('Please fill in Client Name and Address.'); return; }

  const allIds = ids();
  if (itemType === 'standard' && !allIds.length) { alert('Please add at least one item.'); return; }
  if (itemType === 'weighbridge') {
    const rate = parseFloat(document.getElementById('wb-item-rate')?.value) || 0;
    if (!rate) { alert('Please enter the Weighbridge rate.'); return; }
  }

  let items;
  if (itemType === 'standard') {
    items = allIds.map((id, i) => {
      const qty  = parseFloat(document.getElementById('q'  + id)?.value) || 0;
      const rate = parseFloat(document.getElementById('rt' + id)?.value) || 0;
      const name = document.getElementById('n' + id)?.value.trim() || '—';
      const desc = document.getElementById('d' + id)?.value.trim() || '';
      const hsn  = document.getElementById('h' + id)?.value.trim() || '';
      const unit = document.getElementById('u' + id)?.value || 'Nos';
      return { no: i + 1, name, desc, hsn, qty, unit, rate, tot: qty * rate };
    });
  } else {
    const wbName = document.getElementById('wb-item-name')?.value.trim() || 'WEIGHBRIDGE';
    const wbQty  = parseFloat(document.getElementById('wb-item-qty')?.value)  || 0;
    const wbUnit = document.getElementById('wb-item-unit')?.value || 'Nos';
    const wbRate = parseFloat(document.getElementById('wb-item-rate')?.value) || 0;
    items = [{ no: 1, name: wbName, desc: '', hsn: '', qty: wbQty, unit: wbUnit, rate: wbRate, tot: wbQty * wbRate }];
  }

  const subTotal = items.reduce((s, i) => s + i.tot, 0);
  const gstAmt   = gstEnabled ? subTotal * 0.18 : 0;
  const gt       = subTotal + gstAmt;
  const terms = document.getElementById('q-terms').value.trim().split('\n').filter(t => t.trim());
  const notes = document.getElementById('q-notes').value.trim();
  const scap  = document.getElementById('spec-cap').value.trim();
  const splat = document.getElementById('spec-plat').value.trim();
  const sacc  = document.getElementById('spec-acc').value.trim();
  const stype = document.getElementById('spec-type').value.trim();
  const soth  = document.getElementById('spec-other').value.trim();
  const hasSpecs = scap || splat || sacc || stype || soth;

  const fi = v => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fn = v =>       v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let rowsHtml = items.map(it => `
    <tr>
      <td>${it.no}.</td>
      <td><strong>${esc(it.name)}</strong>${it.desc ? `<div class="q-item-desc-list">${it.desc.split('\n').filter(l=>l.trim()).map(l=>`<div class="q-item-desc">${esc(l.trim())}</div>`).join('')}</div>` : ''}${it.hsn ? `<div class="q-item-desc">HSN: ${esc(it.hsn)}</div>` : ''}</td>
      <td class="r">${it.qty}</td>
      <td>${esc(it.unit)}</td>
      <td class="r">₹${fn(it.rate)}</td>
      <td class="r"><strong>₹${fn(it.tot)}</strong></td>
    </tr>`).join('');

  if (itemType === 'weighbridge') {
    const comps = WB_ITEMS.filter(it => document.getElementById('wbck-' + it.id)?.checked);
    comps.forEach(it => {
      const qty = document.getElementById('wbq-' + it.id)?.value || '1';
      const dim = esc(document.getElementById('wbd-' + it.id)?.value.trim() || '');
      rowsHtml += `<tr style="background:#FAFAFA">
        <td></td>
        <td style="padding-left:16px;font-size:7.5pt;color:#555">
          <span style="color:#CCC">↳&nbsp;</span><strong style="color:#444">${it.name}</strong>
          ${dim ? `&nbsp;<span style="color:#888">${dim}</span>` : ''}
        </td>
        <td class="r" style="font-size:7.5pt;color:#666">${qty}</td>
        <td></td><td></td>
        <td class="r" style="font-size:7pt;color:#aaa;font-style:italic">Incl.</td>
      </tr>`;
    });
  }

  const specsHtml = hasSpecs ? `
    <div class="q-specs-wrap">
      <div class="q-sec">Technical Specifications</div>
      <div class="q-specs-grid">
        ${scap  ? `<span class="sl">Capacity:</span><span class="sv">${esc(scap)}</span>`       : ''}
        ${splat ? `<span class="sl">Platform Size:</span><span class="sv">${esc(splat)}</span>` : ''}
        ${sacc  ? `<span class="sl">Accuracy:</span><span class="sv">${esc(sacc)}</span>`       : ''}
        ${stype ? `<span class="sl">Type:</span><span class="sv">${esc(stype)}</span>`           : ''}
      </div>
      ${soth ? `<div style="margin-top:6px;font-size:8pt;color:#555">${esc(soth).replace(/\n/g, '<br>')}</div>` : ''}
    </div>` : '';

  const html = `
    <div class="qh">
      <div class="qh-left">
        <div class="qh-title">Quotation</div>
        <div class="qh-meta">
          <span><strong>No #</strong>&nbsp;${esc(qn)}</span>
          <span><strong>Date</strong>&nbsp;${qd}</span>
          ${ref ? `<span><strong>Ref</strong>&nbsp;${esc(ref)}</span>` : ''}
        </div>
      </div>
      <div class="qh-right">
        <div class="qh-logo">NS</div>
        <div class="qh-co-name">${CO.name}</div>
        <div class="qh-co-detail">${CO.phone}<br>${CO.email}</div>
      </div>
    </div>

    <hr class="qdiv">

    <div class="q-parties">
      <div class="q-box">
        <div class="q-box-label">From</div>
        <div class="q-box-name">${CO.name}</div>
        <div class="q-box-addr">${CO.addr.replace(/\n/g, '<br>')}</div>
        <div class="q-box-row"><b>GSTIN:</b> ${CO.gstin}</div>
        <div class="q-box-row"><b>PAN:</b> ${CO.pan}</div>
        <div class="q-box-row"><b>Email:</b> ${CO.email}</div>
        <div class="q-box-row"><b>Phone:</b> ${CO.phone}</div>
      </div>
      <div class="q-box">
        <div class="q-box-label">To</div>
        <div class="q-box-name">${esc(cn)}</div>
        <div class="q-box-addr">${esc(ca).replace(/\n/g, '<br>')}</div>
        ${cda ? `<div class="q-box-row"><b>Delivery:</b> ${esc(cda).replace(/\n/g, '<br>')}</div>` : ''}
        ${cg  ? `<div class="q-box-row"><b>GSTIN:</b> ${esc(cg)}</div>`   : ''}
        ${cp  ? `<div class="q-box-row"><b>Contact:</b> ${esc(cp)}</div>` : ''}
        ${cph ? `<div class="q-box-row"><b>Phone:</b> ${esc(cph)}</div>`  : ''}
      </div>
    </div>

    ${specsHtml}

    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:12px;border-radius:8px">
    <table class="qi-tbl" style="margin-bottom:0">
      <thead><tr>
        <th style="width:28px">#</th>
        <th>Item</th>
        <th class="r" style="width:38px">Qty</th>
        <th style="width:38px">Unit</th>
        <th class="r" style="width:80px">Rate (₹)</th>
        <th class="r" style="width:90px">Total (₹)</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot>
        ${gstEnabled ? `
        <tr>
          <td colspan="4" style="font-size:7.5pt;color:#555;background:#F9F9F9!important;font-weight:400">Sub Total</td>
          <td style="text-align:right;font-size:8pt;background:#F9F9F9!important;font-weight:600">Sub Total</td>
          <td class="r" style="background:#F9F9F9!important;font-weight:600">${fi(subTotal)}</td>
        </tr>
        <tr>
          <td colspan="4" style="font-size:7.5pt;color:#555;background:#F9F9F9!important;font-weight:400">GST @ 18%</td>
          <td style="text-align:right;font-size:8pt;background:#F9F9F9!important;font-weight:600">GST @ 18%</td>
          <td class="r" style="background:#F9F9F9!important;font-weight:600">${fi(gstAmt)}</td>
        </tr>` : ''}
        <tr>
          <td colspan="4" style="font-size:7.5pt;color:#555;vertical-align:middle"><b style="color:#111;font-style:normal">Amount in Words:&nbsp;</b><span style="font-style:italic">${n2w(gt)}</span></td>
          <td style="text-align:right;font-weight:700;font-size:8pt;white-space:nowrap;vertical-align:middle">Grand Total</td>
          <td class="r" style="font-weight:800;font-size:9pt;white-space:nowrap;vertical-align:middle">${fi(gt)}</td>
        </tr>
      </tfoot>
    </table></div>

    ${itemType === 'weighbridge' ? `
    <div class="q-bank" style="margin-bottom:18px">
      <div class="q-sec">Customer Scope of Supply</div>
      <ol style="padding-left:16px;font-size:8pt;color:#374151;line-height:1.75">
        <li>Civil Work including digging foundation, welding set &amp; earthing to be undertaken by the customer as per the drawings/instructions.</li>
        <li>Unskilled labor / Hyra at the time of unloading &amp; installation.</li>
        <li>Approach Road and Weigh cabin to be provided.</li>
        <li>Standard Test weights of at least one ton to be purchased / Arranged for testing (Must require).</li>
        <li>UPS/Batteries for power backup if required.</li>
        <li>Cost of stamping through Weights &amp; Measure Deptt. to be borne by customer.</li>
      </ol>
    </div>` : ''}

    <div class="q-bottom">
      <div>
        <div class="q-sec">Terms &amp; Conditions</div>
        <ol class="q-terms-ol">${terms.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
        ${notes ? `<div style="margin-top:10px"><div class="q-sec">Notes</div><div class="q-notes-txt">${esc(notes).replace(/\n/g, '<br>')}</div></div>` : ''}
      </div>
      <div>
        <div class="q-sec">Bank Details</div>
        <div class="q-bank-grid">
          <span class="bl">Account Name</span><span class="bv">${BK.name}</span>
          <span class="bl">Bank</span><span class="bv">${BK.bank}</span>
          <span class="bl">Account No.</span><span class="bv">${BK.acc}</span>
          <span class="bl">IFSC Code</span><span class="bv">${BK.ifsc}</span>
        </div>
      </div>
    </div>

    <div class="q-sig">
      <div class="q-sig-inner">
        <div class="q-sig-space"></div>
        <div class="q-sig-line">Anil Yadav
          <div class="q-sig-sub">For Naman Scale</div>
          <div class="q-sig-sub">Authorized Signatory</div>
        </div>
      </div>
    </div>

    <div class="q-foot">This is a computer-generated document. No physical signature required.</div>`;

  document.getElementById('q-out').innerHTML = html;
  document.getElementById('form-view').style.display = 'none';
  document.getElementById('preview-view').style.display = 'block';
  window.scrollTo(0, 0);
}

/* ===== DOWNLOAD PDF ===== */
async function downloadHTML() {
  const qn  = document.getElementById('q-num').value.trim() || 'quotation';
  const el  = document.getElementById('q-out');
  const btn = document.querySelector('.btn-dl');

  btn.textContent = '⏳ Generating…';
  btn.disabled = true;

  const snap = {
    width: el.style.width, maxWidth: el.style.maxWidth,
    margin: el.style.margin, position: el.style.position,
    boxShadow: el.style.boxShadow, borderRadius: el.style.borderRadius,
    minHeight: el.style.minHeight
  };

  el.style.width        = '794px';
  el.style.maxWidth     = '794px';
  el.style.margin       = '0';
  el.style.position     = 'relative';
  el.style.boxShadow    = 'none';
  el.style.borderRadius = '0';
  el.style.minHeight    = '0';

  void el.offsetHeight;
  window.scrollTo(0, 0);

  const contentH = el.offsetHeight;
  const heightMm = Math.ceil(contentH * (210 / 794));

  try {
    await html2pdf().set({
      margin:      0,
      filename:    `Naman-Scale-Quotation-${qn}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: 'mm', format: [210, heightMm], orientation: 'portrait' }
    }).from(el).save();
  } catch (e) {
    alert('PDF library not loaded. Using print instead.');
    window.print();
  } finally {
    Object.entries(snap).forEach(([k, v]) => el.style[k] = v);
    btn.textContent = '⬇ Download PDF';
    btn.disabled = false;
  }
}

/* ===== HELPERS ===== */
function showForm() {
  document.getElementById('form-view').style.display = 'block';
  document.getElementById('preview-view').style.display = 'none';
}

function resetForm() {
  if (!confirm('Clear all form data?')) return;
  ['q-num', 'q-ref', 'c-name', 'c-gstin', 'c-addr', 'c-daddr', 'c-person', 'c-phone',
   'q-notes', 'spec-cap', 'spec-plat', 'spec-acc', 'spec-type', 'spec-other'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('items-body').innerHTML = '';
  idc = 0; addItem(); calcTotals();
}
