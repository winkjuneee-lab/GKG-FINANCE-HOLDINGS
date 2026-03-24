import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const team = [
  {
    name: 'Marcus Thorne',
    role: 'Chief Executive Officer (CEO)'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Chief Financial Officer (CFO)'
  },
  {
    name: 'David Chen',
    role: 'Chief Operating Officer (COO)'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Chief Risk Officer (CRO)'
  },
  {
    name: 'Mehmet Demir',
    role: 'Head of Lending & Partnerships'
  }
];

export default function Team() {
  const { t } = useTranslation();

  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-3d">{t('team.title')}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('team.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-900/20 transition-all text-center"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{member.name}</h3>
              <p className="text-blue-900 text-sm font-bold uppercase tracking-wider">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
