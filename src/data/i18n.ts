import { CategoryId, Language } from '../types/hub';

export interface TranslationBundle {
  brandName: string;
  tagline: string;
  nav: {
    categories: string;
    allTools: string;
    favorites: string;
    about: string;
    searchButton: string;
    home: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    browseAll: string;
    exploreCategories: string;
    privacyNote: string;
  };
  sections: {
    quickAccess: string;
    recentlyUsed: string;
    yourFavorites: string;
    popularTools: string;
    allCategories: string;
    recentlyAdded: string;
    viewAll: string;
    relatedTools: string;
    howToUse: string;
    faq: string;
    browseCategory: string;
    toolsCount: string;
  };
  actions: {
    copy: string;
    copied: string;
    download: string;
    downloadZip: string;
    reset: string;
    clear: string;
    clearHistory: string;
    cancel: string;
    confirm: string;
    addFavorite: string;
    removeFavorite: string;
    openTool: string;
    backHome: string;
    lightMode: string;
    darkMode: string;
    language: string;
  };
  search: {
    modalTitle: string;
    placeholder: string;
    recentSearches: string;
    noResults: string;
    noResultsHint: string;
    allCategoriesFilter: string;
    shortcutHint: string;
  };
  favorites: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    recentTitle: string;
    emptyRecent: string;
    calcHistoryTitle: string;
    emptyCalcHistory: string;
    confirmClearTitle: string;
    confirmClearDesc: string;
  };
  footer: {
    description: string;
    toolsHeading: string;
    companyHeading: string;
    legalHeading: string;
    contact: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    copyright: string;
    localProcessingNote: string;
  };
  categories: Record<CategoryId, { name: string; shortName: string; description: string }>;
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    brandName: 'Smart Tools Hub',
    tagline: 'Your Everyday Tools, All in One Place.',
    nav: {
      categories: 'Categories',
      allTools: 'All Tools',
      favorites: 'Favorites',
      about: 'About',
      searchButton: 'Search Tools',
      home: 'Home',
    },
    hero: {
      eyebrow: '48 Browser Utilities · 10 Categories · Zero Uploads Required',
      title: 'Your Everyday Tools, All in One Place.',
      subtitle:
        'Resize images, edit PDFs, calculate finances, generate QR codes, format code, and build printable documents directly inside your browser—fast, clean, and private.',
      searchPlaceholder: 'Search 48 tools (e.g. Image Resizer, PDF Merger, BMI, QR, JSON)...',
      browseAll: 'Browse All Tools',
      exploreCategories: 'Explore Categories',
      privacyNote: 'Files stay on your device. No sign-up or installation needed.',
    },
    sections: {
      quickAccess: 'Quick Access',
      recentlyUsed: 'Recently Used',
      yourFavorites: 'Saved Favorites',
      popularTools: 'Popular Tools',
      allCategories: 'Browse by Category',
      recentlyAdded: 'Recently Added Utilities',
      viewAll: 'View all',
      relatedTools: 'Related Tools',
      howToUse: 'How to Use',
      faq: 'Frequently Asked Questions',
      browseCategory: 'Open category',
      toolsCount: 'tools',
    },
    actions: {
      copy: 'Copy',
      copied: 'Copied to clipboard',
      download: 'Download',
      downloadZip: 'Download ZIP',
      reset: 'Reset',
      clear: 'Clear',
      clearHistory: 'Clear History',
      cancel: 'Cancel',
      confirm: 'Confirm',
      addFavorite: 'Save to Favorites',
      removeFavorite: 'Saved in Favorites',
      openTool: 'Open Tool',
      backHome: 'Back to Homepage',
      lightMode: 'Light',
      darkMode: 'Dark',
      language: 'Language',
    },
    search: {
      modalTitle: 'Search Smart Tools Hub',
      placeholder: 'Type a tool name, format, or task...',
      recentSearches: 'Recent Searches',
      noResults: 'No matching tools found',
      noResultsHint: 'Try searching for PDF, Image, Calculator, QR, Password, or JSON.',
      allCategoriesFilter: 'All',
      shortcutHint: 'Use ↑ ↓ to navigate, Enter to open, Esc to close',
    },
    favorites: {
      title: 'Favorites & Recent Activity',
      subtitle: 'Your saved tools, recent visits, and local calculator log—stored only on this browser.',
      emptyTitle: 'No favorite tools saved yet',
      emptyDesc: 'Click the star button on any tool to pin it here for instant access.',
      recentTitle: 'Recently Visited Tools',
      emptyRecent: 'Tools you open will appear here automatically.',
      calcHistoryTitle: 'Local Calculation History',
      emptyCalcHistory: 'Completed calculator runs will be logged here locally.',
      confirmClearTitle: 'Clear local history?',
      confirmClearDesc: 'This removes your recently visited tools and local calculation history from this browser.',
    },
    footer: {
      description: 'Fast, trustworthy everyday tools running locally in your browser across 10 practical categories.',
      toolsHeading: 'Top Categories',
      companyHeading: 'Explore',
      legalHeading: 'Information',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      disclaimer: 'Disclaimer',
      copyright: 'Smart Tools Hub. Built for fast, private browser productivity.',
      localProcessingNote: 'Browser-first processing · No account required',
    },
    categories: {
      'image-tools': {
        name: 'Image & Photo Tools',
        shortName: 'Image',
        description: 'Resize, compress to target KB, crop, convert formats, and prepare passport or signature photos.',
      },
      'pdf-tools': {
        name: 'PDF Tools',
        shortName: 'PDF',
        description: 'Merge, split, rotate, delete pages, convert images to PDF, render PDF to JPG/PNG, and inspect metadata.',
      },
      'calculator-tools': {
        name: 'Calculators & Converters',
        shortName: 'Calculators',
        description: 'Age, dates, percentages, BMI, GST/EMI/loans, live exchange rates, and everyday unit conversions.',
      },
      'qr-tools': {
        name: 'QR & Barcode Tools',
        shortName: 'QR & Barcode',
        description: 'Create styled QR codes (URL, Wi-Fi, vCard), generate retail barcodes, and scan QR codes safely.',
      },
      'text-tools': {
        name: 'Text & Writing Tools',
        shortName: 'Text',
        description: 'Count words and reading time, convert case, strip duplicates, sort, compare diffs, and generate sample text.',
      },
      'developer-tools': {
        name: 'Developer Tools',
        shortName: 'Developer',
        description: 'Format JSON, encode Base64/URL/HTML, minify assets, compute SHA hashes, test regex, and convert timestamps.',
      },
      'security-tools': {
        name: 'Security & Random Tools',
        shortName: 'Security',
        description: 'Generate cryptographic passwords and passphrases, check strength, roll dice, flip coins, and pick names.',
      },
      'student-tools': {
        name: 'Student & Education Tools',
        shortName: 'Student',
        description: 'Calculate GPA/CGPA and grades, test typing speed, track exam countdowns, and practice quizzes.',
      },
      'productivity-tools': {
        name: 'Document & Productivity',
        shortName: 'Productivity',
        description: 'Build printable resumes, cover letters, GST invoices, daily checklists, meeting notes, and A4 calendars.',
      },
      'social-tools': {
        name: 'Social & Creator Tools',
        shortName: 'Creator',
        description: 'Resize YouTube thumbnails and Instagram visuals, organize tags/hashtags, and preview Open Graph cards.',
      },
    },
  },
  bn: {
    brandName: 'Smart Tools Hub',
    tagline: 'আপনার প্রতিদিনের প্রয়োজনীয় সব টুল, এক জায়গায়।',
    nav: {
      categories: 'ক্যাটাগরি',
      allTools: 'সব টুলস',
      favorites: 'প্রিয়',
      about: 'সম্পর্কে',
      searchButton: 'টুল খুঁজুন',
      home: 'হোম',
    },
    hero: {
      eyebrow: '৪৮টি ব্রাউজার টুল · ১০টি ক্যাটাগরি · কোনো ফাইল আপলোড নয়',
      title: 'আপনার প্রতিদিনের সব টুল, এক জায়গায়।',
      subtitle:
        'ছবি রিসাইজ ও কমপ্রেস, পিডিএফ এডিট, ক্যালকুলেটর, কিউআর কোড, কোড ফরম্যাটার এবং প্রিন্টযোগ্য ডকুমেন্ট সরাসরি আপনার ব্রাউজারে দ্রুত ও নিরাপদে তৈরি করুন।',
      searchPlaceholder: '৪৮টি টুল খুঁজুন (যেমন: Image Resizer, PDF Merger, BMI, QR)...',
      browseAll: 'সব টুল দেখুন',
      exploreCategories: 'ক্যাটাগরি দেখুন',
      privacyNote: 'আপনার ফাইল আপনার ডিভাইসেই থাকে। কোনো লগইন প্রয়োজন নেই।',
    },
    sections: {
      quickAccess: 'দ্রুত অ্যাক্সেস',
      recentlyUsed: 'সম্প্রতি ব্যবহৃত',
      yourFavorites: 'সংরক্ষিত প্রিয় টুল',
      popularTools: 'জনপ্রিয় টুলস',
      allCategories: 'ক্যাটাগরি অনুযায়ী দেখুন',
      recentlyAdded: 'নতুন যুক্ত টুলস',
      viewAll: 'সব দেখুন',
      relatedTools: 'সম্পর্কিত টুলস',
      howToUse: 'ব্যবহারবিধি',
      faq: 'সাধারণ জিজ্ঞাসা',
      browseCategory: 'ক্যাটাগরি খুলুন',
      toolsCount: 'টি টুল',
    },
    actions: {
      copy: 'কপি করুন',
      copied: 'ক্লিপবোর্ডে কপি হয়েছে',
      download: 'ডাউনলোড',
      downloadZip: 'ZIP ডাউনলোড',
      reset: 'রিসেট',
      clear: 'মুছুন',
      clearHistory: 'ইতিহাস মুছুন',
      cancel: 'বাতিল',
      confirm: 'নিশ্চিত করুন',
      addFavorite: 'প্রিয় তালিকায় রাখুন',
      removeFavorite: 'প্রিয় তালিকায় আছে',
      openTool: 'টুল খুলুন',
      backHome: 'হোমপেজে ফিরুন',
      lightMode: 'লাইট',
      darkMode: 'ডার্ক',
      language: 'ভাষা',
    },
    search: {
      modalTitle: 'Smart Tools Hub অনুসন্ধান',
      placeholder: 'টুলের নাম বা কাজ লিখুন...',
      recentSearches: 'সাম্প্রতিক অনুসন্ধান',
      noResults: 'কোনো মিল পাওয়া যায়নি',
      noResultsHint: 'PDF, Image, Calculator, QR, Password বা JSON লিখে চেষ্টা করুন।',
      allCategoriesFilter: 'সব',
      shortcutHint: '↑ ↓ দিয়ে নির্বাচন করুন, Enter চাপুন, Esc দিয়ে বন্ধ করুন',
    },
    favorites: {
      title: 'প্রিয় টুলস ও সাম্প্রতিক ইতিহাস',
      subtitle: 'আপনার সংরক্ষিত টুলস, সম্প্রতি ব্যবহৃত তালিকা এবং লোকাল ক্যালকুলেশন ইতিহাস।',
      emptyTitle: 'এখনো কোনো প্রিয় টুল সংরক্ষিত নেই',
      emptyDesc: 'যেকোনো টুলে স্টার আইকনে ক্লিক করে এখানে পিন করে রাখুন।',
      recentTitle: 'সম্প্রতি পরিদর্শিত টুলস',
      emptyRecent: 'আপনি যে টুলগুলো খুলবেন তা এখানে স্বয়ংক্রিয়ভাবে দেখাবে।',
      calcHistoryTitle: 'লোকাল ক্যালকুলেশন ইতিহাস',
      emptyCalcHistory: 'ক্যালকুলেটরের ফলাফল এখানে সংরক্ষিত হবে।',
      confirmClearTitle: 'লোকাল ইতিহাস মুছবেন?',
      confirmClearDesc: 'এটি আপনার ব্রাউজার থেকে সাম্প্রতিক টুলস ও ক্যালকুলেশন ইতিহাস মুছে ফেলবে।',
    },
    footer: {
      description: '১০টি কার্যকর ক্যাটাগরিতে দ্রুত ও নিরাপদ ব্রাউজার-ভিত্তিক প্রতিদিনের টুলস।',
      toolsHeading: 'প্রধান ক্যাটাগরি',
      companyHeading: 'অন্বেষণ',
      legalHeading: 'তথ্য ও নীতিমালা',
      contact: 'যোগাযোগ',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'ব্যবহারের শর্তাবলী',
      disclaimer: 'দাবিত্যাগ',
      copyright: 'Smart Tools Hub। দ্রুত ও নিরাপদ ব্রাউজার কাজের জন্য নির্মিত।',
      localProcessingNote: 'সম্পূর্ণ ব্রাউজার-ভিত্তিক প্রসেসিং · কোনো অ্যাকাউন্ট নয়',
    },
    categories: {
      'image-tools': {
        name: 'ছবি ও ফটো টুলস',
        shortName: 'ছবি',
        description: 'ছবি রিসাইজ, নির্দিষ্ট KB-তে কমপ্রেস, ক্রপ, ফরম্যাট পরিবর্তন, পাসপোর্ট ও সিগনেচার ফটো।',
      },
      'pdf-tools': {
        name: 'পিডিএফ টুলস',
        shortName: 'পিডিএফ',
        description: 'পিডিএফ মার্জ, স্প্লিট, রোটেট, পেজ মুছুন, ছবি থেকে পিডিএফ ও পিডিএফ থেকে ছবি।',
      },
      'calculator-tools': {
        name: 'ক্যালকুলেটর ও কনভার্টার',
        shortName: 'ক্যালকুলেটর',
        description: 'বয়স, তারিখ, শতকরা, BMI, GST/EMI, লাইভ কারেন্সি ও ইউনিট কনভার্টার।',
      },
      'qr-tools': {
        name: 'কিউআর ও বারকোড টুলস',
        shortName: 'কিউআর ও বারকোড',
        description: 'URL, Wi-Fi ও কন্টাক্ট কিউআর তৈরি, বারকোড জেনারেটর এবং কিউআর স্ক্যানার।',
      },
      'text-tools': {
        name: 'টেক্সট ও লেখালেখি টুলস',
        shortName: 'টেক্সট',
        description: 'শব্দ ও অক্ষর গণনা, কেস পরিবর্তন, ডুপ্লিকেট লাইন মোছা, সর্ট ও টেক্সট তুলনা।',
      },
      'developer-tools': {
        name: 'ডেভেলপার টুলস',
        shortName: 'ডেভেলপার',
        description: 'JSON ফরম্যাটার, Base64/URL/HTML এনকোডার, মিনিফায়ার, UUID, হ্যাশ ও রেজেক্স।',
      },
      'security-tools': {
        name: 'সিকিউরিটি ও র‍্যান্ডম টুলস',
        shortName: 'সিকিউরিটি',
        description: 'শক্তিশালী পাসওয়ার্ড ও পাসফ্রেজ জেনারেটর, স্ট্রেংথ চেকার, ডাইস ও কয়েন ফ্লিপ।',
      },
      'student-tools': {
        name: 'শিক্ষার্থী ও শিক্ষা টুলস',
        shortName: 'শিক্ষা',
        description: 'GPA/CGPA ও গ্রেড ক্যালকুলেটর, টাইপিং স্পিড টেস্ট, পরীক্ষার কাউন্টডাউন ও কুইজ।',
      },
      'productivity-tools': {
        name: 'ডকুমেন্ট ও প্রোডাক্টিভিটি',
        shortName: 'ডকুমেন্ট',
        description: 'প্রিন্টযোগ্য সিভি, কভার লেটার, ইনভয়েস, নোটপ্যাড, ডেইলি প্ল্যানার ও ক্যালেন্ডার।',
      },
      'social-tools': {
        name: 'সোশ্যাল ও ক্রিয়েটর টুলস',
        shortName: 'ক্রিয়েটর',
        description: 'ইউটিউব থাম্বনেইল ও ইনস্টাগ্রাম রিসাইজার, হ্যাশট্যাগ ও ওপেন গ্রাফ প্রিভিউ।',
      },
    },
  },
  hi: {
    brandName: 'Smart Tools Hub',
    tagline: 'आपके रोज़मर्रा के सभी टूल्स, एक ही जगह।',
    nav: {
      categories: 'श्रेणियाँ',
      allTools: 'सभी टूल्स',
      favorites: 'पसंदीदा',
      about: 'परिचय',
      searchButton: 'टूल खोजें',
      home: 'होम',
    },
    hero: {
      eyebrow: '48 ब्राउज़र यूटिलिटीज़ · 10 श्रेणियाँ · कोई फ़ाइल अपलोड नहीं',
      title: 'आपके रोज़मर्रा के सभी टूल्स, एक ही जगह।',
      subtitle:
        'ब्राउज़र में सीधे इमेज रिसाइज़ और कंप्रेस करें, PDF एडिट करें, कैलकुलेटर चलाएँ, QR कोड बनाएँ, कोड फ़ॉर्मेट करें और प्रिंट-रेडी डॉक्यूमेंट तैयार करें—तेज़ और निजी।',
      searchPlaceholder: '48 टूल्स खोजें (जैसे: Image Resizer, PDF Merger, BMI, QR)...',
      browseAll: 'सभी टूल्स देखें',
      exploreCategories: 'श्रेणियाँ देखें',
      privacyNote: 'आपकी फ़ाइलें आपके डिवाइस पर ही रहती हैं। किसी साइन-अप की आवश्यकता नहीं।',
    },
    sections: {
      quickAccess: 'त्वरित पहुँच',
      recentlyUsed: 'हाल ही में उपयोग किए गए',
      yourFavorites: 'सहेजे गए पसंदीदा',
      popularTools: 'लोकप्रिय टूल्स',
      allCategories: 'श्रेणी के अनुसार ब्राउज़ करें',
      recentlyAdded: 'हाल ही में जोड़े गए टूल्स',
      viewAll: 'सभी देखें',
      relatedTools: 'संबंधित टूल्स',
      howToUse: 'उपयोग कैसे करें',
      faq: 'अक्सर पूछे जाने वाले प्रश्न',
      browseCategory: 'श्रेणी खोलें',
      toolsCount: 'टूल्स',
    },
    actions: {
      copy: 'कॉपी करें',
      copied: 'क्लिपबोर्ड पर कॉपी हो गया',
      download: 'डाउनलोड',
      downloadZip: 'ZIP डाउनलोड',
      reset: 'रीसेट',
      clear: 'साफ़ करें',
      clearHistory: 'इतिहास साफ़ करें',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      addFavorite: 'पसंदीदा में जोड़ें',
      removeFavorite: 'पसंदीदा में सहेजा गया',
      openTool: 'टूल खोलें',
      backHome: 'होमपेज पर वापस जाएँ',
      lightMode: 'लाइट',
      darkMode: 'डार्क',
      language: 'भाषा',
    },
    search: {
      modalTitle: 'Smart Tools Hub खोजें',
      placeholder: 'टूल का नाम, फ़ॉर्मेट या कार्य लिखें...',
      recentSearches: 'हाल की खोजें',
      noResults: 'कोई मिलता-जुलता टूल नहीं मिला',
      noResultsHint: 'PDF, Image, Calculator, QR, Password या JSON खोज कर देखें।',
      allCategoriesFilter: 'सभी',
      shortcutHint: '↑ ↓ से चुनें, Enter से खोलें, Esc से बंद करें',
    },
    favorites: {
      title: 'पसंदीदा और हाल की गतिविधि',
      subtitle: 'आपके सहेजे गए टूल्स, हाल की विज़िट और लोकल कैलकुलेशन लॉग—सिर्फ़ इस ब्राउज़र में सुरक्षित।',
      emptyTitle: 'अभी कोई पसंदीदा टूल नहीं है',
      emptyDesc: 'किसी भी टूल पर स्टार बटन दबाकर उसे यहाँ पिन करें।',
      recentTitle: 'हाल ही में खोले गए टूल्स',
      emptyRecent: 'जो टूल्स आप खोलते हैं वे यहाँ अपने-आप दिखेंगे।',
      calcHistoryTitle: 'लोकल कैलकुलेशन इतिहास',
      emptyCalcHistory: 'कैलकुलेटर के परिणाम यहाँ लोकली सहेजे जाएँगे।',
      confirmClearTitle: 'लोकल इतिहास साफ़ करें?',
      confirmClearDesc: 'यह आपके ब्राउज़र से हाल के टूल्स और कैलकुलेशन इतिहास हटा देगा।',
    },
    footer: {
      description: '10 व्यावहारिक श्रेणियों में तेज़, भरोसेमंद ब्राउज़र-आधारित दैनिक टूल्स।',
      toolsHeading: 'प्रमुख श्रेणियाँ',
      companyHeading: 'एक्सप्लोर',
      legalHeading: 'जानकारी',
      contact: 'संपर्क',
      privacy: 'गोपनीयता नीति',
      terms: 'उपयोग की शर्तें',
      disclaimer: 'अस्वीकरण',
      copyright: 'Smart Tools Hub। तेज़ और निजी ब्राउज़र उत्पादकता के लिए निर्मित।',
      localProcessingNote: 'लोकल ब्राउज़र प्रोसेसिंग · किसी अकाउंट की ज़रूरत नहीं',
    },
    categories: {
      'image-tools': {
        name: 'इमेज और फ़ोटो टूल्स',
        shortName: 'इमेज',
        description: 'फ़ोटो रिसाइज़, टारगेट KB कम्प्रेशन, क्रॉप, फ़ॉर्मेट कन्वर्टर, पासपोर्ट और सिग्नेचर फ़ोटो।',
      },
      'pdf-tools': {
        name: 'PDF टूल्स',
        shortName: 'PDF',
        description: 'PDF मर्ज, स्प्लिट, रोटेट, पेज डिलीट, इमेज से PDF, PDF से JPG/PNG और मेटाडेटा व्यूअर।',
      },
      'calculator-tools': {
        name: 'कैलकुलेटर और कन्वर्टर',
        shortName: 'कैलकुलेटर',
        description: 'आयु, तारीख अंतर, प्रतिशत, BMI, GST/EMI, लाइव करेंसी और यूनिट कन्वर्टर।',
      },
      'qr-tools': {
        name: 'QR और बारकोड टूल्स',
        shortName: 'QR और बारकोड',
        description: 'URL, Wi-Fi व कॉन्टैक्ट QR बनाएँ, बारकोड जनरेट करें और सुरक्षित QR स्कैन करें।',
      },
      'text-tools': {
        name: 'टेक्स्ट और लेखन टूल्स',
        shortName: 'टेक्स्ट',
        description: 'शब्द व पढ़ने का समय गिनें, केस बदलें, डुप्लिकेट लाइन हटाएँ, सॉर्ट और टेक्स्ट तुलना करें।',
      },
      'developer-tools': {
        name: 'डेवलपर टूल्स',
        shortName: 'डेवलपर',
        description: 'JSON फ़ॉर्मैटर, Base64/URL/HTML एनकोडर, मिनिफ़ायर, UUID, हैश और रेजेक्स टेस्टर।',
      },
      'security-tools': {
        name: 'सुरक्षा और रैंडम टूल्स',
        shortName: 'सुरक्षा',
        description: 'क्रिप्टोग्राफ़िक पासवर्ड व पासफ़्रेज़, स्ट्रेंथ चेकर, डाइस रोलर, कॉइन फ़्लिप और नाम जनरेटर।',
      },
      'student-tools': {
        name: 'छात्र और शिक्षा टूल्स',
        shortName: 'शिक्षा',
        description: 'GPA/CGPA और ग्रेड कैलकुलेटर, टाइपिंग स्पीड टेस्ट, परीक्षा काउंटडाउन और क्विज़।',
      },
      'productivity-tools': {
        name: 'डॉक्यूमेंट और उत्पादकता',
        shortName: 'उत्पादकता',
        description: 'प्रिंट-रेडी रिज़्यूमे, कवर लेटर, GST इनवॉइस, नोटपैड, दैनिक प्लानर और A4 कैलेंडर।',
      },
      'social-tools': {
        name: 'सोशल और क्रिएटर टूल्स',
        shortName: 'क्रिएटर',
        description: 'YouTube थंबनेल व Instagram रिसाइज़र, हैशटैग/टैग काउंटर और Open Graph प्रिव्यू।',
      },
    },
  },
};
