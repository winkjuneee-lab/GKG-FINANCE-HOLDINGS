import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Globe, TrendingUp } from 'lucide-react';
import LiveLoanFeed from './LiveLoanFeed';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-50 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Shield size={14} />
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-8 text-3d">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-blue-900 text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 group">
                {t('hero.cta')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:border-blue-900 hover:text-blue-900 transition-all">
                {t('hero.consult')}
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-slate-100 pt-8">
              <div>
                <p className="text-2xl font-bold text-slate-900">2%</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{t('hero.stats.interest')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">10Y</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{t('hero.stats.duration')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">200+</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{t('hero.stats.partners')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000" 
                alt="Financial Consultancy" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
            </div>
            
            {/* Floating Card - Live Feed */}
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <LiveLoanFeed />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
