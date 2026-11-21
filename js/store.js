// إدارة البيانات وحفظها في local storage
import seed from '../data/seed.js';
import { uid, hasCoords } from './utils.js';

const KEY = 'istanbul-trip:v1';
const IMG_PREFIX = 'istanbul-trip:img:';
export const STORAGE_LIMIT = 5 * 1024 * 1024; // الحد التقريبي في أغلب المتصفحات

let state = null;
const listeners = new Set();

const clone = (o) => JSON.parse(JSON.stringify(o));

function readKey(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

function writeKey(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (err) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      throw new Error('امتلأت مساحة التخزين في المتصفح. احذفي بعض الصور ثم حاولي مرة أخرى.');
    }
    throw new Error('تعذّر الحفظ في المتصفح (قد يكون التخزين معطلاً في الوضع الخاص).');
  }
}

function normalizePlace(p) {
  return {
    id: p.id || uid('place'),
    name: p.name || '',
    nameLocal: p.nameLocal || '',
    typeId: p.typeId || 'other',
    districtId: p.districtId || '',
    address: p.address || '',
    lat: typeof p.lat === 'number' ? p.lat : null,
    lng: typeof p.lng === 'number' ? p.lng : null,
    mapsUrl: p.mapsUrl || '',
    mapsQuery: p.mapsQuery || '',
    approx: !!p.approx, // الإحداثيات تقريبية
    hours: p.hours || '',
    price: p.price || '',
    notes: p.notes || '',
    transport: {
      mode: p.transport?.mode || '',
      line: p.transport?.line || '',
      station: p.transport?.station || '',
      walkMinutes: Number.isFinite(p.transport?.walkMinutes) ? p.transport.walkMinutes : null,
      note: p.transport?.note || '',
    },
    day: Number.isInteger(p.day) ? p.day : null,
    order: Number.isFinite(p.order) ? p.order : 0,
    visited: !!p.visited,
    images: Array.isArray(p.images) ? p.images : [],
  };
}

function fromSeed() {
  const s = {
    schema: 1,
    seedVersion: seed.version,
    trip: clone(seed.trip),
    types: clone(seed.types),
    districts: clone(seed.districts),
    places: seed.places.map((p, i) => normalizePlace({ ...clone(p), order: i })),
    deletedSeedIds: [],
  };
  return s;
}

/** عند تحديث ملف البيانات (رقم version جديد) تُضاف العناصر الجديدة فقط */
function mergeSeed() {
  if (state.seedVersion === seed.version) return;
  // العناصر المحذوفة من ملف البيانات تُحذف أيضاً من المتصفح
  const removed = new Set(seed.removed || []);
  state.places
    .filter((p) => removed.has(p.id))
    .forEach((p) => p.images.forEach(removeImage));
  state.places = state.places.filter((p) => !removed.has(p.id));
  const deleted = new Set(state.deletedSeedIds || []);
  for (const kind of ['types', 'districts', 'places']) {
    const have = new Set(state[kind].map((x) => x.id));
    for (const item of seed[kind]) {
      if (have.has(item.id) || deleted.has(item.id)) continue;
      state[kind].push(kind === 'places' ? normalizePlace(clone(item)) : clone(item));
    }
  }
  state.seedVersion = seed.version;
}

function persist() {
  writeKey(KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn());
}

/** ينفّذ التعديل، ويتراجع عنه إذا فشل الحفظ */
function mutate(fn) {
  const backup = JSON.stringify(state);
  try {
    fn(state);
    persist();
  } catch (err) {
    state = JSON.parse(backup);
    throw err;
  }
}

