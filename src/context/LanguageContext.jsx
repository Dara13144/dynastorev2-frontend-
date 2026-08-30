import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  km: {
    // Navigation & Common
    nav: {
      home: 'ទំព័រដើម',
      exploreGames: 'ស្វែងរកហ្គេម',
      categories: 'ជំពូក / ប្រភេទ',
      cart: 'កន្ត្រកទំនិញ',
      wallet: 'កាបូបប្រាក់',
      profile: 'គណនីរបស់ខ្ញុំ',
      downloads: 'ការទាញយករបស់ខ្ញុំ',
      orders: 'ប្រវត្តិបញ្ជាទិញ',
      adminConsole: 'ផ្ទាំងគ្រប់គ្រង Admin',
      login: 'ចូលគណនី',
      register: 'ចុះឈ្មោះ',
      logout: 'ចាកចេញ',
      balance: 'សមតុល្យ',
      searchPlaceholder: 'ស្វែងរកហ្គេម, អ្នកបង្កើត, modpack...',
      language: 'ភាសា',
      role: 'តួនាទី',
    },
    // Home Page
    home: {
      heroBadge: '🇰🇭 ហាងលក់ហ្គេមឌីជីថលឈានមុខគេនៅកម្ពុជា',
      heroTitlePrefix: 'ទិញហ្គេម PC & កម្មវិធីឌីជីថលភ្លាមៗជាមួយ',
      heroTitleHighlight: 'Bakong KHQR',
      heroSubtitle: 'ទាញយកហ្គេម PC, កម្មវិធី និង Minecraft Modpacks បានភ្លាមៗបន្ទាប់ពីទូទាត់ប្រាក់តាម KHQR ធនាគារទាំងអស់នៅកម្ពុជា។ សុវត្ថិភាពខ្ពស់ និងស្រួលប្រើប្រាស់!',
      browseCatalog: 'មើលហ្គេមទាំងអស់',
      topUpWallet: 'បញ្ចូលលុយកាបូប',
      featuredGames: 'ហ្គេមល្បីៗប្រចាំហាង',
      featuredSubtitle: 'ហ្គេមពេញនិយម និងមានការទាញយកច្រើនជាងគេនៅកម្ពុជា',
      newReleases: 'ហ្គេមទើបមកដល់ថ្មីៗ',
      newReleasesSubtitle: 'ហ្គេម PC និង Modpack ថ្មីៗដែលទើបតែដាក់លក់លើ DynaStore',
      viewAll: 'មើលទាំងអស់',
      instantDelivery: 'ទាញយកភ្លាមៗ',
      instantDeliveryDesc: 'ទទួលបាន Link ទាញយកផ្លូវការភ្លាមៗក្រោយទូទាត់តាម KHQR រួច',
      khqrPayment: 'ទូទាត់តាម KHQR',
      khqrPaymentDesc: 'គាំទ្រកម្មវិធី Bakong និងធនាគារទាំងអស់នៅកម្ពុជា',
      verifiedFiles: 'ឯកសារសុវត្ថិភាព 100%',
      verifiedFilesDesc: 'ឯកសារហ្គេមត្រូវបានត្រួតពិនិត្យ និងស្កេនមេរោគរួចរាល់',
      bestPrice: 'តម្លៃសមរម្យ',
      bestPriceDesc: 'តម្លៃពិសេសសម្រាប់អ្នកលេងហ្គេមនៅកម្ពុជា',
    },
    // Games Page
    games: {
      title: 'ស្វែងរកហ្គេម & កម្មវិធី',
      subtitle: 'រើសហ្គេមដែលអ្នកចូលចិត្ត ទាញយកបានភ្លាមៗ និងមានការ Update រហូត',
      allCategories: 'គ្រប់ប្រភេទ',
      searchPlaceholder: 'វាយឈ្មោះហ្គេមដើម្បីស្វែងរក...',
      platform: 'ប្រព័ន្ធដំណើរការ',
      allPlatforms: 'គ្រប់ប្រព័ន្ធ',
      sortBy: 'តម្រៀបតាម',
      sortNewest: 'ថ្មីបំផុត',
      sortPriceAsc: 'តម្លៃ: ទាប ទៅ ខ្ពស់',
      sortPriceDesc: 'តម្លៃ: ខ្ពស់ ទៅ ទាប',
      sortPopular: 'ពេញនិយមបំផុត',
      buyNow: 'ទិញឥឡូវនេះ',
      inCart: 'ក្នុងកន្ត្រក',
      addToCart: 'ដាក់ក្នុងកន្ត្រក',
      noGamesFound: 'រកមិនឃើញហ្គេមដែលត្រូវនឹងការស្វែងរកទេ',
      free: 'ឥតគិតថ្លៃ',
    },
    // Game Detail Page
    gameDetail: {
      backToGames: 'ត្រឡប់ទៅមើលហ្គេមទាំងអស់',
      officialLicense: 'អាជ្ញាប័ណ្ណឌីជីថលផ្លូវការ',
      approxKhr: 'ប្រហែលជាប្រាក់រៀល',
      buyNowKhqr: 'ទិញភ្លាមៗជាមួយ Bakong KHQR',
      addToCart: 'ដាក់ក្នុងកន្ត្រកទំនិញ',
      inCartRemove: 'ក្នុងកន្ត្រក - ចុចដើម្បីលុបចេញ',
      youOwnThis: 'អ្នកបានទិញហ្គេមនេះរួចហើយ!',
      digitalCopyActive: 'ឯកសារអាចទាញយកបាន',
      goToDownloads: 'ទៅកាន់ទំព័រទាញយក',
      aboutGame: 'ព័ត៌មានលម្អិតអំពីហ្គេម',
      systemRequirements: 'លក្ខខណ្ឌតម្រូវរបស់កុំព្យូទ័រ (PC)',
      os: 'ប្រព័ន្ធប្រតិបត្តិការ (OS)',
      cpu: 'អង្គប្រតិបត្តិការ (CPU)',
      ram: 'អង្គចងចាំ (RAM)',
      gpu: 'កាតក្រាហ្វិក (GPU)',
      storage: 'ទំហំផ្ទុកទិន្នន័យ (Storage)',
      fileSize: 'ទំហំឯកសារ',
      version: 'កំណែ (Version)',
      releaseDate: 'ថ្ងៃចេញផ្សាយ',
      developer: 'អ្នកអភិវឌ្ឍន៍',
      verifiedDelivery: 'ការទាញយកមានសុវត្ថិភាពខ្ពស់',
      verifiedDeliveryDesc: 'ឯកសារត្រូវបានរក្សាទុកក្នុងប្រព័ន្ធ Cloud សុវត្ថិភាព។ ផ្ដល់ Link ទាញយកសុវត្ថិភាពភ្លាមៗបន្ទាប់ពីការទូទាត់ជោគជ័យ។',
    },
    // Cart Page
    cart: {
      shoppingCart: 'កន្ត្រកទំនិញ',
      subtitle: 'ពិនិត្យមើលឯកសារហ្គេមឌីជីថលរបស់អ្នកមុនពេលបន្តទៅការទូទាត់',
      emptyTitle: 'កន្ត្រកទំនិញរបស់អ្នកនៅទំនេរ',
      emptySubtitle: 'ស្វែងរកហ្គេម PC, Minecraft modpacks និងកម្មវិធីកម្សាន្តជាច្រើនទៀត។',
      browseGames: 'ស្វែងរកហ្គេម',
      clearCart: 'លុបកន្ត្រកទាំងមូល',
      digitalLicense: 'អាជ្ញាប័ណ្ណឌីជីថល (ចំនួន: 1)',
      delete: 'លុបចេញ',
      orderSummary: 'សង្ខេបការបញ្ជាទិញ',
      items: 'ចំនួនទំនិញ',
      digitalDelivery: 'ការផ្ញើឯកសារឌីជីថល',
      instantFree: 'ភ្លាមៗ ($0.00)',
      total: 'សរុបទាំងអស់',
      proceedToCheckout: 'បន្តទៅការទូទាត់ប្រាក់',
      paymentNotice: 'ទូទាត់ប្រាក់ប្រកបដោយសុវត្ថិភាពតាមរយៈ Bakong KHQR និង DynaStore Wallet',
    },
    // Checkout Page
    checkout: {
      title: 'ការទូទាត់ប្រាក់',
      subtitle: 'ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់ដើម្បីបញ្ចប់ការបញ្ជាទិញរបស់អ្នក',
      paymentMethod: 'វិធីសាស្ត្រទូទាត់ប្រាក់',
      khqrTitle: 'Bakong KHQR (ធនាគារទាំងអស់នៅកម្ពុជា)',
      khqrDesc: 'ស្កេនទូទាត់ភ្លាមៗជាមួយ Bakong, ABA, ACLEDA, Wing, Canadia និងធនាគារផ្សេងទៀត',
      walletTitle: 'DynaStore Wallet',
      walletDesc: 'ទូទាត់ភ្លាមៗដោយប្រើសមតុល្យក្នុងកាបូបរបស់អ្នក',
      insufficientBalance: 'សមតុល្យក្នុងកាបូបមិនគ្រប់គ្រាន់ទេ',
      topUpWallet: 'បញ្ចូលលុយក្នុងកាបូប',
      payNow: 'ទូទាត់ប្រាក់ឥឡូវនេះ',
      orderItems: 'ទំនិញក្នុងបញ្ជាទិញ',
      instantDeliveryGuaranteed: 'ធានាផ្ដល់ Link ទាញយកភ្លាមៗ 100%',
    },
    // Wallet Page
    wallet: {
      title: 'កាបូប DynaStore',
      subtitle: 'គ្រប់គ្រងសមតុល្យរបស់អ្នក និងបញ្ចូលលុយងាយៗជាមួយ Bakong KHQR',
      currentBalance: 'សមតុល្យបច្ចុប្បន្ន',
      topUpHeading: 'បញ្ចូលលុយក្នុងកាបូប',
      selectAmount: 'ជ្រើសរើសចំនួនទឹកប្រាក់ ($)',
      customAmount: 'ឬវាយចំនួនទឹកប្រាក់ផ្ទាល់ខ្លួន ($)',
      topUpBtn: 'បង្កើត QR Code បញ្ចូលលុយ',
      transactionHistory: 'ប្រវត្តិប្រតិបត្តិការ',
      noTransactions: 'មិនទាន់មានប្រវត្តិប្រតិបត្តិការនៅឡើយទេ',
      typeDeposit: 'បញ្ចូលលុយ',
      typePurchase: 'ទិញហ្គេម',
      typeRefund: 'សងលុយវិញ',
      typeAdjustment: 'ការកែសម្រួលដោយ Admin',
    },
    // Downloads Page
    downloads: {
      title: 'ការទាញយករបស់ខ្ញុំ',
      subtitle: 'ឯកសារហ្គេម និងកម្មវិធីទាំងអស់ដែលអ្នកបានទិញរួចរាល់សម្រាប់ការទាញយក',
      noDownloadsTitle: 'អ្នកមិនទាន់បានទិញហ្គេមណាមួយនៅឡើយទេ',
      noDownloadsSubtitle: 'ចូលទៅកាន់ហាងដើម្បីស្វែងរកហ្គេមល្អៗ និងទទួលបាន Link ទាញយកភ្លាមៗ!',
      browseGames: 'ស្វែងរកហ្គេមឥឡូវនេះ',
      downloadNow: 'ទាញយកឥឡូវនេះ',
      generatingLink: 'កំពុងបង្កើត Link...',
      fileDetails: 'ព័ត៌មានលម្អិតឯកសារ',
      licenseActive: 'អាជ្ញាប័ណ្ណសកម្ម',
    },
    // Orders Page
    orders: {
      title: 'ប្រវត្តិបញ្ជាទិញ',
      subtitle: 'មើលរាល់ការបញ្ជាទិញ និងវិក្កយបត្ររបស់អ្នក',
      orderId: 'លេខបញ្ជាទិញ',
      date: 'កាលបរិច្ឆេទ',
      status: 'ស្ថានភាព',
      total: 'តម្លៃសរុប',
      paymentMethod: 'វិធីសាស្ត្រទូទាត់',
      viewOrder: 'មើលលម្អិត',
      statusPaid: 'បានទូទាត់',
      statusPending: 'រង់ចាំទូទាត់',
      statusFailed: 'បរាជ័យ',
    },
    // Auth Pages
    auth: {
      welcomeBack: 'សូមស្វាគមន៍មកវិញ',
      loginSubtitle: 'ចូលគណនីដើម្បីគ្រប់គ្រងហ្គេម កាបូប និងការទិញរបស់អ្នក',
      createAccount: 'បង្កើតគណនីថ្មី',
      registerSubtitle: 'ចូលរួមជាមួយអ្នកលេងហ្គេមរាប់ពាន់នាក់នៅកម្ពុជា',
      emailAddress: 'អាសយដ្ឋានអ៊ីមែល',
      username: 'ឈ្មោះគណនី (Username)',
      password: 'ពាក្យសម្ងាត់',
      confirmPassword: 'បញ្ជាក់ពាក្យសម្ងាត់',
      forgotPassword: 'ភ្លេចពាក្យសម្ងាត់?',
      continueWithGoogle: 'បន្តជាមួយ Google',
      connectingGoogle: 'កំពុងភ្ជាប់ជាមួយ Google...',
      signInBtn: 'ចូលគណនី DynaStore',
      registerBtn: 'ចុះឈ្មោះគណនី',
      noAccount: 'មិនទាន់មានគណនីមែនទេ?',
      haveAccount: 'មានគណនីរួចហើយមែនទេ?',
      registerFree: 'ចុះឈ្មោះឥតគិតថ្លៃ',
      signInLink: 'ចូលគណនី',
      orWithEmail: 'ឬជាមួយអ៊ីមែល',
    },
    // Footer
    footer: {
      tagline: 'ហាងលក់ហ្គេមឌីជីថល និង Minecraft Modpack ឈានមុខគេនៅកម្ពុជា។ ទូទាត់រហ័សជាមួយ Bakong KHQR និងទាញយកបានភ្លាមៗ។',
      quickLinks: 'តំណភ្ជាប់រហ័ស',
      support: 'ជំនួយ និងសេវាកម្ម',
      acceptedPayments: 'វិធីសាស្ត្រទូទាត់ដែលគាំទ្រ',
      rightsReserved: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    },
  },
  en: {
    // Navigation & Common
    nav: {
      home: 'Home',
      exploreGames: 'Explore Games',
      categories: 'Categories',
      cart: 'Cart',
      wallet: 'Wallet',
      profile: 'My Profile',
      downloads: 'My Downloads',
      orders: 'Order History',
      adminConsole: 'Admin Console',
      login: 'Log In',
      register: 'Register',
      logout: 'Log Out',
      balance: 'Balance',
      searchPlaceholder: 'Search games, developers, modpacks...',
      language: 'Language',
      role: 'Role',
    },
    // Home Page
    home: {
      heroBadge: '🇰🇭 Cambodia’s #1 Digital Game Store',
      heroTitlePrefix: 'Buy PC Games & Digital Files Instantly via',
      heroTitleHighlight: 'Bakong KHQR',
      heroSubtitle: 'Instant automated downloads for standalone games, DLCs, and Minecraft Modpacks with verified Bakong KHQR payment across all Cambodian banks.',
      browseCatalog: 'Browse Catalog',
      topUpWallet: 'Top Up Wallet',
      featuredGames: 'Featured Releases',
      featuredSubtitle: 'Top-rated PC games and exclusive modpacks handpicked for gamers in Cambodia',
      newReleases: 'New Arrivals',
      newReleasesSubtitle: 'Fresh standalone PC games and tools recently added to DynaStore',
      viewAll: 'View All',
      instantDelivery: 'Instant Delivery',
      instantDeliveryDesc: 'Direct signed download links immediately upon verified KHQR payment',
      khqrPayment: 'Bakong KHQR Payments',
      khqrPaymentDesc: 'Supports Bakong, ABA, ACLEDA, Wing, and all Cambodian mobile banking apps',
      verifiedFiles: '100% Virus-Free Files',
      verifiedFilesDesc: 'All game archives are scanned and verified clean with installation guides',
      bestPrice: 'Cambodia-Friendly Pricing',
      bestPriceDesc: 'Fair rates in USD and KHR tailored for local players and creators',
    },
    // Games Page
    games: {
      title: 'Explore Games & Modpacks',
      subtitle: 'Discover digital releases with instant download delivery and future updates',
      allCategories: 'All Categories',
      searchPlaceholder: 'Search games by title...',
      platform: 'Platform',
      allPlatforms: 'All Platforms',
      sortBy: 'Sort By',
      sortNewest: 'Newest Releases',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortPopular: 'Most Popular',
      buyNow: 'Buy Now',
      inCart: 'In Cart',
      addToCart: 'Add to Cart',
      noGamesFound: 'No games match your search criteria',
      free: 'Free',
    },
    // Game Detail Page
    gameDetail: {
      backToGames: 'Back to All Games',
      officialLicense: 'Official Digital License',
      approxKhr: 'Approx. KHR',
      buyNowKhqr: 'Buy Now with KHQR (Bakong / All Banks)',
      addToCart: 'Add to Shopping Cart',
      inCartRemove: 'In Cart - Click to Remove',
      youOwnThis: 'You own this game!',
      digitalCopyActive: 'Digital Copy Active',
      goToDownloads: 'Go to Downloads',
      aboutGame: 'About the Game',
      systemRequirements: 'System Requirements (PC)',
      os: 'Operating System',
      cpu: 'Processor (CPU)',
      ram: 'Memory (RAM)',
      gpu: 'Graphics Card (GPU)',
      storage: 'Storage Space',
      fileSize: 'File Size',
      version: 'Version',
      releaseDate: 'Release Date',
      developer: 'Developer',
      verifiedDelivery: 'Verified Direct Download Delivery',
      verifiedDeliveryDesc: 'Files are stored securely in encrypted storage. Generates tamper-proof signed URLs upon verified payment.',
    },
    // Cart Page
    cart: {
      shoppingCart: 'Shopping Cart',
      subtitle: 'Review your digital game files before proceeding to secure checkout',
      emptyTitle: 'Your Cart is Empty',
      emptySubtitle: 'Explore our collection of standalone games, Minecraft modpacks, and PC releases.',
      browseGames: 'Browse Games',
      clearCart: 'Clear Cart',
      digitalLicense: 'Digital License (Qty: 1)',
      delete: 'Delete',
      orderSummary: 'Order Summary',
      items: 'Items',
      digitalDelivery: 'Digital Delivery',
      instantFree: 'Instant ($0.00)',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      paymentNotice: 'Verified payment via Bakong KHQR & DynaStore Wallet',
    },
    // Checkout Page
    checkout: {
      title: 'Secure Checkout',
      subtitle: 'Select your preferred payment method to complete your purchase',
      paymentMethod: 'Payment Method',
      khqrTitle: 'Bakong KHQR (All Cambodian Banks)',
      khqrDesc: 'Scan & pay instantly with Bakong, ABA Mobile, ACLEDA, Wing, Canadia, and all banks',
      walletTitle: 'DynaStore Wallet',
      walletDesc: 'Instant 1-click checkout using your prepaid store balance',
      insufficientBalance: 'Insufficient wallet balance',
      topUpWallet: 'Top Up Wallet',
      payNow: 'Pay Now',
      orderItems: 'Order Items',
      instantDeliveryGuaranteed: '100% Instant Signed Download Guarantee',
    },
    // Wallet Page
    wallet: {
      title: 'DynaStore Wallet',
      subtitle: 'Manage your prepaid balance and top up easily with Bakong KHQR',
      currentBalance: 'Current Balance',
      topUpHeading: 'Top Up Balance',
      selectAmount: 'Select Amount ($)',
      customAmount: 'Or enter custom amount ($)',
      topUpBtn: 'Generate KHQR Top-Up Code',
      transactionHistory: 'Transaction History',
      noTransactions: 'No transactions found yet',
      typeDeposit: 'Wallet Deposit',
      typePurchase: 'Game Purchase',
      typeRefund: 'Refund',
      typeAdjustment: 'Admin Adjustment',
    },
    // Downloads Page
    downloads: {
      title: 'My Downloads',
      subtitle: 'All your purchased digital game files ready for high-speed download',
      noDownloadsTitle: 'No Games in Your Library Yet',
      noDownloadsSubtitle: 'Explore the game store to purchase standalone games and unlock direct downloads!',
      browseGames: 'Browse Games Now',
      downloadNow: 'Download Now',
      generatingLink: 'Generating Link...',
      fileDetails: 'File Specifications',
      licenseActive: 'License Active',
    },
    // Orders Page
    orders: {
      title: 'Order History',
      subtitle: 'View and track all your previous purchases and invoices',
      orderId: 'Order ID',
      date: 'Date',
      status: 'Status',
      total: 'Total Amount',
      paymentMethod: 'Payment Method',
      viewOrder: 'View Details',
      statusPaid: 'PAID',
      statusPending: 'PENDING',
      statusFailed: 'FAILED',
    },
    // Auth Pages
    auth: {
      welcomeBack: 'Welcome Back',
      loginSubtitle: 'Log in to access your game library, wallet, and orders',
      createAccount: 'Create Account',
      registerSubtitle: 'Join thousands of gamers in Cambodia today',
      emailAddress: 'Email Address',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot password?',
      continueWithGoogle: 'Continue with Google',
      connectingGoogle: 'Connecting with Google...',
      signInBtn: 'Sign In to DynaStore',
      registerBtn: 'Register Account',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      registerFree: 'Register for free',
      signInLink: 'Sign In',
      orWithEmail: 'Or with email',
    },
    // Footer
    footer: {
      tagline: 'Leading digital game store and Minecraft modpack provider in Cambodia. Fast Bakong KHQR checkout with instant high-speed downloads.',
      quickLinks: 'Quick Links',
      support: 'Help & Support',
      acceptedPayments: 'Accepted Payment Methods',
      rightsReserved: 'All rights reserved.',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('dynastore_lang') || 'km';
  });

  const setLang = (newLang) => {
    if (newLang === 'km' || newLang === 'en') {
      setLangState(newLang);
      localStorage.setItem('dynastore_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  const toggleLang = () => {
    setLang(lang === 'km' ? 'en' : 'km');
  };

  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (!current || current[key] === undefined) {
        let enCurrent = translations.en;
        for (const enKey of keys) {
          if (!enCurrent || enCurrent[enKey] === undefined) {
            return fallback || path;
          }
          enCurrent = enCurrent[enKey];
        }
        return enCurrent || fallback || path;
      }
      current = current[key];
    }
    return current || fallback || path;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isKhmer: lang === 'km' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
