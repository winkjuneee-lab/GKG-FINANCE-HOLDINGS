import Hero from '../components/Hero';
import LoanCalculator from '../components/LoanCalculator';
import LoanPrograms from '../components/LoanPrograms';
import Team from '../components/Team';
import { motion } from 'motion/react';
import { Shield, Users, Globe, Briefcase, CheckCircle2, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <main>
      <Hero />
      
      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('services.title')}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Globe, title: t('services.brokerage.title'), desc: t('services.brokerage.desc') },
              { icon: Briefcase, title: t('services.advisory.title'), desc: t('services.advisory.desc') },
              { icon: Shield, title: t('services.risk.title'), desc: t('services.risk.desc') },
              { icon: Users, title: t('services.structuring.title'), desc: t('services.structuring.desc') }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-blue-900 text-white rounded-xl flex items-center justify-center mb-6">
                  <s.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <LoanPrograms />
      <LoanCalculator />

      <Team />

      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573161158365-59b82f3d95a2?auto=format&fit=crop&q=80&w=1000" 
                alt="Our Team" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-900/10 rounded-full -z-10" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">{t('about.title')}</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {t('about.desc')}
              </p>
              <div className="space-y-4">
                {(t('about.points', { returnObjects: true }) as string[]).map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="eligibility" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-blue-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-12 text-center">{t('eligibility.title')}</h2>
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { title: t('eligibility.individuals.title'), items: t('eligibility.individuals.items', { returnObjects: true }) as string[] },
                  { title: t('eligibility.smes.title'), items: t('eligibility.smes.items', { returnObjects: true }) as string[] },
                  { title: t('eligibility.international.title'), items: t('eligibility.international.items', { returnObjects: true }) as string[] }
                ].map((group, i) => (
                  <div key={i} className="space-y-6">
                    <h3 className="text-xl font-bold text-blue-200 uppercase tracking-widest">{group.title}</h3>
                    <ul className="space-y-4">
                      {group.items.map(item => (
                        <li key={item} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="text-lg opacity-90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">{t('faq.title')}</h2>
          <div className="space-y-6">
            {[
              t('faq.q1', { returnObjects: true }),
              t('faq.q2', { returnObjects: true }),
              t('faq.q3', { returnObjects: true }),
              t('faq.q4', { returnObjects: true })
            ].map((item: any, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-12 lg:p-20 bg-blue-900 text-white">
              <h2 className="text-4xl font-bold mb-8">{t('contact.title')}</h2>
              <p className="text-lg text-blue-100 mb-12">
                {t('contact.subtitle')}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Phone size={24} /></div>
                  <div>
                    <p className="text-sm opacity-60">{t('contact.call')}</p>
                    <p className="text-xl font-bold">+90 (212) 555 0123</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Mail size={24} /></div>
                  <div>
                    <p className="text-sm opacity-60">{t('contact.email')}</p>
                    <p className="text-xl font-bold">consult@gkgfinance.com.tr</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-12 lg:p-20">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.name')}</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.email')}</label>
                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.amount')}</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900">
                    <option>$5,000 - $20,000</option>
                    <option>$20,001 - $100,000</option>
                    <option>$100,001 - $500,000</option>
                    <option>$500,001+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.message')}</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900"></textarea>
                </div>
                <button className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
                  {t('contact.form.send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            <span className="text-2xl font-bold">HSBC</span>
            <span className="text-2xl font-bold">J.P. Morgan</span>
            <span className="text-2xl font-bold">Deutsche Bank</span>
            <span className="text-2xl font-bold">BNP Paribas</span>
            <span className="text-2xl font-bold">Garanti BBVA</span>
            <span className="text-2xl font-bold">Ziraat Bankası</span>
          </div>
        </div>
      </section>
    </main>
  );
}
