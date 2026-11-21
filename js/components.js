// المكوّنات المشتركة: بطاقة المكان، النوافذ المنبثقة، والنماذج
/* global L */
import * as store from './store.js';
import {
  esc, TRANSPORT_MODES, SIDES, parseCoords, isShortMapsLink, hasCoords,
  mapsLink, directionsLink, compressImage, dayDate, distanceKm, toast,
} from './utils.js';
import { createMap, pinIcon } from './map.js';

// ——— أجزاء صغيرة ———

export function typeChip(type) {
  return `<span class="type-chip" style="--c:${esc(type.color)}">${esc(type.icon)} ${esc(type.label)}</span>`;
}

export function transportLine(t) {
  if (!t) return '';
  const mode = TRANSPORT_MODES[t.mode];
  const parts = [];
  if (mode) parts.push(`${mode.icon} ${esc(mode.label)}${t.line ? ` <b dir="ltr">${esc(t.line)}</b>` : ''}`);
  else if (t.line) parts.push(`<b dir="ltr">${esc(t.line)}</b>`);
  if (t.station) parts.push(`محطة <span dir="auto">${esc(t.station)}</span>`);
  if (Number.isFinite(t.walkMinutes) && t.walkMinutes > 0) parts.push(`🚶 ${t.walkMinutes} د مشياً`);
  return parts.join(' · ');
}

export function dayLabel(day) {
  if (day == null) return '';
  const date = dayDate(store.getTrip().startDate, day);
  return `اليوم ${day}${date ? ` · ${date}` : ''}`;
}

function dayOptions(selected) {
  const n = store.getTrip().days || 5;
  let html = `<option value="">بدون يوم</option>`;
  for (let d = 1; d <= n; d++) html += `<option value="${d}" ${selected === d ? 'selected' : ''}>${esc(dayLabel(d))}</option>`;
  return html;
}

function firstImage(place) {
  return place.images.length ? store.getImage(place.images[0]) : null;
}

export function placeCard(place, { showDistrict = false, mapButton = true } = {}) {
  const type = store.getType(place.typeId);
  const district = store.getDistrict(place.districtId);
  const img = firstImage(place);
  const transport = transportLine(place.transport);
  const location = place.address || (showDistrict && district ? district.name : '');
  return `
    <article class="place-card${place.visited ? ' is-visited' : ''}" data-id="${esc(place.id)}">
      <button class="visit-check" data-action="toggle-visited" data-id="${esc(place.id)}"
        aria-pressed="${place.visited}" title="${place.visited ? 'زرته ✓' : 'علّمي أنك زرته'}">✓</button>
      <div class="place-main" role="button" tabindex="0" data-action="open-place" data-id="${esc(place.id)}">
        <div class="place-top">
          ${typeChip(type)}
          ${place.day ? `<span class="day-badge">اليوم ${place.day}</span>` : ''}
          ${showDistrict && district ? `<span class="muted small">${esc(district.name)}</span>` : ''}
        </div>
        <h3 class="place-name">${esc(place.name)}</h3>
        ${place.nameLocal ? `<div class="place-local" dir="auto">${esc(place.nameLocal)}</div>` : ''}
        ${location ? `<div class="place-meta" dir="auto">📍 ${esc(location)}</div>` : ''}
        ${transport ? `<div class="place-meta">${transport}</div>` : ''}
      </div>
      ${img ? `<img class="place-thumb" src="${img}" alt="" loading="lazy">` : ''}
      ${mapButton && hasCoords(place) ? `<button class="icon-btn" data-action="focus-place" data-id="${esc(place.id)}" title="أظهريه على الخريطة" aria-label="أظهريه على الخريطة">🗺️</button>` : ''}
    </article>`;
}

// ——— النافذة المنبثقة ———

const modal = () => document.getElementById('modal');
let modalCleanup = null;
let modalRefresh = null;

function runCleanup() {
  const fn = modalCleanup;
  modalCleanup = null;
  modalRefresh = null;
  fn?.();
}

