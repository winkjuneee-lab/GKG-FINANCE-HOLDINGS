import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
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
  getDoc,
  getDocFromServer
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
  AlertCircle,
  Shield,
  User as UserIcon,
  Download,
  Upload
} from 'lucide-react';
import { LoanApplication, UserProfile, AppDocument } from '../types';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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

export default function Portal() {
  const { t } = useTranslation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'messages' | 'settings' | 'documents'>('dashboard');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
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
        } catch (error) {
          console.error("Profile fetch failed", error);
        }
      } else {
        setProfile(null);
        setApplications([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const appsQuery = query(collection(db, 'applications'), where('userId', '==', user.uid));
    const unsubApps = onSnapshot(appsQuery, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'applications');
    });

    const docsQuery = query(collection(db, 'documents'), where('userId', '==', user.uid));
    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppDocument));
      setDocuments(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'documents');
    });

    return () => {
      unsubApps();
      unsubDocs();
    };
  }, [user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthLoading(true);
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
      switch (err.code) {
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please wait a few minutes before trying again.');
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password. Please check your credentials and try again.');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError(err.message || t('portal.auth.authFailed'));
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleFileUpload = async (file: File) => {
    if (!user || !file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing...');

    try {
      const storage = getStorage();
      const fileId = Math.random().toString(36).substring(7);
      const fileName = `${fileId}_${file.name}`;
      
      // If file is small (< 950KB), store in Firestore directly
      if (file.size < 950 * 1024) {
        setUploadStatus('Reading file...');
        const reader = new FileReader();
        const fileDataPromise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            resolve(base64.split(',')[1]);
          };
        });
        reader.readAsDataURL(file);
        const fileData = await fileDataPromise;

        setUploadStatus('Saving to database...');
        setUploadProgress(50);
        
        await addDoc(collection(db, 'documents'), {
          userId: user.uid,
          applicationId: 'general',
          name: file.name,
          type: file.type,
          fileData,
          createdAt: new Date().toISOString()
        }).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, 'documents');
        });
        
        setUploadProgress(100);
      } else {
        // Larger files go to Storage
        setUploadStatus('Uploading to storage...');
        const storageRef = ref(storage, `documents/${user.uid}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error('Upload timed out. Please try again.'));
          }, 60000);

          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              clearTimeout(timeout);
              reject(error);
            },
            async () => {
              clearTimeout(timeout);
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              setUploadStatus('Finalizing...');
              await addDoc(collection(db, 'documents'), {
                userId: user.uid,
                applicationId: 'general',
                name: file.name,
                type: file.type,
                url: downloadURL,
                createdAt: new Date().toISOString()
              }).catch(err => {
                handleFirestoreError(err, OperationType.CREATE, 'documents');
              });
              resolve();
            }
          );
        });
      }

      setSelectedFile(null);
      setUploadStatus('Success!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error: any) {
      console.error("Upload failed", error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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
      handleFirestoreError(error, OperationType.WRITE, 'applications');
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
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            <button 
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAuthLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('portal.loading')}
                </>
              ) : (
                isSignUp ? t('portal.auth.signUp') : t('portal.auth.signIn')
              )}
            </button>
          </form>

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex pt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)]">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">GKG</div>
              <span className="font-bold text-slate-900">GKG FINANCE</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={20} /> {t('portal.sidebar.dashboard')}
            </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'applications' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText size={20} /> {t('portal.sidebar.applications')}
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'messages' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare size={20} /> {t('portal.sidebar.messages')}
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'documents' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText size={20} /> Documents
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
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

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'dashboard' ? 'text-blue-900' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase">{t('portal.sidebar.dashboard')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('applications')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'applications' ? 'text-blue-900' : 'text-slate-400'}`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-bold uppercase">{t('portal.sidebar.applications')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'messages' ? 'text-blue-900' : 'text-slate-400'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-bold uppercase">{t('portal.sidebar.messages')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'documents' ? 'text-blue-900' : 'text-slate-400'}`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-bold uppercase">Docs</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'settings' ? 'text-blue-900' : 'text-slate-400'}`}
        >
          <Settings size={20} />
          <span className="text-[10px] font-bold uppercase">{t('portal.sidebar.settings')}</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto pb-24 lg:pb-10">
        {activeTab === 'dashboard' && (
          <>
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('portal.dashboard.hello', { name: user.displayName })}</h1>
                <p className="text-slate-500">Here's what's happening with your loans.</p>
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
                <button 
                  onClick={() => setActiveTab('applications')}
                  className="text-sm text-blue-600 font-bold hover:underline"
                >
                  {t('portal.dashboard.viewAll')}
                </button>
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
                    {applications.slice(0, 5).map((app) => (
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
          </>
        )}

        {activeTab === 'applications' && (
          <>
            <header className="mb-10">
              <h1 className="text-2xl font-bold text-slate-900">{t('portal.sidebar.applications')}</h1>
              <p className="text-slate-500">{t('portal.dashboard.subtitle')}</p>
            </header>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
          </>
        )}

        {activeTab === 'messages' && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('portal.sidebar.messages')}</h2>
            <p className="text-slate-500 max-w-md">
              You don't have any messages yet. Our team will contact you here regarding your applications.
            </p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-4xl">
            <header className="mb-10 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
                <p className="text-slate-500">Download your loan agreements and other important files.</p>
              </div>
            </header>

            {/* Upload Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Document</h2>
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    selectedFile ? 'border-blue-900 bg-blue-50' : 'border-slate-200 hover:border-blue-900'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) setSelectedFile(file);
                  }}
                  onClick={() => document.getElementById('client-file-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="client-file-upload" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                  <Upload className={`mx-auto mb-3 ${selectedFile ? 'text-blue-900' : 'text-slate-300'}`} size={32} />
                  <p className="text-sm font-medium text-slate-600">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Please upload any required documents such as ID, proof of income, or bank statements to support your application.
                  </p>
                  <button 
                    onClick={() => handleFileUpload(selectedFile!)}
                    disabled={!selectedFile || isUploading}
                    className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[56px]"
                  >
                    {isUploading ? (
                      <div className="w-full px-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider">{uploadStatus}</span>
                          <span className="text-xs font-bold">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-blue-800/50 rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-white h-full"
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    ) : (
                      'Upload Document'
                    )}
                  </button>
                  {uploadStatus === 'Success!' && (
                    <p className="text-green-600 text-sm font-bold text-center animate-bounce">
                      Document uploaded successfully!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">{doc.name}</h3>
                      <p className="text-xs text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.fileData ? `data:${doc.type};base64,${doc.fileData}` : doc.url} 
                    download={doc.name}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-900 hover:text-white transition-all"
                  >
                    <Download size={20} />
                  </a>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="col-span-2 py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500 font-medium">No documents available yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <header className="mb-10">
              <h1 className="text-2xl font-bold text-slate-900">{t('portal.sidebar.settings')}</h1>
              <p className="text-slate-500">Manage your account preferences and profile information.</p>
            </header>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 bg-blue-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{user.displayName}</h3>
                  <p className="text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Profile Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={user.displayName || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={user.email || ''} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none" />
                  </div>
                </div>
                <button className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

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
