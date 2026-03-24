import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Shield, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { UserProfile, LoanApplication } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function AdminPortal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          const profile = userSnap.data() as UserProfile;
          
          // Check if admin (either by role or by email bootstrap)
          const isUserAdmin = profile?.role === 'admin' || u.email === 'winkjuneee@gmail.com';
          setIsAdmin(isUserAdmin);
          if (!isUserAdmin) setLoading(false);
        } catch (error) {
          console.error("Admin check failed", error);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin || !user) return;

    // Listen for all users
    const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    // Listen for all applications
    const appsQuery = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const appsUnsub = onSnapshot(appsQuery, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'applications');
    });

    return () => {
      usersUnsub();
      appsUnsub();
    };
  }, [isAdmin, user]);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const updateAppStatus = async (appId: string, status: LoanApplication['status']) => {
    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, { 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">{t('admin.loading')}</div>;

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
        <Shield size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('admin.denied.title')}</h1>
        <p className="text-slate-500">{t('admin.denied.subtitle')}</p>
      </div>
    );
  }

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-blue-900" />
              <span className="text-sm font-bold text-blue-900 uppercase tracking-widest">{t('nav.admin')}</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900">{t('admin.title')}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
          >
            <LogOut size={20} />
            {t('nav.signOut')}
          </button>
        </header>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl"><Users size={24} /></div>
              <p className="text-sm font-medium text-slate-500">{t('admin.stats.totalUsers')}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
              <p className="text-sm font-medium text-slate-500">{t('admin.stats.pendingApps')}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{applications.filter(a => a.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
              <p className="text-sm font-medium text-slate-500">{t('admin.stats.approved')}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{applications.filter(a => a.status === 'approved').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><FileText size={24} /></div>
              <p className="text-sm font-medium text-slate-500">{t('admin.stats.totalVolume')}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">${applications.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={t('admin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-900 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl font-bold text-sm capitalize transition-all whitespace-nowrap ${
                  filter === f ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {t(`admin.filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-5">{t('admin.table.application')}</th>
                  <th className="px-6 py-5">{t('admin.table.userDetails')}</th>
                  <th className="px-6 py-5">{t('admin.table.amountClass')}</th>
                  <th className="px-6 py-5">{t('admin.table.status')}</th>
                  <th className="px-6 py-5 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const appUser = users.find(u => u.uid === app.userId);
                  return (
                    <motion.tr 
                      layout
                      key={app.id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-slate-400 mb-1">#{app.id.slice(0, 12)}</span>
                          <span className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{appUser?.displayName || t('admin.table.unknownUser')}</span>
                          <span className="text-xs text-slate-500">{appUser?.email || app.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">${app.amount.toLocaleString()}</span>
                          <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">{app.loanClass}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          app.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                          app.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {app.status === 'pending' && <Clock size={12} />}
                          {app.status === 'approved' && <CheckCircle size={12} />}
                          {app.status === 'rejected' && <XCircle size={12} />}
                          {t(`portal.dashboard.status.${app.status}`)}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {app.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateAppStatus(app.id, 'approved')}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => updateAppStatus(app.id, 'rejected')}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
