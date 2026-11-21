// البيانات الأولية للموقع.
// تُحمَّل تلقائياً عند أول فتح للموقع، ثم تُحفظ كل التعديلات في local storage.
//
// عند إضافة أماكن جديدة هنا لاحقاً: غيّري رقم `version`، وسيضيف الموقع
// الأماكن الجديدة فقط دون أن يمسح تعديلاتك أو صورك أو علامات «زرته».
//
// ملاحظة: الأماكن الحالية بيانات تجريبية بإحداثيات تقريبية، استبدليها ببياناتك.

export default {
  version: 1,

  trip: {
    title: 'رحلتي إلى إسطنبول',
    startDate: '', // مثال: '2026-12-10'
    days: 5,
  },

  // أنواع الأماكن: يمكن إضافة أنواع أخرى من صفحة الإعدادات
  types: [
    { id: 'attraction', label: 'معلم سياحي', icon: '🕌', color: '#b5432c' },
    { id: 'restaurant', label: 'مطعم', icon: '🍽️', color: '#d9762b' },
    { id: 'cafe', label: 'مقهى وحلويات', icon: '☕', color: '#8a5a3c' },
    { id: 'shop', label: 'محل وسوق', icon: '🛍️', color: '#8a3f8f' },
    { id: 'park', label: 'حديقة', icon: '🌳', color: '#2f7d4a' },
    { id: 'hotel', label: 'فندق', icon: '🏨', color: '#1d4e89' },
    { id: 'station', label: 'محطة مواصلات', icon: '🚉', color: '#13867a' },
    { id: 'other', label: 'أخرى', icon: '📍', color: '#6b7280' },
  ],

  districts: [
    {
      id: 'sultanahmet',
      name: 'السلطان أحمد',
      nameTr: 'Sultanahmet',
      side: 'europe',
      description: 'قلب إسطنبول التاريخي: آيا صوفيا والجامع الأزرق وقصر توبكابي، وكلها متقاربة ويمكن زيارتها مشياً.',
      transportNotes: 'ترام T1 (محطات Sultanahmet وGülhane). معظم الأماكن تبعد عن بعضها بضع دقائق مشياً.',
    },
    {
      id: 'eminonu',
      name: 'أمين أونو',
      nameTr: 'Eminönü',
      side: 'europe',
      description: 'منطقة الأسواق القديمة على الخليج الذهبي: البازار الكبير وسوق التوابل وجامع السليمانية.',
      transportNotes: 'ترام T1 (محطات Eminönü وBeyazıt-Kapalıçarşı)، وعبّارات إلى قاضي كوي وأسكدار من رصيف أمين أونو.',
    },
    {
      id: 'beyoglu',
      name: 'بيوغلو (تقسيم وغلطة)',
      nameTr: 'Beyoğlu',
      side: 'europe',
      description: 'ميدان تقسيم وشارع الاستقلال وبرج غلطة، وهي منطقة مليئة بالمطاعم والمقاهي والمحلات.',
      transportNotes: 'مترو M2 (Taksim وŞişhane)، وقطار Tünel ومن ميدان تقسيم ترام الحنين على شارع الاستقلال، وفونيكولار F1 من Kabataş إلى Taksim.',
    },
    {
      id: 'besiktas',
      name: 'بشكتاش',
      nameTr: 'Beşiktaş',
      side: 'europe',
      description: 'قصر دولمة بهجة والواجهة البحرية على البوسفور.',
      transportNotes: 'ترام T1 حتى Kabataş ثم مشياً، أو عبّارة إلى رصيف Beşiktaş من الجانب الآسيوي.',
    },
    {
      id: 'kadikoy',
      name: 'قاضي كوي',
      nameTr: 'Kadıköy',
      side: 'asia',
      description: 'حي حيوي على الجانب الآسيوي، فيه سوق طعام شهير وساحل مودا.',
      transportNotes: 'عبّارة من أمين أونو أو كاراكوي أو بشكتاش (حوالي 20 دقيقة)، أو مرمراي إلى محطة Ayrılık Çeşmesi.',
    },
    {
      id: 'uskudar',
      name: 'أسكدار',
      nameTr: 'Üsküdar',
      side: 'asia',
      description: 'حي هادئ ومحافظ على البوسفور، ومنه يُرى برج الفتاة.',
      transportNotes: 'مرمراي من Sirkeci (دقائق قليلة تحت البحر)، أو عبّارة من أمين أونو وبشكتاش.',
    },
  ],

  places: [
    // ——— السلطان أحمد ———
    {
      id: 'seed-ayasofya', name: 'آيا صوفيا', nameLocal: 'Ayasofya-i Kebir Camii',
      typeId: 'attraction', districtId: 'sultanahmet',
      address: 'Sultan Ahmet, Ayasofya Meydanı No:1, Fatih',
      lat: 41.00858, lng: 28.98017,
      hours: '', notes: 'تُغلق للزوار وقت الصلاة.',
      transport: { mode: 'tram', line: 'T1', station: 'Sultanahmet', walkMinutes: 4, note: '' },
      day: 1,
    },
    {
      id: 'seed-bluemosque', name: 'الجامع الأزرق (جامع السلطان أحمد)', nameLocal: 'Sultan Ahmet Camii',
      typeId: 'attraction', districtId: 'sultanahmet',
      address: 'Sultan Ahmet, Atmeydanı Cd. No:7, Fatih',
      lat: 41.00539, lng: 28.97680,
      notes: 'يُطلب لباس محتشم، وتتوفر أغطية للرأس عند المدخل.',
      transport: { mode: 'tram', line: 'T1', station: 'Sultanahmet', walkMinutes: 4, note: '' },
      day: 1,
    },
    {
      id: 'seed-cistern', name: 'صهريج البازيليك', nameLocal: 'Yerebatan Sarnıcı',
      typeId: 'attraction', districtId: 'sultanahmet',
      address: 'Alemdar, Yerebatan Cd. 1/3, Fatih',
      lat: 41.00838, lng: 28.97792,
      transport: { mode: 'tram', line: 'T1', station: 'Sultanahmet', walkMinutes: 2, note: '' },
      day: 1,
    },
    {
      id: 'seed-topkapi', name: 'قصر توبكابي', nameLocal: 'Topkapı Sarayı',
      typeId: 'attraction', districtId: 'sultanahmet',
      address: 'Cankurtaran, 34122 Fatih',
      lat: 41.01153, lng: 28.98337,
      notes: 'يُغلق يوم الثلاثاء (تأكدي من المواعيد قبل الذهاب).',
      transport: { mode: 'tram', line: 'T1', station: 'Gülhane', walkMinutes: 8, note: '' },
      day: 2,
    },
    {
      id: 'seed-gulhane', name: 'حديقة كلخانة', nameLocal: 'Gülhane Parkı',
      typeId: 'park', districtId: 'sultanahmet',
      address: 'Cankurtaran, Fatih',
      lat: 41.01278, lng: 28.98139,
      transport: { mode: 'tram', line: 'T1', station: 'Gülhane', walkMinutes: 1, note: '' },
      day: 2,
    },
    {
      id: 'seed-hotel', name: 'فندقي (مثال، عدّليه)', nameLocal: '',
      typeId: 'hotel', districtId: 'sultanahmet',
      address: '', lat: 41.00650, lng: 28.97200,
      notes: 'ضعي هنا اسم الفندق ورقم الحجز ووقت تسجيل الدخول.',
      transport: { mode: 'tram', line: 'T1', station: 'Sultanahmet', walkMinutes: 6, note: '' },
    },
    {
      id: 'seed-st-sultanahmet', name: 'محطة ترام السلطان أحمد', nameLocal: 'Sultanahmet (T1)',
      typeId: 'station', districtId: 'sultanahmet',
      lat: 41.00792, lng: 28.97546,
      transport: { mode: 'tram', line: 'T1', station: 'Sultanahmet', walkMinutes: 0, note: 'يربط بين Kabataş وBağcılar مروراً بأمين أونو.' },
    },

    // ——— أمين أونو ———
    {
      id: 'seed-grandbazaar', name: 'البازار الكبير', nameLocal: 'Kapalıçarşı',
      typeId: 'shop', districtId: 'eminonu',
      address: 'Beyazıt, Kalpakçılar Cd. No:22, Fatih',
      lat: 41.01066, lng: 28.96808,
      notes: 'مغلق يوم الأحد.',
      transport: { mode: 'tram', line: 'T1', station: 'Beyazıt-Kapalıçarşı', walkMinutes: 3, note: '' },
      day: 2,
    },
    {
      id: 'seed-spicebazaar', name: 'سوق التوابل (السوق المصري)', nameLocal: 'Mısır Çarşısı',
      typeId: 'shop', districtId: 'eminonu',
      address: 'Rüstem Paşa, Erzak Ambarı Sok. No:92, Fatih',
      lat: 41.01653, lng: 28.97059,
      transport: { mode: 'tram', line: 'T1', station: 'Eminönü', walkMinutes: 3, note: '' },
      day: 3,
    },
    {
      id: 'seed-suleymaniye', name: 'جامع السليمانية', nameLocal: 'Süleymaniye Camii',
      typeId: 'attraction', districtId: 'eminonu',
      address: 'Süleymaniye, Prof. Sıddık Sami Onar Cd. No:1, Fatih',
      lat: 41.01608, lng: 28.96398,
      transport: { mode: 'tram', line: 'T1', station: 'Beyazıt-Kapalıçarşı', walkMinutes: 12, note: 'الطريق صعود خفيف.' },
      day: 3,
    },
    {
      id: 'seed-st-eminonu-ferry', name: 'رصيف عبّارات أمين أونو', nameLocal: 'Eminönü İskelesi',
      typeId: 'station', districtId: 'eminonu',
      lat: 41.01767, lng: 28.97389,
      transport: { mode: 'ferry', line: '', station: 'Eminönü', walkMinutes: 0, note: 'عبّارات إلى قاضي كوي وأسكدار، وجولات البوسفور.' },
    },

    // ——— بيوغلو ———
    {
      id: 'seed-galata', name: 'برج غلطة', nameLocal: 'Galata Kulesi',
      typeId: 'attraction', districtId: 'beyoglu',
      address: 'Bereketzade, Galata Kulesi, Beyoğlu',
      lat: 41.02562, lng: 28.97418,
      transport: { mode: 'metro', line: 'M2', station: 'Şişhane', walkMinutes: 7, note: 'أو ترام T1 إلى Karaköy ثم 10 دقائق صعوداً.' },
      day: 3,
    },
    {
      id: 'seed-istiklal', name: 'شارع الاستقلال', nameLocal: 'İstiklal Caddesi',
      typeId: 'shop', districtId: 'beyoglu',
      lat: 41.03340, lng: 28.97770,
      transport: { mode: 'metro', line: 'M2', station: 'Taksim', walkMinutes: 2, note: 'يمتد من ميدان تقسيم إلى Tünel.' },
      day: 4,
    },
    {
      id: 'seed-taksim', name: 'ميدان تقسيم', nameLocal: 'Taksim Meydanı',
      typeId: 'attraction', districtId: 'beyoglu',
      lat: 41.03700, lng: 28.98500,
      transport: { mode: 'metro', line: 'M2', station: 'Taksim', walkMinutes: 1, note: '' },
      day: 4,
    },
    {
      id: 'seed-karakoy-gulluoglu', name: 'كاراكوي غُلّو أوغلو (بقلاوة)', nameLocal: 'Karaköy Güllüoğlu',
      typeId: 'cafe', districtId: 'beyoglu',
      address: 'Kemankeş Karamustafa Paşa, Rıhtım Cd., Beyoğlu',
      lat: 41.02340, lng: 28.97960,
      transport: { mode: 'tram', line: 'T1', station: 'Karaköy', walkMinutes: 3, note: '' },
      day: 3,
    },

    // ——— بشكتاش ———
    {
      id: 'seed-dolmabahce', name: 'قصر دولمة بهجة', nameLocal: 'Dolmabahçe Sarayı',
      typeId: 'attraction', districtId: 'besiktas',
      address: 'Vişnezade, Dolmabahçe Cd., Beşiktaş',
      lat: 41.03914, lng: 29.00057,
      notes: 'يُغلق يوم الاثنين.',
      transport: { mode: 'tram', line: 'T1', station: 'Kabataş', walkMinutes: 8, note: '' },
      day: 4,
    },
    {
      id: 'seed-yildiz', name: 'حديقة يلدز', nameLocal: 'Yıldız Parkı',
      typeId: 'park', districtId: 'besiktas',
      lat: 41.04880, lng: 29.01220,
      transport: { mode: 'bus', line: '', station: 'Çırağan', walkMinutes: 5, note: '' },
    },

    // ——— قاضي كوي ———
    {
      id: 'seed-kadikoy-market', name: 'سوق قاضي كوي', nameLocal: 'Kadıköy Çarşı',
      typeId: 'shop', districtId: 'kadikoy',
      lat: 40.99060, lng: 29.02630,
      transport: { mode: 'ferry', line: '', station: 'Kadıköy İskelesi', walkMinutes: 5, note: 'عبّارة من أمين أونو.' },
      day: 5,
    },
    {
      id: 'seed-moda', name: 'ساحل مودا', nameLocal: 'Moda Sahili',
      typeId: 'park', districtId: 'kadikoy',
      lat: 40.98140, lng: 29.02520,
      transport: { mode: 'walk', line: '', station: 'Kadıköy İskelesi', walkMinutes: 15, note: 'أو ترام Moda الصغير.' },
      day: 5,
    },
    {
      id: 'seed-st-kadikoy-ferry', name: 'رصيف عبّارات قاضي كوي', nameLocal: 'Kadıköy İskelesi',
      typeId: 'station', districtId: 'kadikoy',
      lat: 40.99250, lng: 29.02300,
      transport: { mode: 'ferry', line: '', station: 'Kadıköy', walkMinutes: 0, note: '' },
    },

    // ——— أسكدار ———
    {
      id: 'seed-maiden', name: 'برج الفتاة', nameLocal: 'Kız Kulesi',
      typeId: 'attraction', districtId: 'uskudar',
      lat: 41.02112, lng: 29.00412,
      transport: { mode: 'ferry', line: '', station: 'Salacak', walkMinutes: 2, note: 'قارب صغير من رصيف Salacak إلى البرج.' },
      day: 5,
    },
    {
      id: 'seed-camlica', name: 'جامع تشامليجا', nameLocal: 'Büyük Çamlıca Camii',
      typeId: 'attraction', districtId: 'uskudar',
      lat: 41.02750, lng: 29.06850,
      transport: { mode: 'metro', line: 'M5', station: 'Kısıklı', walkMinutes: 15, note: '' },
    },
  ],
};
