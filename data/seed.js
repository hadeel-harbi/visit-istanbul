// البيانات الأولية للموقع.
// تُحمَّل تلقائياً عند أول فتح للموقع، ثم تُحفظ كل التعديلات في local storage.
//
// عند إضافة أماكن جديدة هنا لاحقاً: غيّري رقم `version`، وسيضيف الموقع
// الأماكن الجديدة فقط دون أن يمسح تعديلاتك أو صورك أو علامات «زرته».
//
// الأماكن التي تحمل approx: true إحداثياتها تقريبية، و mapsQuery هو اسم البحث
// الذي يفتح المكان الصحيح في Google Maps.

export default {
  version: 3,

  // أماكن حُذفت من الملف: تُحذف أيضاً من بيانات المتصفح عند التحديث
  removed: [
    'seed-ayasofya', 'seed-bluemosque', 'seed-cistern', 'seed-topkapi',
    'seed-suleymaniye', 'seed-taksim', 'seed-dolmabahce', 'seed-maiden', 'seed-camlica',
  ],

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
    { id: 'mall', label: 'مول ومركز تسوق', icon: '🏬', color: '#be185d' },
    { id: 'area', label: 'منطقة للتجول', icon: '🏘️', color: '#a16207' },
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
    {
      id: 'sisli',
      name: 'شيشلي (حربية ونيشانتاشي)',
      nameTr: 'Şişli',
      side: 'europe',
      description: 'منطقة راقية شمال تقسيم، فيها نيشانتاشي بمحلاتها ومطاعمها.',
      transportNotes: 'مترو M2 (محطة Osmanbey)، وحربية على بعد دقائق مشياً من ميدان تقسيم.',
    },
    {
      id: 'sariyer',
      name: 'ساريير (أيازآغا)',
      nameTr: 'Sarıyer',
      side: 'europe',
      description: 'منطقة حديثة شمال المدينة، فيها مول Vadistanbul.',
      transportNotes: 'مترو M2 إلى Seyrantepe، ثم قطار Havaray المعلّق F3 إلى داخل Vadistanbul (حوالي 7 دقائق).',
    },
    {
      id: 'eyupsultan',
      name: 'إيوب سلطان (قرب المطار)',
      nameTr: 'Eyüpsultan / İhsaniye',
      side: 'europe',
      description: 'منطقة بعيدة في الشمال قرب مطار إسطنبول، فيها Florentia Village.',
      transportNotes: 'مترو M11 (خط المطار) من Gayrettepe إلى محطة İhsaniye. الرحلة طويلة، فخصصي لها نصف يوم.',
    },
    {
      id: 'balat',
      name: 'بلاط (الفاتح)',
      nameTr: 'Balat',
      side: 'europe',
      description: 'حي تاريخي على الخليج الذهبي، يشتهر ببيوته الملونة وشوارعه الصاعدة ومقاهيه الصغيرة.',
      transportNotes: 'ترام T5 من أمين أونو (محطة Balat أو Fener)، أو باصات من أمين أونو، أو عبّارة خط الخليج الذهبي إلى رصيف Balat.',
    },
  ],

  places: [
    // ——— السلطان أحمد ———
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
      id: 'seed-karakoy-gulluoglu', name: 'كاراكوي غُلّو أوغلو (بقلاوة)', nameLocal: 'Karaköy Güllüoğlu',
      typeId: 'cafe', districtId: 'beyoglu',
      address: 'Kemankeş Karamustafa Paşa, Rıhtım Cd., Beyoğlu',
      lat: 41.02340, lng: 28.97960,
      transport: { mode: 'tram', line: 'T1', station: 'Karaköy', walkMinutes: 3, note: '' },
      day: 3,
    },

    // ——— بشكتاش ———
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
      lat: 40.99060, lng: 29.02630, approx: true, mapsQuery: 'Kadıköy Çarşı',
      notes: 'بازار شعبي فيه محلات طعام وتوابل وأسماك وحلويات.',
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

    // ——— إضافات ———
    {
      id: 'seed-galataport', name: 'غلطة بورت', nameLocal: 'Galataport İstanbul',
      typeId: 'mall', districtId: 'beyoglu',
      address: 'Kılıçali Paşa, Meclis-i Mebusan Cd., Beyoğlu',
      lat: 41.02680, lng: 28.98380, approx: true, mapsQuery: 'Galataport İstanbul',
      notes: 'منطقة تسوق ومطاعم على البوسفور بين كاراكوي وتوفانه.',
      transport: { mode: 'tram', line: 'T1', station: 'Tophane', walkMinutes: 3, note: 'أو محطة Karaköy.' },
    },
    {
      id: 'seed-tersane', name: 'ترسانة إسطنبول (مول)', nameLocal: 'Tersane İstanbul',
      typeId: 'mall', districtId: 'beyoglu',
      address: 'Camiikebir, Taşkızak Tersanesi Cd., Beyoğlu',
      lat: 41.03450, lng: 28.96050, approx: true, mapsQuery: 'Tersane İstanbul',
      notes: 'مجمع جديد على الخليج الذهبي في مبنى ترسانة السفن القديمة.',
      transport: { mode: 'ferry', line: 'Haliç', station: 'Hasköy', walkMinutes: 5, note: 'عبّارات خط الخليج الذهبي من أمين أونو وكاراكوي، أو تاكسي من تقسيم.' },
    },
    {
      id: 'seed-zorlu', name: 'زورلو سنتر', nameLocal: 'Zorlu Center',
      typeId: 'mall', districtId: 'besiktas',
      address: 'Levazım, Koru Sokağı No:2, Beşiktaş',
      lat: 41.06700, lng: 29.01700, approx: true, mapsQuery: 'Zorlu Center',
      transport: { mode: 'metro', line: 'M2', station: 'Gayrettepe', walkMinutes: 12, note: 'أو متروباص Zincirlikuyu.' },
    },
    {
      id: 'seed-kofteci-yusuf', name: 'مطعم كفتجي يوسف', nameLocal: 'Köfteci Yusuf',
      typeId: 'restaurant', districtId: 'besiktas',
      lat: null, lng: null, mapsQuery: 'Köfteci Yusuf',
      notes: 'سلسلة كفتة مشهورة لها فروع كثيرة. زر Google Maps يعرض أقرب فرع لموقعك.',
    },
    {
      id: 'seed-boac', name: 'BOAC (قهوة و Soft Serve)', nameLocal: 'BOAC Soft Serve',
      typeId: 'cafe', districtId: 'kadikoy',
      address: 'General Asım Gündüz Cd., Kadıköy',
      lat: 40.98800, lng: 29.03050, approx: true, mapsQuery: 'BOAC Soft Serve General Asım Gündüz Kadıköy',
      hours: '11:00 - 24:00',
      notes: 'مشهور بالتيراميسو والآيس كريم الطري.',
      transport: { mode: 'ferry', line: '', station: 'Kadıköy İskelesi', walkMinutes: 15, note: 'أو ترام Moda الصغير.' },
    },
    {
      id: 'seed-kuzguncuk', name: 'قوزغونجوك', nameLocal: 'Kuzguncuk',
      typeId: 'area', districtId: 'uskudar',
      lat: 41.03680, lng: 29.03020, approx: true, mapsQuery: 'Kuzguncuk Üsküdar',
      notes: 'حي صغير ملوّن على البوسفور بيوته خشبية قديمة، ومقاهيه هادئة.',
      transport: { mode: 'bus', line: '15', station: 'Kuzguncuk', walkMinutes: 2, note: 'باصات الساحل من ميدان أسكدار (حوالي 10 دقائق)، أو تاكسي.' },
    },
    {
      id: 'seed-icadiye', name: 'شارع إيجادية', nameLocal: 'İcadiye Caddesi',
      typeId: 'area', districtId: 'uskudar',
      lat: 41.03500, lng: 29.03250, approx: true, mapsQuery: 'İcadiye Caddesi Kuzguncuk',
      notes: 'الشارع الرئيسي في قوزغونجوك، صاعد من الساحل، فيه البيوت الملونة والمقاهي.',
      transport: { mode: 'walk', line: '', station: 'Kuzguncuk', walkMinutes: 3, note: 'يمكن زيارته مع قوزغونجوك في نفس المشوار.' },
    },
    {
      id: 'seed-huqqabaz-garden', name: 'مطعم حُقّه باز غاردن', nameLocal: 'HuQQabaz Garden',
      typeId: 'restaurant', districtId: 'uskudar',
      address: 'Paşalimanı, Üsküdar',
      lat: 41.03100, lng: 29.01950, approx: true, mapsQuery: 'HuQQabaz Garden Paşalimanı',
      notes: 'في قصر تاريخي على البوسفور. يُفضَّل الحجز.',
      transport: { mode: 'bus', line: '', station: 'Paşalimanı', walkMinutes: 2, note: 'قريب من ميدان أسكدار (تاكسي 5 دقائق)، ويمكن ضمه لمشوار قوزغونجوك.' },
    },
    {
      id: 'seed-zoyas-house', name: "مطعم Zoya's House", nameLocal: "Zoya's House",
      typeId: 'restaurant', districtId: 'sisli',
      address: 'Harbiye, Şişli',
      lat: 41.04700, lng: 28.99050, approx: true, mapsQuery: "Zoya's House Harbiye",
      transport: { mode: 'metro', line: 'M2', station: 'Osmanbey', walkMinutes: 10, note: 'أو مشياً من ميدان تقسيم.' },
    },
    {
      id: 'seed-vadistanbul', name: 'فادي إسطنبول', nameLocal: 'Vadistanbul AVM',
      typeId: 'mall', districtId: 'sariyer',
      address: 'Ayazağa, Azerbaycan Cd. No:3/C, Sarıyer',
      lat: 41.10720, lng: 28.98830, mapsQuery: 'Vadistanbul AVM',
      transport: { mode: 'metro', line: 'M2 + F3', station: 'Seyrantepe', walkMinutes: 0, note: 'من Seyrantepe اركبي Havaray F3، ومحطته الأخيرة داخل المول.' },
    },
    {
      id: 'seed-florentia', name: 'فلورنتيا فيليج', nameLocal: 'Florentia Village İstanbul',
      typeId: 'mall', districtId: 'eyupsultan',
      address: 'İhsaniye, İstanbul Cd. No:17, Eyüpsultan',
      lat: 41.24280, lng: 28.80890, approx: true, mapsQuery: 'Florentia Village İstanbul',
      notes: 'أول أوتلت للماركات الفاخرة في تركيا، قرب مطار إسطنبول.',
      transport: { mode: 'metro', line: 'M11', station: 'İhsaniye', walkMinutes: 3, note: 'خط مترو المطار، والمحطة عند المدخل تقريباً.' },
    },
    {
      id: 'seed-le-petit-pera', name: 'لو بوتي بيرا كافيه', nameLocal: 'Le Petit Pera Cafe',
      typeId: 'cafe', districtId: 'beyoglu',
      address: 'Kemankeş Karamustafa Paşa, Ali Paşa Değirmeni Sk. No:4, Karaköy',
      lat: 41.02500, lng: 28.97750, approx: true, mapsQuery: 'Le Petit Pera Cafe Karaköy',
      hours: '10:00 - 23:00',
      notes: 'مشهور بتشيز كيك سان سباستيان والبراونيز.',
      transport: { mode: 'tram', line: 'T1', station: 'Karaköy', walkMinutes: 5, note: '' },
    },
    {
      id: 'seed-siftah', name: 'مطعم سفتاه كباب كاراكوي', nameLocal: 'Siftah Kebap Karaköy',
      typeId: 'restaurant', districtId: 'beyoglu',
      address: 'Mumhane Cd. No:56, Karaköy, Beyoğlu',
      lat: 41.02470, lng: 28.98000, approx: true, mapsQuery: 'Siftah Kebap Karaköy',
      hours: '10:00 - 02:00',
      notes: 'كباب على الطريقة العنتابية، والمطعم صغير وطاولاته قليلة.',
      transport: { mode: 'tram', line: 'T1', station: 'Karaköy', walkMinutes: 4, note: 'قريب من غلطة بورت.' },
    },
    {
      id: 'seed-balat-houses', name: 'بيوت بلاط الملونة', nameLocal: 'Balat Renkli Evler (Kiremit Cd.)',
      typeId: 'attraction', districtId: 'balat',
      address: 'Kiremit Cd., Balat, Fatih',
      lat: 41.02960, lng: 28.94760, approx: true, mapsQuery: 'Balat colorful houses Kiremit Caddesi',
      notes: 'أجمل وقت للتصوير صباح أيام الأسبوع (9 - 11). البيوت مسكونة، فصوّري الشارع لا النوافذ.',
      transport: { mode: 'tram', line: 'T5', station: 'Balat', walkMinutes: 5, note: 'الطريق من المحطة صعود.' },
    },
  ],
};
