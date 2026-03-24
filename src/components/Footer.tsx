import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-900 font-bold text-xl">GKG</div>
              <span className="text-xl font-bold">GKG FINANCE HOLDINGS</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><Linkedin size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><Instagram size={18} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">{t('footer.quickLinks')}</h3>
            <ul className="space-y-4 text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/#about" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/#loans" className="hover:text-white transition-colors">{t('nav.loans')}</Link></li>
              <li><Link to="/#team" className="hover:text-white transition-colors">{t('nav.team')}</Link></li>
              <li><Link to="/#calculator" className="hover:text-white transition-colors">{t('nav.calculator')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">{t('footer.contactUs')}</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-500 shrink-0" />
                <span>Levent, Büyükdere Cd. No:123, 34394 Şişli/İstanbul, Turkey</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-blue-500 shrink-0" />
                <span>+90 (212) 555 0123</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-blue-500 shrink-0" />
                <span>info@gkgfinance.com.tr</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">{t('footer.newsletter.title')}</h3>
            <p className="text-slate-400 mb-4">{t('footer.newsletter.desc')}</p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder={t('footer.newsletter.placeholder')} 
                className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/10 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">
                {t('footer.newsletter.button')}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="max-w-md">
            <p>© 2026 GKG FINANCE HOLDINGS. All rights reserved.</p>
            <p className="mt-2 text-[10px] opacity-50 uppercase tracking-tighter">
              {t('footer.disclaimer')}
            </p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.gdpr')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
