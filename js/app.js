// نقطة البداية: التوجيه بين الصفحات والتعامل مع الأزرار
import * as store from './store.js';
import { toast } from './utils.js';
import { homeView, districtView, daysView, settingsView } from './views.js';
import {
  initModal, closeModal, refreshModal, openPlaceDetails, openPlaceForm,
  openDistrictForm, openTypeForm,
} from './components.js';

const app = document.getElementById('app');
let current = null;

function resolve(hash) {
  const [, page, param] = (hash.replace(/^#/, '') || '/').split('/');
  switch (page) {
    case 'district':
      return districtView(decodeURIComponent(param || ''));
    case 'all':
      return districtView('all');
    case 'days':
      return daysView(param);
    case 'settings':
      return settingsView();
    default:
      return homeView();
  }
}

function route() {
  current?.unmount();
  closeModal();
  const view = resolve(location.hash);
  if (view.exists && !view.exists()) {
    location.replace('#/');
    return;
  }
  current = view;
  app.innerHTML = '';
  current.mount(app);
  document.title = `${current.title} · ${store.getTrip().title || 'رحلتي إلى إسطنبول'}`;
  document.querySelectorAll('.nav a').forEach((a) => {
    const target = a.getAttribute('href').split('/')[1] || '';
    const page = location.hash.replace(/^#\/?/, '').split('/')[0];
    a.classList.toggle('active', target === page || (target === '' && page === ''));
  });
  window.scrollTo(0, 0);
}

function safely(fn) {
  try {
    fn();
  } catch (err) {
    toast(err.message, 'error');
  }
}

// الأزرار المشتركة في كل الصفحات
const actions = {
  'close-modal': () => closeModal(),
  'open-place': (el) => openPlaceDetails(el.dataset.id),
  'add-place': (el) => openPlaceForm(null, el.dataset.district ? { districtId: el.dataset.district } : {}),
  'edit-place': (el) => openPlaceForm(el.dataset.id),
  'delete-place': (el) => {
    const p = store.getPlace(el.dataset.id);
    if (p && confirm(`حذف «${p.name}»؟`)) {
      closeModal();
      safely(() => store.deletePlace(p.id));
    }
  },
  'toggle-visited': (el) => safely(() => store.toggleVisited(el.dataset.id)),
  'add-district': () => openDistrictForm(),
  'edit-district': (el) => openDistrictForm(el.dataset.id),
  'delete-district': (el) => {
    const d = store.getDistrict(el.dataset.id);
    if (d && confirm(`حذف حي «${d.name}»؟`)) safely(() => store.deleteDistrict(d.id));
  },
  'add-type': () => openTypeForm(),
  'edit-type': (el) => openTypeForm(el.dataset.id),
  'delete-type': (el) => {
    const t = store.getType(el.dataset.id);
    if (confirm(`حذف نوع «${t.label}»؟`)) safely(() => store.deleteType(t.id));
  },
  'reset-all': () => {
    if (confirm('سيتم حذف كل تعديلاتك وصورك والرجوع للبيانات الأصلية. هل أنتِ متأكدة؟')) {
      safely(() => store.resetAll());
      toast('تمت إعادة الضبط', 'success');
    }
  },
};

function handleAction(el, event) {
  const name = el.dataset.action;
  const fn = current?.actions?.[name] || actions[name];
  if (!fn) return;
  if (el.tagName !== 'A') event.preventDefault();
  fn(el, event);
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'SELECT') return;
  handleAction(el, e);
});

// البطاقات القابلة للضغط عبر لوحة المفاتيح
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('[role="button"][data-action]');
  if (el && e.target === el) handleAction(el, e);
});

// تغيير يوم المكان من القوائم المنسدلة
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset?.action !== 'set-day') return;
  safely(() => store.setDay(el.dataset.id, el.value ? parseInt(el.value, 10) : null));
  if (el.value) toast(`أُضيف إلى اليوم ${el.value}`, 'success');
});

// ——— التشغيل ———
store.load();
initModal();
store.subscribe(() => {
  current?.update();
  refreshModal();
});
window.addEventListener('hashchange', route);
route();