export function openModal(html, { onMount, onClose, refresh, wide = false } = {}) {
  const dlg = modal();
  // إذا كانت هناك نافذة مفتوحة نستبدل محتواها مباشرة (حدث close غير متزامن)
  if (dlg.open) runCleanup();
  dlg.classList.toggle('wide', wide);
  dlg.innerHTML = html;
  modalCleanup = onClose || null;
  modalRefresh = refresh || null;
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
  onMount?.(dlg);
}

export function closeModal() {
  const dlg = modal();
  if (!dlg.open) return;
  runCleanup();
  dlg.close();
}

export function refreshModal() {
  if (modal().open && modalRefresh) modalRefresh();
}

export function initModal() {
  const dlg = modal();
  // يُغلق أيضاً بزر Esc
  dlg.addEventListener('close', () => {
    if (dlg.open) return;
    runCleanup();
    dlg.innerHTML = '';
  });
  // الإغلاق بالضغط خارج النافذة
  dlg.addEventListener('click', (e) => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) closeModal();
  });
}

const closeBtn = `<button class="icon-btn modal-close" data-action="close-modal" aria-label="إغلاق">✕</button>`;

// ——— تفاصيل المكان ———

export function openPlaceDetails(id) {
  const render = () => {
    const p = store.getPlace(id);
    if (!p) return closeModal();
    const dlg = modal();
    dlg.innerHTML = placeDetailsHtml(p);
  };
  openModal('', { refresh: render, wide: true });
  render();
}

function placeDetailsHtml(p) {
  const type = store.getType(p.typeId);
  const district = store.getDistrict(p.districtId);
  const images = p.images.map((imgId) => store.getImage(imgId)).filter(Boolean);
  const t = p.transport;
  const mode = TRANSPORT_MODES[t.mode];
  const row = (label, value, attrs = '') =>
    value ? `<div class="info-row"><dt>${label}</dt><dd ${attrs}>${value}</dd></div>` : '';

  return `
    <div class="modal-head">
      <div>
        <div class="place-top">${typeChip(type)}${district ? `<a class="muted small" href="#/district/${esc(district.id)}" data-action="close-modal">${esc(district.name)}</a>` : ''}</div>
        <h2>${esc(p.name)}</h2>
        ${p.nameLocal ? `<div class="place-local" dir="auto">${esc(p.nameLocal)}</div>` : ''}
      </div>
      ${closeBtn}
    </div>

    ${images.length ? `<div class="gallery">${images.map((src) => `<img src="${src}" alt="" loading="lazy">`).join('')}</div>` : ''}

    <div class="detail-actions">
      <button class="btn ${p.visited ? 'btn-success' : 'btn-outline'}" data-action="toggle-visited" data-id="${esc(p.id)}">
        ${p.visited ? '✓ زرته' : 'علّميه كمكان زرته'}
      </button>
      <label class="inline-field">
        <span>اليوم:</span>
        <select data-action="set-day" data-id="${esc(p.id)}">${dayOptions(p.day)}</select>
      </label>
    </div>

    ${p.approx ? `<p class="hint warn">📍 الموقع على الخريطة تقريبي. زر «فتح في Google Maps» يبحث عن المكان نفسه، ويمكنك تصحيح الموقع من «تعديل».</p>` : ''}
    ${!hasCoords(p) ? `<p class="hint warn">📍 لم يُحدَّد موقع هذا المكان على الخريطة. زر «فتح في Google Maps» يعرض أقرب الفروع.</p>` : ''}

    <dl class="info">
      ${row('العنوان', esc(p.address), 'dir="auto"')}
      ${row('ساعات العمل', esc(p.hours))}
      ${row('الأسعار', esc(p.price))}
      ${row('ملاحظات', esc(p.notes).replaceAll('\n', '<br>'))}
    </dl>

    ${t.mode || t.station || t.line || t.note ? `
      <section class="transport-box">
        <h3>🚏 كيفية الوصول</h3>
        <dl class="info">
          ${row('الوسيلة', mode ? `${mode.icon} ${esc(mode.label)}` : '')}
          ${row('الخط', esc(t.line), 'dir="ltr"')}
          ${row('أقرب محطة', esc(t.station), 'dir="auto"')}
          ${row('المشي من المحطة', Number.isFinite(t.walkMinutes) && t.walkMinutes > 0 ? `${t.walkMinutes} دقيقة` : '')}
          ${row('ملاحظة', esc(t.note))}
        </dl>
      </section>` : ''}

    ${district?.transportNotes ? `<p class="muted small">مواصلات الحي: ${esc(district.transportNotes)}</p>` : ''}

    <div class="modal-foot">
      <a class="btn" href="${esc(mapsLink(p))}" target="_blank" rel="noopener">فتح في Google Maps</a>
      <a class="btn btn-outline" href="${esc(directionsLink(p))}" target="_blank" rel="noopener">الاتجاهات بالمواصلات</a>
      <span class="spacer"></span>
      <button class="btn btn-ghost" data-action="edit-place" data-id="${esc(p.id)}">تعديل</button>
      <button class="btn btn-ghost danger" data-action="delete-place" data-id="${esc(p.id)}">حذف</button>
    </div>`;
}

