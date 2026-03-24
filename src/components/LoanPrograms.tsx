import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

export default function LoanPrograms() {
  const { t } = useTranslation();

  const programs = [
    {
      id: 'starter',
      name: t('loans.programs.starter.name'),
      range: '$5,000 – $20,000',
      interest: '3.5%',
      features: t('loans.programs.starter.features', { returnObjects: true }) as string[],
      image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=500'
    },
    {
      id: 'standard',
      name: t('loans.programs.standard.name'),
      range: '$20,001 – $100,000',
      interest: '3.2%',
      features: t('loans.programs.standard.features', { returnObjects: true }) as string[],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=500'
    },
    {
      id: 'premium',
      name: t('loans.programs.premium.name'),
      range: '$100,001 – $500,000',
      interest: '2.8%',
      features: t('loans.programs.premium.features', { returnObjects: true }) as string[],
      image: 'https://images.unsplash.com/photo-1621933486600-28f41d22319e?auto=format&fit=crop&q=80&w=500'
    },
    {
      id: 'platinum',
      name: t('loans.programs.platinum.name'),
      range: '$500,001 – Unlimited',
      interest: '2.0%',
      features: t('loans.programs.platinum.features', { returnObjects: true }) as string[],
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=500'
    }
  ];

  return (
    <section id="loans" className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('nav.loans')}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('loans.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((p) => (
            <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full">
                    {p.id}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 mb-6 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
                <p className="text-blue-600 font-bold text-2xl mb-4">{p.interest} <span className="text-xs text-slate-400 font-normal">{t('loans.annually')}</span></p>
                <p className="text-sm text-slate-500 mb-6">{p.range}</p>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 rounded-xl border-2 border-blue-900 text-blue-900 font-bold hover:bg-blue-900 hover:text-white transition-all">
                  {t('loans.select')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
