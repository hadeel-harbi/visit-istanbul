// صفحات الموقع
/* global L */
import * as store from './store.js';
import { esc, SIDES, hasCoords, dayDate, formatBytes, toast } from './utils.js';
import { createMap, drawPlaces } from './map.js';
import { placeCard, typeChip, dayLabel } from './components.js';

function progress(places) {
  const visited = places.filter((p) => p.visited).length;
  const pct = places.length ? Math.round((visited / places.length) * 100) : 0;
  return { visited, total: places.length, pct };
}

function progressBar({ visited, total, pct }, label = 'زرتِ') {
  return `
    <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="muted small">${label} ${visited} من ${total}</div>`;
}

function typeLegend(places) {
  const used = new Set(places.map((p) => p.typeId));
  return store
    .getTypes()
    .filter((t) => used.has(t.id))
    .map((t) => typeChip(t))
    .join('');
}

/** يركّز الخريطة على مكان ويفتح نافذته */
function focusOn(map, markers, id, mapEl) {
  const m = markers.get(id);
  if (!m) return;
  map.setView(m.getLatLng(), Math.max(map.getZoom(), 16));
  m.openPopup();
  const r = mapEl.getBoundingClientRect();
  if (r.top < 0 || r.bottom > window.innerHeight) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ═══════════════ الصفحة الرئيسية ═══════════════

export function homeView() {
  let map;
  let layer;
  let el;

  function districtCard(d) {
    const places = store.placesInDistrict(d.id);
    const counts = new Map();
    places.forEach((p) => counts.set(p.typeId, (counts.get(p.typeId) || 0) + 1));
    const countsHtml = store
      .getTypes()
      .filter((t) => counts.has(t.id))
      .map((t) => `<span class="count-pill" title="${esc(t.label)}" style="--c:${esc(t.color)}">${esc(t.icon)} ${counts.get(t.id)}</span>`)
      .join('');
    return `
      <a class="district-card" href="#/district/${esc(d.id)}">
        <div class="district-card-head">
          <h3>${esc(d.name)}</h3>
          ${d.nameTr ? `<span class="muted" dir="ltr">${esc(d.nameTr)}</span>` : ''}
        </div>
        ${d.description ? `<p class="clamp">${esc(d.description)}</p>` : ''}
        <div class="count-row">${countsHtml || '<span class="muted small">لا توجد أماكن بعد</span>'}</div>
        ${places.length ? progressBar(progress(places)) : ''}
      </a>`;
  }

  function render() {
    const trip = store.getTrip();
    const places = store.getPlaces();
    const districts = store.getDistricts();
    const p = progress(places);
    const first = dayDate(trip.startDate, 1);
    const last = dayDate(trip.startDate, trip.days);
    const sides = Object.keys(SIDES)
      .map((side) => {
        const list = districts.filter((d) => (d.side || 'europe') === side);
        if (!list.length) return '';
        return `
          <section class="section">
            <h2 class="section-title">${side === 'asia' ? '🌏' : '🌍'} ${SIDES[side]}</h2>
            <div class="district-grid">${list.map(districtCard).join('')}</div>
          </section>`;
      })
      .join('');

    el.querySelector('#home-hero').innerHTML = `
      <div>
        <h1>${esc(trip.title || 'رحلتي إلى إسطنبول')}</h1>
        <p class="hero-sub">${first ? `${esc(first)} ← ${esc(last)}` : `${trip.days} أيام`} · ${districts.length} أحياء · ${places.length} مكاناً</p>
        <div class="hero-progress">${progressBar(p, 'زرتِ حتى الآن')}</div>
      </div>
      <div class="hero-actions">
        <a class="btn btn-light" href="#/days">🗓️ خطة الأيام</a>
        <a class="btn btn-outline-light" href="#/all">كل الأماكن</a>
      </div>`;
    el.querySelector('#home-districts').innerHTML = `
      ${sides}
      <button class="btn btn-outline add-district" data-action="add-district">+ إضافة حي</button>`;
    el.querySelector('#home-legend').innerHTML = typeLegend(places);
  }

  return {
    title: 'الرئيسية',
    mount(root) {
      el = root;
      el.innerHTML = `
        <section class="hero" id="home-hero"></section>
        <div id="home-districts"></div>
        <section class="section">
          <h2 class="section-title">🗺️ كل الأماكن على الخريطة</h2>
          <div class="legend" id="home-legend"></div>
          <div class="map map-lg" id="home-map" dir="ltr"></div>
        </section>`;
      render();
      map = createMap(el.querySelector('#home-map'));
      layer = L.layerGroup().addTo(map);
      drawPlaces(map, layer, store.getPlaces());
    },
    update() {
      render();
      drawPlaces(map, layer, store.getPlaces(), { fit: false });
    },
    unmount() {
      map?.remove();
    },
  };
}

// ═══════════════ صفحة الحي (أو كل الأماكن) ═══════════════

const filterMemory = new Map(); // يحفظ الفلاتر لكل حي أثناء التنقل

export function districtView(districtId) {
  const isAll = districtId === 'all';
  let el;
  let map;
  let layer;
  let markers = new Map();
  const filters = filterMemory.get(districtId) || { q: '', types: new Set(), hideVisited: false };
  filterMemory.set(districtId, filters);

  const basePlaces = () => (isAll ? store.getPlaces() : store.placesInDistrict(districtId));

  function filtered() {
    const q = filters.q.trim().toLowerCase();
    return basePlaces().filter((p) => {
      if (filters.types.size && !filters.types.has(p.typeId)) return false;
      if (filters.hideVisited && p.visited) return false;
      if (q) {
        const hay = `${p.name} ${p.nameLocal} ${p.address} ${p.notes} ${p.transport.station} ${p.transport.line}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderHeader() {
    const district = store.getDistrict(districtId);
    const places = basePlaces();
    el.querySelector('#d-head').innerHTML = isAll
      ? `
        <nav class="crumbs"><a href="#/">الرئيسية</a> ‹ <span>كل الأماكن</span></nav>
        <div class="page-head">
          <div><h1>كل الأماكن</h1><p class="muted">${places.length} مكاناً في ${store.getDistricts().length} أحياء</p></div>
          <button class="btn" data-action="add-place">+ إضافة مكان</button>
        </div>`
      : `
        <nav class="crumbs"><a href="#/">الرئيسية</a> ‹ <span>${esc(district.name)}</span></nav>
        <div class="page-head">
          <div>
            <h1>${esc(district.name)} ${district.nameTr ? `<small class="muted" dir="ltr">${esc(district.nameTr)}</small>` : ''}</h1>
            <p class="muted">${esc(SIDES[district.side] || '')} · ${places.length} مكاناً</p>
            ${district.description ? `<p>${esc(district.description)}</p>` : ''}
          </div>
          <div class="head-actions">
            <button class="btn" data-action="add-place" data-district="${esc(district.id)}">+ إضافة مكان هنا</button>
            <button class="btn btn-ghost" data-action="edit-district" data-id="${esc(district.id)}">تعديل الحي</button>
          </div>
        </div>
        ${district.transportNotes ? `<div class="transport-box"><h3>🚏 المواصلات العامة في الحي</h3><p>${esc(district.transportNotes)}</p></div>` : ''}`;
  }

  function renderChips() {
    const used = new Set(basePlaces().map((p) => p.typeId));
    el.querySelector('#d-chips').innerHTML = store
      .getTypes()
      .filter((t) => used.has(t.id))
      .map((t) => `<button class="chip${filters.types.has(t.id) ? ' active' : ''}" style="--c:${esc(t.color)}" data-action="filter-type" data-id="${esc(t.id)}" aria-pressed="${filters.types.has(t.id)}">${esc(t.icon)} ${esc(t.label)}</button>`)
      .join('');
  }

  function renderList() {
    const list = filtered();
    const listEl = el.querySelector('#d-list');
    if (!basePlaces().length) {
      listEl.innerHTML = `<div class="empty">لا توجد أماكن بعد.<br><button class="btn" data-action="add-place" ${isAll ? '' : `data-district="${esc(districtId)}"`}>+ أضيفي أول مكان</button></div>`;
      return;
    }
    if (!list.length) {
      listEl.innerHTML = `<div class="empty">لا توجد نتائج مطابقة للبحث.</div>`;
      return;
    }
    // التجميع: حسب النوع داخل الحي، وحسب الحي في صفحة كل الأماكن
    const groups = isAll
      ? store.getDistricts().map((d) => ({ title: d.name, href: `#/district/${d.id}`, items: list.filter((p) => p.districtId === d.id) }))
      : store.getTypes().map((t) => ({ title: `${t.icon} ${t.label}`, items: list.filter((p) => p.typeId === t.id) }));
    const known = new Set(groups.flatMap((g) => g.items.map((p) => p.id)));
    const orphans = list.filter((p) => !known.has(p.id));
    if (orphans.length) groups.push({ title: 'أخرى', items: orphans });

    listEl.innerHTML = groups
      .filter((g) => g.items.length)
      .map(
        (g) => `
        <section class="group">
          <h2 class="group-title">${g.href ? `<a href="${esc(g.href)}">${esc(g.title)}</a>` : esc(g.title)} <span class="muted">(${g.items.length})</span></h2>
          ${g.items.map((p) => placeCard(p)).join('')}
        </section>`,
      )
      .join('');
  }

  function renderAll({ fit = false } = {}) {
    renderHeader();
    renderChips();
    renderList();
    markers = drawPlaces(map, layer, filtered(), { fit });
  }

  return {
    get title() {
      return isAll ? 'كل الأماكن' : store.getDistrict(districtId)?.name || '';
    },
    exists: () => isAll || !!store.getDistrict(districtId),
    mount(root) {
      el = root;
      el.innerHTML = `
        <div id="d-head"></div>
        <div class="toolbar">
          <input type="search" id="d-search" placeholder="ابحثي بالاسم أو المحطة..." value="${esc(filters.q)}" aria-label="بحث">
          <label class="check"><input type="checkbox" id="d-hide" ${filters.hideVisited ? 'checked' : ''}> إخفاء ما زرته</label>
        </div>
        <div class="chips" id="d-chips"></div>
        <div class="split">
          <div class="split-list" id="d-list"></div>
          <div class="split-map"><div class="map" id="d-map" dir="ltr"></div></div>
        </div>`;
      map = createMap(el.querySelector('#d-map'));
      layer = L.layerGroup().addTo(map);
      renderAll({ fit: true });

      el.querySelector('#d-search').addEventListener('input', (e) => {
        filters.q = e.target.value;
        renderList();
        markers = drawPlaces(map, layer, filtered(), { fit: false });
      });
      el.querySelector('#d-hide').addEventListener('change', (e) => {
        filters.hideVisited = e.target.checked;
        renderAll({ fit: false });
      });
    },
    update() {
      if (!this.exists()) return (location.hash = '#/');
      renderAll({ fit: false });
    },
    actions: {
      'filter-type': (btn) => {
        const id = btn.dataset.id;
        filters.types.has(id) ? filters.types.delete(id) : filters.types.add(id);
        renderAll({ fit: true });
      },
      'focus-place': (btn) => focusOn(map, markers, btn.dataset.id, el.querySelector('#d-map')),
    },
    unmount() {
      map?.remove();
    },
  };
}

// ═══════════════ خطة الأيام ═══════════════

export function daysView(dayParam) {
  let el;
  let map;
  let layer;
  let markers = new Map();
  const trip = store.getTrip();
  let day = dayParam === 'none' ? 'none' : Math.min(Math.max(parseInt(dayParam, 10) || 1, 1), trip.days);

  function list() {
    return day === 'none' ? store.getPlaces().filter((p) => p.day == null) : store.placesForDay(day);
  }

  function render({ fit = false } = {}) {
    const t = store.getTrip();
    const tabs = [];
    for (let d = 1; d <= t.days; d++) {
      const date = dayDate(t.startDate, d);
      const count = store.placesForDay(d).length;
      tabs.push(`<a class="tab${day === d ? ' active' : ''}" href="#/days/${d}" aria-current="${day === d}">
        <b>اليوم ${d}</b>${date ? `<span>${esc(date)}</span>` : ''}<span class="tab-count">${count} أماكن</span></a>`);
    }
    const unassigned = store.getPlaces().filter((p) => p.day == null).length;
    tabs.push(`<a class="tab tab-muted${day === 'none' ? ' active' : ''}" href="#/days/none"><b>غير مُجدولة</b><span class="tab-count">${unassigned} أماكن</span></a>`);
    el.querySelector('#days-tabs').innerHTML = tabs.join('');

    const items = list();
    const listEl = el.querySelector('#days-list');
    if (!items.length) {
      listEl.innerHTML =
        day === 'none'
          ? `<div class="empty">كل الأماكن موزعة على الأيام 🎉</div>`
          : `<div class="empty">لا توجد أماكن في هذا اليوم.<br>اختاري أماكن من تبويب «غير مُجدولة» أو من صفحة أي حي.</div>`;
    } else if (day === 'none') {
      listEl.innerHTML = items
        .map(
          (p) => `
          <div class="day-item">
            ${placeCard(p, { showDistrict: true })}
            <label class="inline-field small"><span>إضافة إلى:</span>
              <select data-action="set-day" data-id="${esc(p.id)}">
                <option value="">—</option>
                ${Array.from({ length: t.days }, (_, i) => `<option value="${i + 1}">${esc(dayLabel(i + 1))}</option>`).join('')}
              </select>
            </label>
          </div>`,
        )
        .join('');
    } else {
      const districtsInDay = [...new Set(items.map((p) => store.getDistrict(p.districtId)?.name).filter(Boolean))];
      listEl.innerHTML = `
        <p class="muted">الأحياء: ${districtsInDay.map(esc).join('، ') || '—'} · زرتِ ${items.filter((p) => p.visited).length} من ${items.length}</p>
        <ol class="day-list">
          ${items
            .map(
              (p, i) => `
            <li class="day-item">
              <span class="step">${i + 1}</span>
              ${placeCard(p, { showDistrict: true })}
              <div class="reorder">
                <button class="icon-btn" data-action="move-up" data-id="${esc(p.id)}" ${i === 0 ? 'disabled' : ''} aria-label="تقديم">▲</button>
                <button class="icon-btn" data-action="move-down" data-id="${esc(p.id)}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="تأخير">▼</button>
                <button class="icon-btn" data-action="unschedule" data-id="${esc(p.id)}" aria-label="إزالة من اليوم" title="إزالة من اليوم">✕</button>
              </div>
            </li>`,
            )
            .join('')}
        </ol>`;
    }

    markers = drawPlaces(map, layer, items, { fit, labelFn: day === 'none' ? undefined : (_p, i) => i + 1 });
    if (day !== 'none') {
      const pts = items.filter(hasCoords).map((p) => [p.lat, p.lng]);
      if (pts.length > 1) L.polyline(pts, { color: '#1d4e89', weight: 3, opacity: 0.7, dashArray: '6 8' }).addTo(layer);
    }
  }

  return {
    title: 'خطة الأيام',
    mount(root) {
      el = root;
      el.innerHTML = `
        <nav class="crumbs"><a href="#/">الرئيسية</a> ‹ <span>خطة الأيام</span></nav>
        <div class="page-head"><h1>🗓️ خطة الأيام</h1></div>
        <div class="tabs" id="days-tabs"></div>
        <div class="split">
          <div class="split-list" id="days-list"></div>
          <div class="split-map"><div class="map" id="days-map" dir="ltr"></div></div>
        </div>`;
      map = createMap(el.querySelector('#days-map'));
      layer = L.layerGroup().addTo(map);
      render({ fit: true });
    },
    update() {
      render();
    },
    actions: {
      'move-up': (btn) => store.moveInDay(btn.dataset.id, -1),
      'move-down': (btn) => store.moveInDay(btn.dataset.id, 1),
      unschedule: (btn) => store.setDay(btn.dataset.id, null),
      'focus-place': (btn) => focusOn(map, markers, btn.dataset.id, el.querySelector('#days-map')),
    },
    unmount() {
      map?.remove();
    },
  };
}

// ═══════════════ الإعدادات ═══════════════

export function settingsView() {
  let el;

  function render() {
    const trip = store.getTrip();
    const usage = store.storageUsage();
    const pct = Math.min(100, Math.round((usage.total / store.STORAGE_LIMIT) * 100));
    el.innerHTML = `
      <nav class="crumbs"><a href="#/">الرئيسية</a> ‹ <span>الإعدادات</span></nav>
      <div class="page-head"><h1>⚙️ الإعدادات</h1></div>

      <section class="card">
        <h2>الرحلة</h2>
        <form class="form" id="trip-form">
          <div class="grid-3">
            <label>عنوان الرحلة<input name="title" value="${esc(trip.title)}"></label>
            <label>تاريخ أول يوم<input name="startDate" type="date" value="${esc(trip.startDate)}"></label>
            <label>عدد الأيام<input name="days" type="number" min="1" max="14" value="${trip.days}"></label>
          </div>
          <button class="btn" type="submit">حفظ</button>
        </form>
      </section>

      <section class="card">
        <div class="card-head"><h2>الأحياء</h2><button class="btn btn-outline btn-sm" data-action="add-district">+ إضافة حي</button></div>
        <ul class="rows">
          ${store
            .getDistricts()
            .map(
              (d) => `
            <li><span><b>${esc(d.name)}</b> <span class="muted" dir="ltr">${esc(d.nameTr || '')}</span> <span class="muted small">· ${store.placesInDistrict(d.id).length} أماكن</span></span>
              <span><button class="btn btn-ghost btn-sm" data-action="edit-district" data-id="${esc(d.id)}">تعديل</button>
              <button class="btn btn-ghost btn-sm danger" data-action="delete-district" data-id="${esc(d.id)}">حذف</button></span></li>`,
            )
            .join('')}
        </ul>
      </section>

      <section class="card">
        <div class="card-head"><h2>أنواع الأماكن</h2><button class="btn btn-outline btn-sm" data-action="add-type">+ إضافة نوع</button></div>
        <ul class="rows">
          ${store
            .getTypes()
            .map(
              (t) => `
            <li><span>${typeChip(t)} <span class="muted small">· ${store.getPlaces().filter((p) => p.typeId === t.id).length} أماكن</span></span>
              <span><button class="btn btn-ghost btn-sm" data-action="edit-type" data-id="${esc(t.id)}">تعديل</button>
              <button class="btn btn-ghost btn-sm danger" data-action="delete-type" data-id="${esc(t.id)}">حذف</button></span></li>`,
            )
            .join('')}
        </ul>
      </section>

      <section class="card">
        <h2>مساحة التخزين</h2>
        <div class="progress${pct > 85 ? ' warn' : ''}"><div class="progress-fill" style="width:${pct}%"></div></div>
        <p class="muted small">
          مستخدم ${formatBytes(usage.total)} من حوالي ${formatBytes(store.STORAGE_LIMIT)} (${pct}%) ·
          البيانات ${formatBytes(usage.data)} · الصور (${usage.count}) ${formatBytes(usage.images)}
        </p>
        <p class="muted small">إصدار البيانات في هذا المتصفح: ${store.getState().seedVersion}</p>
        <p class="hint">البيانات محفوظة في هذا المتصفح فقط. إذا مسحتِ بيانات المتصفح أو فتحتِ الموقع من جهاز آخر فلن تظهر تعديلاتك.</p>
      </section>

      <section class="card danger-zone">
        <h2>إعادة الضبط</h2>
        <p class="muted">حذف كل التعديلات والصور والرجوع إلى البيانات الأصلية في ملف البيانات.</p>
        <button class="btn btn-danger" data-action="reset-all">إعادة الضبط</button>
      </section>`;

    el.querySelector('#trip-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target.elements;
      const days = Math.min(14, Math.max(1, parseInt(f.days.value, 10) || 5));
      try {
        store.saveTrip({ title: f.title.value.trim(), startDate: f.startDate.value, days });
        toast('تم حفظ معلومات الرحلة', 'success');
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  }

  return {
    title: 'الإعدادات',
    mount(root) {
      el = root;
      render();
    },
    update() {
      render();
    },
    unmount() {},
  };
}