// ——— نموذج إضافة/تعديل مكان ———

export function openPlaceForm(id, defaults = {}) {
  const existing = id ? store.getPlace(id) : null;
  const p = existing
    ? JSON.parse(JSON.stringify(existing))
    : { name: '', nameLocal: '', typeId: 'attraction', districtId: '', address: '', lat: null, lng: null, mapsUrl: '', hours: '', price: '', notes: '', transport: { mode: '', line: '', station: '', walkMinutes: null, note: '' }, day: null, images: [], ...defaults };

  const types = store.getTypes();
  const districts = store.getDistricts();
  const images = [...p.images];
  const added = [];
  const removed = [];
  let saved = false;
  let picker = null;
  let pickerMarker = null;

  const html = `
    <form class="form" id="place-form" novalidate>
      <div class="modal-head">
        <h2>${existing ? 'تعديل المكان' : 'إضافة مكان جديد'}</h2>
        ${closeBtn}
      </div>

      <fieldset>
        <legend>المعلومات الأساسية</legend>
        <div class="grid-2">
          <label>اسم المكان *<input name="name" required value="${esc(p.name)}" placeholder="مثال: آيا صوفيا"></label>
          <label>الاسم الأصلي (تركي/إنجليزي)<input name="nameLocal" dir="auto" value="${esc(p.nameLocal)}" placeholder="Ayasofya"></label>
          <label>النوع
            <select name="typeId">${types.map((t) => `<option value="${esc(t.id)}" ${t.id === p.typeId ? 'selected' : ''}>${esc(t.icon)} ${esc(t.label)}</option>`).join('')}</select>
          </label>
          <label>الحي *
            <select name="districtId" required>
              <option value="">اختاري الحي</option>
              ${districts.map((d) => `<option value="${esc(d.id)}" ${d.id === p.districtId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}
            </select>
          </label>
          <label>اليوم في الخطة<select name="day">${dayOptions(p.day)}</select></label>
          <label>العنوان<input name="address" dir="auto" value="${esc(p.address)}"></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>الموقع</legend>
        <label>رابط Google Maps<input name="mapsUrl" dir="ltr" value="${esc(p.mapsUrl)}" placeholder="https://maps.app.goo.gl/..."></label>
        <label>الإحداثيات (خط العرض، خط الطول)
          <input name="coords" dir="ltr" value="${hasCoords(p) ? `${p.lat}, ${p.lng}` : ''}" placeholder="41.0086, 28.9802">
        </label>
        <p class="hint" id="coords-hint">انسخي الإحداثيات من Google Maps (اضغطي مطولاً على المكان فتظهر في الأعلى)، أو اضغطي على الخريطة لتحديد الموقع.</p>
        <div class="picker-map" id="picker-map" dir="ltr"></div>
      </fieldset>

      <fieldset>
        <legend>🚏 كيفية الوصول بالمواصلات</legend>
        <div class="grid-2">
          <label>الوسيلة
            <select name="t_mode">
              <option value="">—</option>
              ${Object.entries(TRANSPORT_MODES).map(([k, m]) => `<option value="${k}" ${k === p.transport.mode ? 'selected' : ''}>${m.icon} ${esc(m.label)}</option>`).join('')}
            </select>
          </label>
          <label>الخط<input name="t_line" dir="ltr" value="${esc(p.transport.line)}" placeholder="T1, M2, F1..."></label>
          <label>أقرب محطة<input name="t_station" dir="auto" value="${esc(p.transport.station)}" placeholder="Sultanahmet"></label>
          <label>دقائق المشي من المحطة<input name="t_walk" type="number" min="0" max="120" inputmode="numeric" value="${p.transport.walkMinutes ?? ''}"></label>
        </div>
        <label>ملاحظة عن الطريق<input name="t_note" value="${esc(p.transport.note)}" placeholder="مثال: انزلي من الباب الخلفي واتجهي يساراً"></label>
      </fieldset>

      <fieldset>
        <legend>تفاصيل إضافية</legend>
        <div class="grid-2">
          <label>ساعات العمل<input name="hours" value="${esc(p.hours)}" placeholder="9:00 - 18:00"></label>
          <label>الأسعار / التذاكر<input name="price" value="${esc(p.price)}"></label>
        </div>
        <label>ملاحظات<textarea name="notes" rows="3">${esc(p.notes)}</textarea></label>
      </fieldset>

      <fieldset>
        <legend>الصور</legend>
        <div class="thumbs" id="thumbs"></div>
        <label class="btn btn-outline file-btn">
          + إضافة صور
          <input type="file" accept="image/*" multiple id="image-input" hidden>
        </label>
        <p class="hint">تُصغَّر الصور وتُضغط تلقائياً لتوفير مساحة التخزين.</p>
      </fieldset>

      <div class="modal-foot">
        <button type="submit" class="btn">حفظ</button>
        <button type="button" class="btn btn-ghost" data-action="close-modal">إلغاء</button>
      </div>
    </form>`;

  const onMount = (dlg) => {
    const form = dlg.querySelector('#place-form');
    const coordsInput = form.elements.coords;
    const hint = dlg.querySelector('#coords-hint');
    const defaultHint = hint.textContent;

    // خريطة اختيار الموقع
    const start = hasCoords(p) ? [p.lat, p.lng] : undefined;
    picker = createMap(dlg.querySelector('#picker-map'), { center: start, zoom: start ? 15 : 12 });
    const setMarker = (lat, lng, { pan = true } = {}) => {
      const type = store.getType(form.elements.typeId.value);
      if (!pickerMarker) {
        pickerMarker = L.marker([lat, lng], { draggable: true, icon: pinIcon(type, { big: true }) }).addTo(picker);
        pickerMarker.on('dragend', () => {
          const ll = pickerMarker.getLatLng();
          coordsInput.value = `${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`;
          suggestDistrict();
        });
      } else pickerMarker.setLatLng([lat, lng]);
      if (pan) picker.setView([lat, lng], Math.max(picker.getZoom(), 15));
    };
    if (start) setMarker(...start, { pan: false });
    picker.on('click', (e) => {
      coordsInput.value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
      setMarker(e.latlng.lat, e.latlng.lng, { pan: false });
      suggestDistrict();
    });

    // اقتراح الحي الأقرب إذا لم يُختر حي بعد
    const suggestDistrict = () => {
      if (form.elements.districtId.value) return;
      const c = parseCoords(coordsInput.value);
      if (!c) return;
      let best = null;
      for (const d of store.getDistricts()) {
        const center = store.districtCenter(d.id);
        if (!center) continue;
        const dist = distanceKm(c, center);
        if (!best || dist < best.dist) best = { id: d.id, dist };
      }
      if (best && best.dist < 4) form.elements.districtId.value = best.id;
    };

    coordsInput.addEventListener('change', () => {
      const c = parseCoords(coordsInput.value);
      if (c) {
        coordsInput.value = `${c.lat}, ${c.lng}`;
        setMarker(c.lat, c.lng);
        suggestDistrict();
        hint.textContent = defaultHint;
        hint.classList.remove('warn');
      } else if (coordsInput.value.trim()) {
        hint.textContent = 'لم أتعرّف على الإحداثيات. الصيغة المطلوبة مثل: 41.0086, 28.9802';
        hint.classList.add('warn');
      }
    });

    form.elements.mapsUrl.addEventListener('change', () => {
      const v = form.elements.mapsUrl.value.trim();
      const c = parseCoords(v);
      if (c) {
        coordsInput.value = `${c.lat}, ${c.lng}`;
        setMarker(c.lat, c.lng);
        suggestDistrict();
        hint.textContent = '✓ تم استخراج الإحداثيات من الرابط.';
        hint.classList.remove('warn');
      } else if (isShortMapsLink(v) && !coordsInput.value) {
        hint.textContent = 'الرابط المختصر لا يحتوي على الإحداثيات. افتحيه في Google Maps واضغطي مطولاً على المكان لنسخ الإحداثيات، أو حدّدي الموقع على الخريطة أدناه.';
        hint.classList.add('warn');
      }
    });

    form.elements.typeId.addEventListener('change', () => {
      if (pickerMarker) pickerMarker.setIcon(pinIcon(store.getType(form.elements.typeId.value), { big: true }));
    });

    // الصور
    const thumbs = dlg.querySelector('#thumbs');
    const renderThumbs = () => {
      thumbs.innerHTML = images
        .map((imgId) => {
          const src = store.getImage(imgId);
          return src ? `<div class="thumb"><img src="${src}" alt=""><button type="button" class="thumb-remove" data-img="${esc(imgId)}" aria-label="حذف الصورة">✕</button></div>` : '';
        })
        .join('');
    };
    renderThumbs();
    thumbs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-img]');
      if (!btn) return;
      const imgId = btn.dataset.img;
      images.splice(images.indexOf(imgId), 1);
      removed.push(imgId);
      renderThumbs();
    });
    dlg.querySelector('#image-input').addEventListener('change', async (e) => {
      for (const file of e.target.files) {
        try {
          const dataUrl = await compressImage(file);
          const imgId = store.addImage(dataUrl);
          images.push(imgId);
          added.push(imgId);
        } catch (err) {
          toast(err.message, 'error');
          break;
        }
      }
      e.target.value = '';
      renderThumbs();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements;
      if (!f.name.value.trim()) return markInvalid(f.name, 'اكتبي اسم المكان');
      if (!f.districtId.value) return markInvalid(f.districtId, 'اختاري الحي');
      const c = parseCoords(f.coords.value);
      if (f.coords.value.trim() && !c) return markInvalid(f.coords, 'صيغة الإحداثيات غير صحيحة');
      const walk = parseInt(f.t_walk.value, 10);
      try {
        store.savePlace({
          id: existing?.id,
          name: f.name.value.trim(),
          nameLocal: f.nameLocal.value.trim(),
          typeId: f.typeId.value,
          districtId: f.districtId.value,
          day: f.day.value ? parseInt(f.day.value, 10) : null,
          address: f.address.value.trim(),
          mapsUrl: f.mapsUrl.value.trim(),
          lat: c ? c.lat : null,
          lng: c ? c.lng : null,
          // إذا غيّرتِ الموقع يصبح دقيقاً
          approx: !!existing?.approx && !!c && c.lat === existing.lat && c.lng === existing.lng,
          hours: f.hours.value.trim(),
          price: f.price.value.trim(),
          notes: f.notes.value.trim(),
          transport: {
            mode: f.t_mode.value,
            line: f.t_line.value.trim(),
            station: f.t_station.value.trim(),
            walkMinutes: Number.isFinite(walk) ? walk : null,
            note: f.t_note.value.trim(),
          },
          images,
        });
      } catch (err) {
        toast(err.message, 'error');
        return;
      }
      saved = true;
      removed.forEach(store.removeImage);
      closeModal();
      toast(existing ? 'تم حفظ التعديلات' : 'تمت إضافة المكان', 'success');
    });

    form.elements.name.focus();
  };

  openModal(html, {
    wide: true,
    onMount,
    onClose: () => {
      if (!saved) added.forEach(store.removeImage); // حذف الصور غير المحفوظة
      picker?.remove();
    },
  });
}

function markInvalid(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
  input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
  input.addEventListener('change', () => input.setCustomValidity(''), { once: true });
}

// ——— نموذج الحي ———

export function openDistrictForm(id) {
  const d = id ? store.getDistrict(id) : { name: '', nameTr: '', side: 'europe', description: '', transportNotes: '' };
  const html = `
    <form class="form" id="district-form">
      <div class="modal-head"><h2>${id ? 'تعديل الحي' : 'إضافة حي'}</h2>${closeBtn}</div>
      <div class="grid-2">
        <label>اسم الحي *<input name="name" required value="${esc(d.name)}" placeholder="مثال: بشكتاش"></label>
        <label>الاسم بالتركية<input name="nameTr" dir="ltr" value="${esc(d.nameTr)}" placeholder="Beşiktaş"></label>
      </div>
      <label>الجانب
        <select name="side">${Object.entries(SIDES).map(([k, v]) => `<option value="${k}" ${k === d.side ? 'selected' : ''}>${v}</option>`).join('')}</select>
      </label>
      <label>وصف مختصر<textarea name="description" rows="2">${esc(d.description)}</textarea></label>
      <label>المواصلات العامة في الحي<textarea name="transportNotes" rows="2" placeholder="الخطوط والمحطات الرئيسية">${esc(d.transportNotes)}</textarea></label>
      <div class="modal-foot">
        <button class="btn" type="submit">حفظ</button>
        <button type="button" class="btn btn-ghost" data-action="close-modal">إلغاء</button>
      </div>
    </form>`;
  openModal(html, {
    onMount: (dlg) => {
      const form = dlg.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = form.elements;
        if (!f.name.value.trim()) return markInvalid(f.name, 'اكتبي اسم الحي');
        try {
          store.saveDistrict({
            id,
            name: f.name.value.trim(),
            nameTr: f.nameTr.value.trim(),
            side: f.side.value,
            description: f.description.value.trim(),
            transportNotes: f.transportNotes.value.trim(),
          });
          closeModal();
          toast('تم حفظ الحي', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
      });
      form.elements.name.focus();
    },
  });
}

// ——— نموذج نوع المكان ———

export function openTypeForm(id) {
  const t = id ? store.getType(id) : { label: '', icon: '📍', color: '#1d4e89' };
  const html = `
    <form class="form" id="type-form">
      <div class="modal-head"><h2>${id ? 'تعديل النوع' : 'إضافة نوع'}</h2>${closeBtn}</div>
      <div class="grid-3">
        <label>الاسم *<input name="label" required value="${esc(t.label)}" placeholder="مثال: صيدلية"></label>
        <label>الأيقونة (إيموجي)<input name="icon" value="${esc(t.icon)}" maxlength="4"></label>
        <label>اللون<input name="color" type="color" value="${esc(t.color)}"></label>
      </div>
      <div class="modal-foot">
        <button class="btn" type="submit">حفظ</button>
        <button type="button" class="btn btn-ghost" data-action="close-modal">إلغاء</button>
      </div>
    </form>`;
  openModal(html, {
    onMount: (dlg) => {
      const form = dlg.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = form.elements;
        if (!f.label.value.trim()) return markInvalid(f.label, 'اكتبي اسم النوع');
        try {
          store.saveType({ id, label: f.label.value.trim(), icon: f.icon.value.trim() || '📍', color: f.color.value });
          closeModal();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    },
  });
}
