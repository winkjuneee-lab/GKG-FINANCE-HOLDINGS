import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc,
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
  LogOut,
  Upload,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { UserProfile, LoanApplication, AppDocument } from '../types';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc as addFirestoreDoc } from 'firebase/firestore';

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
  const [activeTab, setActiveTab] = useState<'applications' | 'users'>('applications');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedUserForDoc, setSelectedUserForDoc] = useState<UserProfile | 'multi' | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          const profile = userSnap.data() as UserProfile;
          
          // Check if admin (either by role or by email bootstrap)
          const isUserAdmin = profile?.role === 'admin' || u.email === 'gkgholdings@outlook.com';
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create admin profile in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        const newProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: email,
          displayName: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Admin login failed", err);
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

  const handleFileUpload = async (userIds: string[], file: File) => {
    if (userIds.length === 0) {
      alert('No users selected.');
      return;
    }

    console.log("Starting upload process for users:", userIds, "File:", file.name, "Size:", file.size);

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('Preparing upload...');
      
      const storagePath = `documents/${userIds.length > 1 ? 'broadcast' : userIds[0]}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      console.log("Storage path:", storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Upload timed out after 45 seconds. Please check your connection.'));
        }, 45000);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${Math.round(progress)}%`);
            setUploadProgress(progress);
            setUploadStatus(`Uploading: ${Math.round(progress)}%`);
          }, 
          (error) => {
            clearTimeout(timeout);
            console.error("Storage upload task error:", error);
            reject(error);
          }, 
          () => {
            clearTimeout(timeout);
            console.log("Storage upload task completed successfully.");
            setUploadStatus('Finalizing...');
            resolve();
          }
        );
      });

      const url = await getDownloadURL(uploadTask.snapshot.ref);
      console.log("Download URL obtained:", url);
      setUploadStatus('Updating database...');

      // Create a document for every designated user
      const uploadPromises = userIds.map(uid => 
        addFirestoreDoc(collection(db, 'documents'), {
          userId: uid,
          name: file.name,
          url,
          type: file.type,
          createdAt: new Date().toISOString()
        }).catch(err => {
          console.error(`Database update failed for user ${uid}:`, err);
          handleFirestoreError(err, OperationType.CREATE, 'documents');
        })
      );
      
      await Promise.all(uploadPromises);
      console.log("All database updates completed.");
      
      if (userIds.length > 1) {
        alert(`File reflected on the accounts of ${userIds.length} designated users successfully!`);
      } else {
        alert('File uploaded successfully!');
      }
      
      setSelectedUserForDoc(null);
      setSelectedFile(null);
      setSelectedUserIds([]);
    } catch (error: any) {
      console.error("Upload process failed:", error);
      let message = 'Upload failed. Please try again.';
      
      // Check if it's a Firestore error from our handler (JSON string)
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.operationType) {
          message = `File uploaded to storage, but database update failed: ${parsedError.error}`;
        }
      } catch (e) {
        // Not a JSON error, handle standard Firebase errors
        if (error.code === 'storage/unauthorized') {
          message = 'Upload failed: Unauthorized access to storage. Please check storage rules.';
        } else if (error.code === 'storage/canceled') {
          message = error.message || 'Upload timed out or was canceled.';
        } else if (error.code === 'storage/retry-limit-exceeded') {
          message = 'Upload failed: Maximum retry limit exceeded. Please check your connection.';
        } else {
          message = error.message || message;
        }
      }
      alert(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const updateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const userRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userRef, {
        displayName: editingUser.displayName,
        role: editingUser.role
      });
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (error) {
      console.error("Update failed", error);
      alert('Update failed.');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">{t('admin.loading')}</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('nav.admin')}</h1>
          <p className="text-slate-500 mb-8">
            {isSignUp ? "Create Admin Account" : t('admin.denied.subtitle')}
          </p>

          <form onSubmit={handleManualLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('portal.auth.email')}</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" 
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('portal.auth.password')}</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            <button 
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAuthLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('portal.loading')}
                </>
              ) : (
                isSignUp ? "Sign Up" : t('portal.auth.signIn')
              )}
            </button>
          </form>

          <p className="mt-6 text-slate-500 text-sm">
            {isSignUp ? "Already have an account?" : "Need to create the admin account?"}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-slate-900 font-bold hover:underline"
            >
              {isSignUp ? t('portal.auth.signIn') : t('portal.auth.signUp')}
            </button>
          </p>
        </motion.div>
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
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setSelectedUserForDoc('multi');
                setSelectedUserIds(users.map(u => u.uid)); // Default to all
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
            >
              <Upload size={20} />
              Broadcast Document
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
            >
              <LogOut size={20} />
              {t('nav.signOut')}
            </button>
          </div>
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
          <div className="flex gap-2 w-full md:w-auto border-r border-slate-100 pr-4">
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'applications' ? 'bg-blue-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileText size={18} /> Applications
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'users' ? 'bg-blue-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Users size={18} /> Users
            </button>
          </div>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'applications' ? t('admin.searchPlaceholder') : "Search users by name or email..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-900 transition-all"
            />
          </div>
          {activeTab === 'applications' && (
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
          )}
        </div>

        {/* Applications Table */}
        {activeTab === 'applications' ? (
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
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-5">User</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Joined</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => 
                    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{u.displayName || 'Unnamed User'}</span>
                          <span className="text-xs text-slate-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedUserForDoc(u)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <Upload size={18} />
                          </button>
                          <button 
                            onClick={() => setEditingUser(u)}
                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <Edit size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {selectedUserForDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Document</h2>
            <p className="text-slate-500 mb-6">
              {selectedUserForDoc === 'multi' ? (
                <>Select users to reflect this document on their accounts</>
              ) : (
                <>Uploading for: <span className="font-bold text-slate-900">{selectedUserForDoc.displayName || selectedUserForDoc.email}</span></>
              )}
            </p>
            
            <div className="space-y-6">
              {selectedUserForDoc === 'multi' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">Designated Users ({selectedUserIds.length})</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedUserIds(users.map(u => u.uid))}
                        className="text-xs text-blue-900 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <button 
                        onClick={() => setSelectedUserIds([])}
                        className="text-xs text-slate-500 font-bold hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {users.map(u => (
                      <label key={u.uid} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedUserIds.includes(u.uid)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUserIds([...selectedUserIds, u.uid]);
                            else setSelectedUserIds(selectedUserIds.filter(id => id !== u.uid));
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                        />
                        <span className="text-sm text-slate-700 truncate">{u.displayName || u.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div 
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  selectedFile ? 'border-blue-900 bg-blue-50' : 'border-slate-200 hover:border-blue-900'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === 'application/pdf') setSelectedFile(file);
                }}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className={`mx-auto mb-4 ${selectedFile ? 'text-blue-900' : 'text-slate-300'}`} size={48} />
                  <p className="text-sm font-medium text-slate-600">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF files only (max 10MB)</p>
                </label>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setSelectedUserForDoc(null); setSelectedFile(null); setSelectedUserIds([]); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const ids = selectedUserForDoc === 'multi' ? selectedUserIds : [selectedUserForDoc.uid];
                    handleFileUpload(ids, selectedFile!);
                  }}
                  disabled={!selectedFile || isUploading || (selectedUserForDoc === 'multi' && selectedUserIds.length === 0)}
                  className="flex-[2] py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[52px]"
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
                    'Confirm Upload'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit User Profile</h2>
            <form onSubmit={updateUserProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={editingUser.displayName || ''} 
                  onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
