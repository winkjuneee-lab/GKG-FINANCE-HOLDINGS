import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, User } from 'lucide-react';

const names = [
  'Ahmed Y.', 'Sarah M.', 'John D.', 'Elena K.', 'Mehmet S.', 
  'Linda W.', 'Robert P.', 'Chen L.', 'Sofia R.', 'David B.',
  'Fatima A.', 'Hans G.', 'Yuki T.', 'Carlos M.', 'Anna L.'
];

const locations = [
  'Istanbul', 'London', 'New York', 'Dubai', 'Berlin', 
  'Singapore', 'Tokyo', 'Paris', 'Zurich', 'Hong Kong'
];

export default function LiveLoanFeed() {
  const { t } = useTranslation();
  const [currentLoan, setCurrentLoan] = useState({
    name: names[0],
    amount: 120000,
    location: locations[0],
    time: t('hero.live.justNow')
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      // Range 5,000 to 10,000,000
      const randomAmount = Math.floor(Math.random() * (10000000 - 5000 + 1)) + 5000;
      
      setCurrentLoan({
        name: randomName,
        amount: randomAmount,
        location: randomLocation,
        time: t('hero.live.justNow')
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-100 min-w-[280px]">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <TrendingUp size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('hero.live.title')}</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] text-slate-400 font-medium">{t('hero.live.subtitle')}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentLoan.name + currentLoan.amount}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{currentLoan.name}</p>
              <p className="text-[10px] text-slate-500">{currentLoan.location} • {currentLoan.time}</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900 tracking-tight">
            ${currentLoan.amount.toLocaleString()}
          </p>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: "linear" }}
              className="h-full bg-blue-600"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
