import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all text-sm font-medium"
    >
      <Globe size={16} />
      <span>{i18n.language === 'en' ? 'TR' : 'EN'}</span>
    </button>
  );
}
