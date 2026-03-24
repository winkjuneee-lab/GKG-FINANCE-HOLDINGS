import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { LoanApplication, UserProfile } from '../types';

export default function Portal() {
  const { t } = useTranslation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Ensure user profile exists
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email!,
            displayName: u.displayName || '',
            role: 'client',
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(userSnap.data() as UserProfile);
        }

        // Listen for applications
        const q = query(collection(db, 'applications'), where('userId', '==', u.uid));
        const unsubApps = onSnapshot(q, (snapshot) => {
          const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
          setApplications(apps);
          setLoading(false);
        });

        return () => unsubApps();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      setError(t('portal.auth.loginFailed'));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Create profile in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        const newProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: email,
          displayName: displayName,
          role: 'client',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth failed", err);
      setError(err.message || t('portal.auth.authFailed'));
    }
  };

  const handleLogout = () => signOut(auth);

  const createApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const duration = Number(formData.get('duration'));
    const frequency = formData.get('frequency') as any;

    let loanClass: any = 'starter';
    let rate = 3.5;
    if (amount > 500000) { loanClass = 'platinum'; rate = 2.0; }
    else if (amount > 100000) { loanClass = 'premium'; rate = 2.8; }
    else if (amount > 20000) { loanClass = 'standard'; rate = 3.2; }

    try {
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        amount,
        duration,
        frequency,
        status: 'pending',
        loanClass,
        interestRate: rate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowApplyModal(false);
    } catch (error) {
      console.error("Failed to apply", error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">{t('portal.loading')}</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">GF</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? t('portal.auth.createAccount') : t('portal.auth.welcomeBack')}
          </h1>
          <p className="text-slate-500 mb-8">
            {isSignUp ? t('portal.auth.join') : t('portal.auth.access')}
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('portal.auth.fullName')}</label>
                <input 
                  type="text" 
                  required 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" 
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('portal.auth.email')}</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" 
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('portal.auth.password')}</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
            >
              {isSignUp ? t('portal.auth.signUp') : t('portal.auth.signIn')}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">{t('portal.auth.orContinue')}</span></div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-white border-2 border-slate-200 rounded-xl font-bold flex items-center justify-center gap-3 hover:border-blue-900 transition-all mb-6"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Google
          </button>

          <p className="text-slate-500 text-sm">
            {isSignUp ? t('portal.auth.alreadyHave') : t('portal.auth.dontHave')}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-blue-900 font-bold hover:underline"
            >
              {isSignUp ? t('portal.auth.signIn') : t('portal.auth.signUp')}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">GF</div>
            <span className="font-bold text-slate-900">Global Finance</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-900 rounded-xl font-bold">
            <LayoutDashboard size={20} /> {t('portal.sidebar.dashboard')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all">
            <FileText size={20} /> {t('portal.sidebar.applications')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all">
            <MessageSquare size={20} /> {t('portal.sidebar.messages')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all">
            <Settings size={20} /> {t('portal.sidebar.settings')}
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} /> {t('nav.signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('portal.dashboard.hello', { name: user.displayName })}</h1>
            <p className="text-slate-500">{t('portal.dashboard.subtitle')}</p>
          </div>
          <button 
            onClick={() => setShowApplyModal(true)}
            className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={20} /> {t('portal.dashboard.newApplication')}
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{t('portal.dashboard.activeApps')}</p>
            <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{t('portal.dashboard.totalFunded')}</p>
            <p className="text-3xl font-bold text-slate-900">$0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{t('portal.dashboard.nextPayment')}</p>
            <p className="text-3xl font-bold text-slate-900">--</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">{t('portal.dashboard.recentApps')}</h2>
            <button className="text-sm text-blue-600 font-bold hover:underline">{t('portal.dashboard.viewAll')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">{t('portal.dashboard.table.id')}</th>
                  <th className="px-6 py-4">{t('portal.dashboard.table.amount')}</th>
                  <th className="px-6 py-4">{t('portal.dashboard.table.class')}</th>
                  <th className="px-6 py-4">{t('portal.dashboard.table.date')}</th>
                  <th className="px-6 py-4">{t('portal.dashboard.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{app.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">${app.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-md">
                        {app.loanClass}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && <Clock size={16} className="text-amber-500" />}
                        {app.status === 'approved' && <CheckCircle size={16} className="text-green-500" />}
                        {app.status === 'rejected' && <AlertCircle size={16} className="text-red-500" />}
                        <span className={`text-sm font-bold capitalize ${
                          app.status === 'pending' ? 'text-amber-600' : 
                          app.status === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      {t('portal.dashboard.noApps')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{t('portal.modal.title')}</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={createApplication} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('portal.modal.amount')}</label>
                <input name="amount" type="number" required min="5000" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('portal.modal.duration')}</label>
                  <select name="duration" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900">
                    {[1,2,3,4,5,6,7,8,9,10].map(y => <option key={y} value={y}>{t('portal.modal.years', { count: y })}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('portal.modal.frequency')}</label>
                  <select name="frequency" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900">
                    <option value="annual">{t('calculator.annual')}</option>
                    <option value="semi-annual">{t('calculator.semi-annual')}</option>
                    <option value="quarterly">{t('calculator.quarterly')}</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all">
                {t('portal.modal.submit')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return <AlertCircle size={size} className="rotate-45" />;
}
