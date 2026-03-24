import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        const profile = userSnap.data() as UserProfile;
        setIsAdmin(profile?.role === 'admin' || u.email === 'gkgholdings@outlook.com');
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.services'), href: '/#services' },
    { name: t('nav.loans'), href: '/#loans' },
    { name: t('nav.calculator'), href: '/#calculator' },
    { name: t('nav.team'), href: '/#team' },
    { name: t('nav.about'), href: '/#about' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">GKG</div>
              <span className="text-xl font-bold text-slate-900 hidden sm:block">GKG FINANCE HOLDINGS</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <LanguageSwitcher />
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                <Shield size={16} />
                {t('nav.admin')}
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/portal" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-full text-sm font-semibold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
                >
                  <User size={16} />
                  {t('nav.portal')}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title={t('nav.signOut')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/portal" 
                className="px-6 py-2 border-2 border-blue-900 text-blue-900 rounded-full text-sm font-bold hover:bg-blue-900 hover:text-white transition-all"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-slate-600"
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link 
              to="/admin" 
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-3 bg-slate-900 text-white rounded-xl font-bold"
            >
              {t('nav.admin')}
            </Link>
          )}
          <Link 
            to="/portal" 
            onClick={() => setIsOpen(false)}
            className="block w-full text-center py-3 bg-blue-900 text-white rounded-xl font-bold"
          >
            {user ? t('nav.portal') : t('nav.login')}
          </Link>
          {user && (
            <button 
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold border-2 border-red-50 border-dashed rounded-xl"
            >
              <LogOut size={20} />
              {t('nav.signOut')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
