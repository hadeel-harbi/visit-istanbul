// أدوات مساعدة عامة

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const TRANSPORT_MODES = {
  tram: { label: 'ترام', icon: '🚋' },
  metro: { label: 'مترو', icon: '🚇' },
  marmaray: { label: 'مرمراي', icon: '🚆' },
  funicular: { label: 'فونيكولار/تلفريك', icon: '🚠' },
  ferry: { label: 'عبّارة', icon: '⛴️' },
  bus: { label: 'باص', icon: '🚌' },
  walk: { label: 'مشي', icon: '🚶' },
  taxi: { label: 'تاكسي', icon: '🚕' },
};

export const SIDES = {
  europe: 'الجانب الأوروبي',
  asia: 'الجانب الآسيوي',
};

function validCoords(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/**
 * يستخرج الإحداثيات من نص: إحداثيات مباشرة "41.0086, 28.9802"
 * أو رابط Google Maps طويل (@lat,lng أو !3dlat!4dlng أو q=lat,lng).
 * الروابط المختصرة (maps.app.goo.gl) لا تحتوي على إحداثيات فتُرجع null.
 */
export function parseCoords(text) {
  if (!text) return null;
  const s = decodeURIComponent(String(text).trim());
  const num = '(-?\\d{1,3}\\.\\d+)';
  const patterns = [
    new RegExp(`!3d${num}!4d${num}`), // موقع المكان الفعلي (أدق من @)
    new RegExp(`[?&](?:q|query|ll|destination|center)=${num},\\s*${num}`),
    new RegExp(`@${num},${num}`),
    new RegExp(`^${num}\\s*[,،\\s]\\s*${num}$`),
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (validCoords(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

export function isShortMapsLink(text) {
  return /(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(text || '');
}

export function hasCoords(place) {
  return validCoords(place?.lat, place?.lng);
}

export function mapsLink(place) {
  if (place.mapsUrl) return place.mapsUrl;
  if (hasCoords(place)) return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.nameLocal || place.name} Istanbul`)}`;
}

export function directionsLink(place) {
  const dest = hasCoords(place) ? `${place.lat},${place.lng}` : encodeURIComponent(`${place.nameLocal || place.name} Istanbul`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=transit`;
}

/** يصغّر الصورة ويضغطها لتناسب مساحة local storage المحدودة */
export function compressImage(file, maxDim = 1100, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذّر قراءة الصورة'));
    };
    img.src = url;
  });
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ك.ب`;
  return `${(bytes / 1024 / 1024).toFixed(2)} م.ب`;
}

export function dayDate(startDate, dayNumber) {
  if (!startDate) return '';
  const d = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + dayNumber - 1);
  return d.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function toast(message, kind = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}