export function load() {
  const raw = readKey(KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      state.places = state.places.map(normalizePlace);
    } catch {
      state = null;
    }
  }
  if (!state) state = fromSeed();
  else mergeSeed();
  try {
    writeKey(KEY, JSON.stringify(state));
  } catch {
    /* يعمل الموقع حتى لو تعذّر الحفظ */
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ——— قراءة ———
export const getState = () => state;
export const getTrip = () => state.trip;
export const getTypes = () => state.types;
export const getType = (id) =>
  state.types.find((t) => t.id === id) || { id, label: 'أخرى', icon: '📍', color: '#6b7280' };
export const getDistricts = () => state.districts;
export const getDistrict = (id) => state.districts.find((d) => d.id === id);
export const getPlaces = () => state.places;
export const getPlace = (id) => state.places.find((p) => p.id === id);
export const placesInDistrict = (id) => state.places.filter((p) => p.districtId === id);

export function placesForDay(day) {
  return state.places.filter((p) => p.day === day).sort((a, b) => a.order - b.order);
}

/** مركز الحي = متوسط إحداثيات أماكنه */
export function districtCenter(id) {
  const pts = placesInDistrict(id).filter(hasCoords);
  if (!pts.length) return null;
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

// ——— الأماكن ———
export function savePlace(data) {
  let saved;
  mutate((s) => {
    const idx = s.places.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const prev = s.places[idx];
      const next = normalizePlace({ ...prev, ...data });
      if (next.day !== prev.day) next.order = nextOrder(s, next.day);
      s.places[idx] = next;
      saved = next;
    } else {
      saved = normalizePlace({ ...data, id: uid('place') });
      saved.order = nextOrder(s, saved.day);
      s.places.push(saved);
    }
  });
  return saved;
}

function nextOrder(s, day) {
  const orders = s.places.filter((p) => p.day === day).map((p) => p.order);
  return orders.length ? Math.max(...orders) + 1 : 0;
}

export function deletePlace(id) {
  const place = getPlace(id);
  if (!place) return;
  mutate((s) => {
    s.places = s.places.filter((p) => p.id !== id);
    if (id.startsWith('seed-')) s.deletedSeedIds.push(id);
  });
  place.images.forEach(removeImage);
}

export function toggleVisited(id) {
  mutate((s) => {
    const p = s.places.find((x) => x.id === id);
    if (p) p.visited = !p.visited;
  });
}

export function setDay(id, day) {
  mutate((s) => {
    const p = s.places.find((x) => x.id === id);
    if (!p || p.day === day) return;
    p.day = day;
    p.order = nextOrder(s, day);
  });
}

/** تحريك مكان للأعلى (-1) أو للأسفل (+1) داخل خطة اليوم */
export function moveInDay(id, dir) {
  mutate((s) => {
    const p = s.places.find((x) => x.id === id);
    if (!p || p.day == null) return;
    const list = s.places.filter((x) => x.day === p.day).sort((a, b) => a.order - b.order);
    const i = list.indexOf(p);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    list.forEach((x, k) => (x.order = k));
  });
}

// ——— الأحياء ———
export function saveDistrict(data) {
  mutate((s) => {
    const idx = s.districts.findIndex((d) => d.id === data.id);
    if (idx >= 0) s.districts[idx] = { ...s.districts[idx], ...data };
    else s.districts.push({ ...data, id: uid('district') });
  });
}

export function deleteDistrict(id) {
  if (placesInDistrict(id).length) throw new Error('لا يمكن حذف حي فيه أماكن. انقلي الأماكن أو احذفيها أولاً.');
  mutate((s) => {
    s.districts = s.districts.filter((d) => d.id !== id);
    if (seed.districts.some((d) => d.id === id)) s.deletedSeedIds.push(id);
  });
}

// ——— الأنواع ———
export function saveType(data) {
  mutate((s) => {
    const idx = s.types.findIndex((t) => t.id === data.id);
    if (idx >= 0) s.types[idx] = { ...s.types[idx], ...data };
    else s.types.push({ ...data, id: uid('type') });
  });
}

export function deleteType(id) {
  if (state.places.some((p) => p.typeId === id)) throw new Error('هذا النوع مستخدم في بعض الأماكن، غيّري نوعها أولاً.');
  mutate((s) => {
    s.types = s.types.filter((t) => t.id !== id);
    if (seed.types.some((t) => t.id === id)) s.deletedSeedIds.push(id);
  });
}

// ——— الرحلة ———
export function saveTrip(data) {
  mutate((s) => {
    s.trip = { ...s.trip, ...data };
    const days = s.trip.days;
    s.places.forEach((p) => {
      if (p.day != null && p.day > days) p.day = null;
    });
  });
}

export function resetAll() {
  imageKeys().forEach((k) => localStorage.removeItem(k));
  state = fromSeed();
  persist();
}

// ——— الصور (كل صورة في مفتاح مستقل) ———
export function addImage(dataUrl) {
  const id = uid('img');
  writeKey(IMG_PREFIX + id, dataUrl);
  return id;
}

export const getImage = (id) => readKey(IMG_PREFIX + id);

export function removeImage(id) {
  try {
    localStorage.removeItem(IMG_PREFIX + id);
  } catch {
    /* تجاهل */
  }
}

function imageKeys() {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(IMG_PREFIX)) keys.push(k);
    }
  } catch {
    /* تجاهل */
  }
  return keys;
}

/** حجم البيانات المستخدم تقريباً (كل حرف = 2 بايت في المتصفح) */
export function storageUsage() {
  let data = 0;
  let images = 0;
  try {
    data = ((readKey(KEY) || '').length + KEY.length) * 2;
    imageKeys().forEach((k) => (images += ((readKey(k) || '').length + k.length) * 2));
  } catch {
    /* تجاهل */
  }
  return { data, images, total: data + images, count: imageKeys().length };
}
