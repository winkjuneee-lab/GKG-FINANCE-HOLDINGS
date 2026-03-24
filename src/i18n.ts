import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "services": "Services",
        "loans": "Loan Programs",
        "calculator": "Calculator",
        "team": "Leadership Team",
        "about": "About Us",
        "contact": "Contact",
        "login": "Login",
        "portal": "Client Portal",
        "admin": "Admin Panel",
        "signOut": "Sign Out"
      },
      "hero": {
        "badge": "Trusted Financial Consultancy",
        "title": "GKG Global financing solution",
        "subtitle": "Access global financing with low annual interest rates starting from 2%",
        "cta": "Apply Now",
        "consult": "Get Consultation",
        "stats": {
          "interest": "Min. Interest",
          "duration": "Max. Duration",
          "partners": "Global Partners"
        },
        "live": {
          "title": "Live Approvals",
          "subtitle": "Real-time Feed",
          "justNow": "Just now"
        }
      },
      "calculator": {
        "title": "Loan Calculator",
        "amount": "Loan Amount",
        "rate": "Interest Rate (%)",
        "duration": "Duration (Years)",
        "frequency": "Repayment Frequency",
        "quarterly": "Quarterly",
        "semi-annual": "Semi-Annual",
        "annual": "Annual",
        "calculate": "Calculate",
        "result": "Calculation Result",
        "installment": "Periodic Installment",
        "total": "Total Repayment",
        "interest": "Total Interest",
        "year": "Year",
        "years": "Years",
        "note": "* Interest rate applied: {{rate}}% annually."
      },
      "services": {
        "title": "Our Core Services",
        "subtitle": "Comprehensive financial solutions tailored for international growth and stability.",
        "brokerage": { "title": "Loan Brokerage", "desc": "Connecting you with top-tier international lenders." },
        "advisory": { "title": "Financial Advisory", "desc": "Expert guidance on capital structure and growth." },
        "risk": { "title": "Risk Assessment", "desc": "In-depth analysis to secure the best possible terms." },
        "structuring": { "title": "Loan Structuring", "desc": "Customized repayment plans for your business model." }
      },
      "about": {
        "title": "Bridging the Gap in Global Financing",
        "desc": "Based in Istanbul, Turkey, GKG FINANCE HOLDINGS is a premier financial consultancy firm specializing in cross-border financing. We connect ambitious SMEs, startups, and individuals with a network of over 50 international lenders.",
        "points": [
          "Direct access to global capital markets",
          "Expert loan structuring and risk assessment",
          "Multilingual support (English & Turkish)",
          "Transparent brokerage fee structure"
        ]
      },
      "eligibility": {
        "title": "Eligibility Criteria",
        "individuals": { "title": "Individuals", "items": ["Valid ID/Passport", "Proof of Income", "Credit History"] },
        "smes": { "title": "SMEs & Startups", "items": ["Business Registration", "Financial Statements", "Business Plan"] },
        "international": { "title": "International", "items": ["KYC/AML Compliance", "Cross-border Tax ID", "Bank References"] }
      },
      "faq": {
        "title": "Frequently Asked Questions",
        "q1": { "q": "What are the minimum requirements for a loan?", "a": "Requirements vary by loan class, but generally include valid identification, proof of income, and a clean credit history." },
        "q2": { "q": "How long does the approval process take?", "a": "Starter loans can be approved within 48 hours. Larger business loans typically take 5-10 business days for full risk assessment." },
        "q3": { "q": "Do you offer loans to international startups?", "a": "Yes, we specialize in cross-border financing for startups and SMEs globally, with a focus on the Turkish market." },
        "q4": { "q": "What is your brokerage fee?", "a": "Our fees are transparent and depend on the loan structure. We only charge upon successful funding." }
      },
      "contact": {
        "title": "Ready to Scale?",
        "subtitle": "Get a free consultation with our financial experts and discover the best global financing options for your business.",
        "call": "Call Us",
        "email": "Email Us",
        "form": {
          "name": "Full Name",
          "email": "Email Address",
          "amount": "Loan Amount Interested",
          "message": "Message",
          "send": "Send Message"
        }
      },
      "footer": {
        "desc": "International Loan Brokerage & Financial Consultancy based in Turkey. Connecting you with global lenders at competitive rates.",
        "quickLinks": "Quick Links",
        "contactUs": "Contact Us",
        "newsletter": {
          "title": "Newsletter",
          "desc": "Subscribe to get the latest financial insights and loan offers.",
          "placeholder": "Your email address",
          "button": "Subscribe"
        },
        "disclaimer": "Disclaimer: GKG FINANCE HOLDINGS acts as an intermediary financial consultant and broker. We are not a direct lender. All loan approvals are subject to the terms and conditions of the respective lending institutions.",
        "terms": "Terms & Conditions",
        "privacy": "Privacy Policy",
        "gdpr": "GDPR Compliance"
      },
      "loans": {
        "subtitle": "Choose from our structured loan tiers designed to meet your specific financial needs.",
        "annually": "annually",
        "select": "Select Plan",
        "programs": {
          "starter": { "name": "Starter Loan", "features": ["Quick Approval", "Flexible Terms", "No Hidden Fees"] },
          "standard": { "name": "Standard Loan", "features": ["Business Expansion", "Competitive Rates", "Financial Advisory"] },
          "premium": { "name": "Premium Loan", "features": ["Priority Support", "Custom Repayment", "Risk Assessment"] },
          "platinum": { "name": "Platinum Loan", "features": ["Negotiable Terms", "Dedicated Manager", "Global Financing"] }
        }
      },
      "team": {
        "title": "Leadership Team",
        "subtitle": "The experts driving GKG FINANCE HOLDINGS towards global financial excellence."
      },
      "portal": {
        "loading": "Loading...",
        "auth": {
          "createAccount": "Create Account",
          "welcomeBack": "Welcome Back",
          "join": "Join GKG Finance for global funding.",
          "access": "Access your loan applications and financial dashboard.",
          "fullName": "Full Name",
          "email": "Email Address",
          "password": "Password",
          "signUp": "Sign Up",
          "signIn": "Sign In",
          "orContinue": "Or continue with",
          "alreadyHave": "Already have an account?",
          "dontHave": "Don't have an account?",
          "loginFailed": "Google login failed. Please try again.",
          "authFailed": "Authentication failed. Please check your credentials."
        },
        "sidebar": {
          "dashboard": "Dashboard",
          "applications": "My Applications",
          "messages": "Messages",
          "settings": "Settings"
        },
        "dashboard": {
          "hello": "Hello, {{name}}",
          "subtitle": "Here's what's happening with your loans.",
          "newApplication": "New Application",
          "activeApps": "Active Applications",
          "totalFunded": "Total Funded",
          "nextPayment": "Next Payment",
          "recentApps": "Recent Applications",
          "viewAll": "View All",
          "noApps": "No applications found. Start by creating a new one.",
          "table": {
            "id": "ID",
            "amount": "Amount",
            "class": "Class",
            "date": "Date",
            "status": "Status"
          }
        },
        "modal": {
          "title": "New Loan Application",
          "amount": "Loan Amount ($)",
          "duration": "Duration (Years)",
          "years": "{{count}} Years",
          "frequency": "Frequency",
          "submit": "Submit Application"
        }
      },
      "admin": {
        "loading": "Loading Admin Panel...",
        "title": "Global Monitoring",
        "denied": {
          "title": "Access Denied",
          "subtitle": "You do not have administrative privileges to view this page."
        },
        "stats": {
          "totalUsers": "Total Users",
          "pendingApps": "Pending Apps",
          "approved": "Approved",
          "totalVolume": "Total Volume"
        },
        "searchPlaceholder": "Search by User ID or App ID...",
        "filters": {
          "all": "All",
          "pending": "Pending",
          "approved": "Approved",
          "rejected": "Rejected"
        },
        "table": {
          "application": "Application",
          "userDetails": "User Details",
          "amountClass": "Amount & Class",
          "status": "Status",
          "actions": "Actions",
          "unknownUser": "Unknown User"
        }
      }
    }
  },
  tr: {
    translation: {
      "nav": {
        "home": "Anasayfa",
        "services": "Hizmetler",
        "loans": "Kredi Programları",
        "calculator": "Hesaplayıcı",
        "team": "Liderlik Ekibi",
        "about": "Hakkımızda",
        "contact": "İletişim",
        "login": "Giriş",
        "portal": "Müşteri Portalı",
        "admin": "Yönetici Paneli",
        "signOut": "Çıkış Yap"
      },
      "hero": {
        "badge": "Güvenilir Finansal Danışmanlık",
        "title": "GKG Küresel Finansman Çözümü",
        "subtitle": "%2'den başlayan düşük yıllık faiz oranlarıyla küresel finansmana erişin",
        "cta": "Hemen Başvur",
        "consult": "Danışmanlık Al",
        "stats": {
          "interest": "Min. Faiz",
          "duration": "Maks. Süre",
          "partners": "Küresel Ortaklar"
        },
        "live": {
          "title": "Canlı Onaylar",
          "subtitle": "Gerçek Zamanlı Akış",
          "justNow": "Az önce"
        }
      },
      "calculator": {
        "title": "Kredi Hesaplayıcı",
        "amount": "Kredi Tutarı",
        "rate": "Faiz Oranı (%)",
        "duration": "Süre (Yıl)",
        "frequency": "Ödeme Sıklığı",
        "quarterly": "Üç Aylık",
        "semi-annual": "Altı Aylık",
        "annual": "Yıllık",
        "calculate": "Hesapla",
        "result": "Hesaplama Sonucu",
        "installment": "Dönemsel Taksit",
        "total": "Toplam Geri Ödeme",
        "interest": "Toplam Faiz",
        "year": "Yıl",
        "years": "Yıl",
        "note": "* Uygulanan faiz oranı: yıllık %{{rate}}."
      },
      "services": {
        "title": "Temel Hizmetlerimiz",
        "subtitle": "Uluslararası büyüme ve istikrar için tasarlanmış kapsamlı finansal çözümler.",
        "brokerage": { "title": "Kredi Aracılığı", "desc": "Sizi üst düzey uluslararası borç verenlerle buluşturuyoruz." },
        "advisory": { "title": "Finansal Danışmanlık", "desc": "Sermaye yapısı ve büyüme konusunda uzman rehberliği." },
        "risk": { "title": "Risk Değerlendirmesi", "desc": "Mümkün olan en iyi şartları güvence altına almak için derinlemesine analiz." },
        "structuring": { "title": "Kredi Yapılandırma", "desc": "İş modelinize özel geri ödeme planları." }
      },
      "about": {
        "title": "Küresel Finansmanda Boşluğu Kapatıyoruz",
        "desc": "İstanbul, Türkiye merkezli GKG FINANCE HOLDINGS, sınır ötesi finansman konusunda uzmanlaşmış önde gelen bir finansal danışmanlık firmasıdır. İddialı KOBİ'leri, girişimleri ve bireyleri 50'den fazla uluslararası borç veren ağıyla buluşturuyoruz.",
        "points": [
          "Küresel sermaye piyasalarına doğrudan erişim",
          "Uzman kredi yapılandırma ve risk değerlendirmesi",
          "Çok dilli destek (İngilizce ve Türkçe)",
          "Şeffaf aracılık ücret yapısı"
        ]
      },
      "eligibility": {
        "title": "Uygunluk Kriterleri",
        "individuals": { "title": "Bireyler", "items": ["Geçerli Kimlik/Pasaport", "Gelir Belgesi", "Kredi Geçmişi"] },
        "smes": { "title": "KOBİ'ler ve Girişimler", "items": ["Ticari Sicil Kaydı", "Finansal Tablolar", "İş Planı"] },
        "international": { "title": "Uluslararası", "items": ["KYC/AML Uyumluluğu", "Sınır Ötesi Vergi Kimliği", "Banka Referansları"] }
      },
      "faq": {
        "title": "Sıkça Sorulan Sorular",
        "q1": { "q": "Bir kredi için minimum gereksinimler nelerdir?", "a": "Gereksinimler kredi sınıfına göre değişir, ancak genellikle geçerli kimlik, gelir belgesi ve temiz bir kredi geçmişi içerir." },
        "q2": { "q": "Onay süreci ne kadar sürer?", "a": "Başlangıç kredileri 48 saat içinde onaylanabilir. Daha büyük ticari krediler genellikle tam risk değerlendirmesi için 5-10 iş günü sürer." },
        "q3": { "q": "Uluslararası girişimlere kredi sunuyor musunuz?", "a": "Evet, Türkiye pazarına odaklanarak küresel çapta girişimler ve KOBİ'ler için sınır ötesi finansman konusunda uzmanız." },
        "q4": { "q": "Aracılık ücretiniz nedir?", "a": "Ücretlerimiz şeffaftır ve kredi yapısına bağlıdır. Sadece başarılı fonlama durumunda ücret alıyoruz." }
      },
      "contact": {
        "title": "Ölçeklenmeye Hazır mısınız?",
        "subtitle": "Finans uzmanlarımızla ücretsiz bir danışmanlık alın ve işletmeniz için en iyi küresel finansman seçeneklerini keşfedin.",
        "call": "Bizi Arayın",
        "email": "Bize E-posta Gönderin",
        "form": {
          "name": "Ad Soyad",
          "email": "E-posta Adresi",
          "amount": "İlgilenilen Kredi Tutarı",
          "message": "Mesaj",
          "send": "Mesaj Gönder"
        }
      },
      "footer": {
        "desc": "Türkiye merkezli Uluslararası Kredi Aracılığı ve Finansal Danışmanlık. Sizi rekabetçi oranlarla küresel borç verenlerle buluşturuyoruz.",
        "quickLinks": "Hızlı Bağlantılar",
        "contactUs": "Bize Ulaşın",
        "newsletter": {
          "title": "Bülten",
          "desc": "En son finansal içgörüleri ve kredi tekliflerini almak için abone olun.",
          "placeholder": "E-posta adresiniz",
          "button": "Abone Ol"
        },
        "disclaimer": "Feragatname: GKG FINANCE HOLDINGS, aracı bir finansal danışman ve broker olarak hareket eder. Doğrudan bir borç veren değiliz. Tüm kredi onayları, ilgili borç veren kurumların hüküm ve koşullarına tabidir.",
        "terms": "Şartlar ve Koşullar",
        "privacy": "Gizlilik Politikası",
        "gdpr": "KVKK Uyumluluğu"
      },
      "loans": {
        "subtitle": "Özel finansal ihtiyaçlarınızı karşılamak için tasarlanmış yapılandırılmış kredi kademelerimizden birini seçin.",
        "annually": "yıllık",
        "select": "Plan Seç",
        "programs": {
          "starter": { "name": "Başlangıç Kredisi", "features": ["Hızlı Onay", "Esnek Şartlar", "Gizli Ücret Yok"] },
          "standard": { "name": "Standart Kredi", "features": ["İş Genişletme", "Rekabetçi Oranlar", "Finansal Danışmanlık"] },
          "premium": { "name": "Premium Kredi", "features": ["Öncelikli Destek", "Özel Geri Ödeme", "Risk Değerlendirmesi"] },
          "platinum": { "name": "Platin Kredi", "features": ["Pazarlık Edilebilir Şartlar", "Özel Yönetici", "Küresel Finansman"] }
        }
      },
      "team": {
        "title": "Liderlik Ekibi",
        "subtitle": "GKG FINANCE HOLDINGS'i küresel finansal mükemmelliğe taşıyan uzmanlar."
      },
      "portal": {
        "loading": "Yükleniyor...",
        "auth": {
          "createAccount": "Hesap Oluştur",
          "welcomeBack": "Tekrar Hoş Geldiniz",
          "join": "Küresel finansman için GKG Finance'e katılın.",
          "access": "Kredi başvurularınıza ve finansal panelinize erişin.",
          "fullName": "Ad Soyad",
          "email": "E-posta Adresi",
          "password": "Şifre",
          "signUp": "Kayıt Ol",
          "signIn": "Giriş Yap",
          "orContinue": "Veya şununla devam edin",
          "alreadyHave": "Zaten bir hesabınız var mı?",
          "dontHave": "Hesabınız yok mu?",
          "loginFailed": "Google girişi başarısız oldu. Lütfen tekrar deneyin.",
          "authFailed": "Kimlik doğrulama başarısız oldu. Lütfen bilgilerinizi kontrol edin."
        },
        "sidebar": {
          "dashboard": "Panel",
          "applications": "Başvurularım",
          "messages": "Mesajlar",
          "settings": "Ayarlar"
        },
        "dashboard": {
          "hello": "Merhaba, {{name}}",
          "subtitle": "Kredilerinizle ilgili güncel durum burada.",
          "newApplication": "Yeni Başvuru",
          "activeApps": "Aktif Başvurular",
          "totalFunded": "Toplam Fonlanan",
          "nextPayment": "Sonraki Ödeme",
          "recentApps": "Son Başvurular",
          "viewAll": "Hepsini Gör",
          "noApps": "Başvuru bulunamadı. Yeni bir tane oluşturarak başlayın.",
          "table": {
            "id": "ID",
            "amount": "Tutar",
            "class": "Sınıf",
            "date": "Tarih",
            "status": "Durum"
          }
        },
        "modal": {
          "title": "Yeni Kredi Başvurusu",
          "amount": "Kredi Tutarı ($)",
          "duration": "Süre (Yıl)",
          "years": "{{count}} Yıl",
          "frequency": "Sıklık",
          "submit": "Başvuruyu Gönder"
        }
      },
      "admin": {
        "loading": "Yönetici Paneli Yükleniyor...",
        "title": "Küresel İzleme",
        "denied": {
          "title": "Erişim Engellendi",
          "subtitle": "Bu sayfayı görüntülemek için yönetici yetkiniz yok."
        },
        "stats": {
          "totalUsers": "Toplam Kullanıcı",
          "pendingApps": "Bekleyen Başvurular",
          "approved": "Onaylananlar",
          "totalVolume": "Toplam Hacim"
        },
        "searchPlaceholder": "Kullanıcı Kimliği veya Başvuru Kimliği ile ara...",
        "filters": {
          "all": "Hepsi",
          "pending": "Bekleyen",
          "approved": "Onaylanan",
          "rejected": "Reddedilen"
        },
        "table": {
          "application": "Başvuru",
          "userDetails": "Kullanıcı Detayları",
          "amountClass": "Tutar ve Sınıf",
          "status": "Durum",
          "actions": "İşlemler",
          "unknownUser": "Bilinmeyen Kullanıcı"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
