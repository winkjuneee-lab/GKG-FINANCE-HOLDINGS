import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function LoanCalculator() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(50000);
  const [duration, setDuration] = useState<number>(5);
  const [frequency, setFrequency] = useState<'quarterly' | 'semi-annual' | 'annual'>('annual');
  const [rate, setRate] = useState<number>(3.2);

  // Auto-set rate based on amount (Loan Classes)
  useEffect(() => {
    if (amount <= 20000) setRate(3.5);
    else if (amount <= 100000) setRate(3.2);
    else if (amount <= 500000) setRate(2.8);
    else setRate(2.0);
  }, [amount]);

  const calculate = () => {
    const periodsPerYear = frequency === 'quarterly' ? 4 : frequency === 'semi-annual' ? 2 : 1;
    const totalPeriods = duration * periodsPerYear;
    const periodicRate = (rate / 100) / periodsPerYear;
    
    // Simple interest for periodic installment (or PMT formula for amortized)
    // Using PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const installment = (amount * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / (Math.pow(1 + periodicRate, totalPeriods) - 1);
    const totalRepayment = installment * totalPeriods;
    const totalInterest = totalRepayment - amount;

    return {
      installment: installment.toFixed(2),
      totalRepayment: totalRepayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    };
  };

  const results = calculate();

  return (
    <section id="calculator" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2"
        >
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-3d">{t('calculator.title')}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('calculator.amount')} ($)
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
                <input 
                  type="range" 
                  min="5000" 
                  max="1000000" 
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full mt-4 accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('calculator.duration')}
                </label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(y => (
                    <option key={y} value={y}>{y} {y === 1 ? t('calculator.year') : t('calculator.years')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('calculator.frequency')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['quarterly', 'semi-annual', 'annual'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`py-2 px-1 text-xs font-semibold rounded-md border transition-all ${
                        frequency === f 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-600'
                      }`}
                    >
                      {t(`calculator.${f}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 p-8 md:p-12 text-white flex flex-col justify-center">
            <h3 className="text-xl font-semibold mb-8 opacity-80">{t('calculator.result')}</h3>
            
            <div className="space-y-8">
              <div>
                <p className="text-sm opacity-60 mb-1">{t('calculator.installment')}</p>
                <p className="text-4xl font-bold">${results.installment}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                <div>
                  <p className="text-xs opacity-60 mb-1">{t('calculator.total')}</p>
                  <p className="text-lg font-semibold">${results.totalRepayment}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">{t('calculator.interest')}</p>
                  <p className="text-lg font-semibold">${results.totalInterest}</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs opacity-60 italic">
                  {t('calculator.note', { rate })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
