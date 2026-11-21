// الخريطة: Leaflet + OpenStreetMap
/* global L */
import { esc, hasCoords } from './utils.js';
import { getType, getDistrict } from './store.js';

export const ISTANBUL = [41.02, 28.99];

export function createMap(el, { zoom = 12, center = ISTANBUL } = {}) {
  const map = L.map(el, { zoomControl: true, attributionControl: true }).setView(center, zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  // يعيد حساب الحجم إذا تغيّر حجم الحاوية (مثلاً عند فتح نافذة أو تدوير الجوال)
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    map.on('unload', () => ro.disconnect());
  }
  return map;
}

export function pinIcon(type, { label, visited = false, big = false } = {}) {
  const size = big ? 40 : 34;
  return L.divIcon({
    className: 'pin',
    html: `<span class="pin-dot${visited ? ' is-visited' : ''}" style="--c:${esc(type.color)}"><span class="pin-label">${esc(label ?? type.icon)}</span></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, Math.round(size * 1.2)], // رأس العلامة المائلة
    popupAnchor: [0, -size],
  });
}

export function popupHtml(place) {
  const type = getType(place.typeId);
  const district = getDistrict(place.districtId);
  return `
    <div class="popup" dir="rtl">
      <div class="popup-type" style="--c:${esc(type.color)}">${esc(type.icon)} ${esc(type.label)}</div>
      <strong>${esc(place.name)}</strong>
      ${place.nameLocal ? `<div class="muted" dir="auto">${esc(place.nameLocal)}</div>` : ''}
      ${district ? `<div class="muted">${esc(district.name)}</div>` : ''}
      <button class="btn btn-sm" data-action="open-place" data-id="${esc(place.id)}">التفاصيل</button>
    </div>`;
}

/**
 * يرسم علامات الأماكن على الخريطة ويرجع خريطة id → marker
 * labelFn اختياري لكتابة رقم بدل الأيقونة (في خطة اليوم)
 */
export function drawPlaces(map, layer, places, { labelFn, fit = true, padding = 40 } = {}) {
  layer.clearLayers();
  const markers = new Map();
  const pts = [];
  places.filter(hasCoords).forEach((p, i) => {
    const type = getType(p.typeId);
    const m = L.marker([p.lat, p.lng], {
      icon: pinIcon(type, { label: labelFn ? labelFn(p, i) : undefined, visited: p.visited }),
      title: p.name,
      riseOnHover: true,
    }).bindPopup(popupHtml(p));
    m.addTo(layer);
    markers.set(p.id, m);
    pts.push([p.lat, p.lng]);
  });
  if (fit && pts.length) {
    if (pts.length === 1) map.setView(pts[0], 15);
    else map.fitBounds(pts, { padding: [padding, padding], maxZoom: 16 });
  }
  return markers;
}
