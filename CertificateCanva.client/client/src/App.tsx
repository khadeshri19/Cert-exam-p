import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { canvasApi, adminApi, imagesApi } from './api';
import AdvancedCanvasPage from './pages/AdvancedCanvasPage';
import VerificationPage from './pages/VerificationPage';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getImageUrl = (fileUrl: string) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  return `${API_URL}/${cleanPath}`;
};

const ThemeContext = createContext<{ isDark: boolean; toggleTheme: () => void }>({ isDark: false, toggleTheme: () => { } });

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  return <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>{children}</ThemeContext.Provider>;
};

const SarvarthLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const height = size === 'xl' ? 'h-20' : size === 'lg' ? 'h-12' : size === 'sm' ? 'h-6' : 'h-8';

  return (
    <div className="flex items-center">
      <img
        src="/sarvarth-logo.png"
        alt="Sarvarth"
        className={`${height} object-contain`}
      />
    </div>
  );
};

// Reusable UI Components
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; icon?: React.ReactNode; rightElement?: React.ReactNode }>(
  ({ label, error, icon, rightElement, className, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700 ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#67c5c8] transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-gray-50/50 border rounded-2xl text-gray-800 transition-all duration-200 outline-none
            ${icon ? 'pl-11' : ''}
            ${rightElement ? 'pr-11' : ''}
            ${error ? 'border-red-400 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-[#67c5c8] focus:ring-4 focus:ring-[#67c5c8]/10'}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  )
);

const Button = ({ children, loading, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
  <button
    disabled={loading}
    className={`
      relative w-full py-4 text-white font-bold rounded-2xl transition-all duration-200 overflow-hidden
      disabled:opacity-60 disabled:cursor-not-allowed
      active:scale-[0.98] hover:shadow-xl
      ${className}
    `}
    {...props}
  >
    <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
      {children}
    </div>
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )}
  </button>
);

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const validate = () => {
    const errors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) errors.identifier = 'Username or Email is required';
    if (!password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = identifier.trim() !== '' && password !== '';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f5f5f0] overflow-hidden">
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden animate-fade-in"
        style={{ background: 'linear-gradient(135deg, #2d4545 0%, #3d5a5a 40%, #4a6b6b 100%)' }}
      >
        {/* Subtle animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/5 blur-[120px] rounded-full" />

        <div className="relative text-center max-w-lg space-y-8 z-10">
          <div className="mb-10 flex justify-center">
            <div className="bg-white/10 p-8 rounded-[40px] backdrop-blur-md border border-white/10 shadow-2xl scale-110 hover:scale-[1.12] transition-transform duration-500">
              <img src="/sarvarth-logo.png" alt="Sarvarth" className="h-24 object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              aware. align. act.
            </h1>
            <div className="h-1 w-20 bg-[#67c5c8] mx-auto rounded-full" />
            <p className="text-white/70 text-lg leading-relaxed font-light">
              Professional certificate design, generation, and verification platform for modern organizations.
            </p>
          </div>
        </div>

        {/* Footer info for branding */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} Sarvarth Platform
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 animate-slide-in-right">
        <div className="w-full max-w-[460px]">
          <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-white">
            <div className="lg:hidden flex justify-center mb-8">
              <SarvarthLogo size="lg" />
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Welcome back
              </h2>
              <p className="text-gray-500 font-medium">Please enter your details to sign in</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username or Email"
                placeholder="e.g. jdoe or john@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={formErrors.identifier}
                icon={<Mail size={20} />}
                autoComplete="username"
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                icon={<Lock size={20} />}
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <div className="flex justify-end pt-1">
                <button type="button" className="text-sm font-bold text-[#3d5a5a] hover:text-[#67c5c8] transition-colors">
                  Forgot your password?
                </button>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={!isFormValid || loading}
                className="bg-[#ee7158] hover:bg-[#eb5e41] shadow-orange-500/20 shadow-lg"
              >
                Sign In
                <ArrowRight size={18} className="ml-1" />
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400 mb-6 font-medium">Need to verify a certificate?</p>
              <Link
                to="/verify"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-[#3d5a5a]/10 text-[#3d5a5a] font-bold hover:bg-[#3d5a5a] hover:text-white hover:border-[#3d5a5a] transition-all duration-300"
              >
                <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                Verify a certificate →
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Sarvarth Certificate Engine V2.0
          </p>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{ items: { path: string; label: string; icon: React.ReactNode }[] }> = ({ items }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <SarvarthLogo size="md" />
      </div>

      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                ? 'text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              style={isActive ? { backgroundColor: '#ee7158' } : {}}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: '#3d5a5a' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full mt-3 px-4 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const AssetsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CanvasIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ProfileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

const userNavItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/assets', label: 'Assets', icon: <AssetsIcon /> },
  { path: '/canvas', label: 'Canvas', icon: <CanvasIcon /> },
  { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
];

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/admin/users', label: 'Users', icon: <UsersIcon /> },
];

const PageLayout: React.FC<{ children: React.ReactNode; title: string; isAdmin?: boolean }> = ({ children, title, isAdmin }) => {

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Sidebar items={isAdmin ? adminNavItems : userNavItems} />
      <div className="ml-60">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [canvases, setCanvases] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([canvasApi.getAll(), imagesApi.getAll()])
      .then(([canvasRes, imageRes]) => {
        setCanvases(canvasRes.data.data || []);
        setImages(imageRes.data.data || []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Work</h2>
            <p className="text-gray-500 mt-1">Your latest certificates and designs</p>
          </div>
          <button
            onClick={() => navigate('/canvas')}
            className="px-5 py-2.5 text-white font-medium rounded-xl transition-all hover:shadow-lg"
            style={{ backgroundColor: '#ee7158' }}
          >
            + Create New
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {canvases.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-5">Certificates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {canvases.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/canvas/${item.id}`)}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                      <div
                        className="aspect-[4/3] flex items-center justify-center relative"
                        style={{ background: 'linear-gradient(135deg, #67c5c8 0%, #3d5a5a 100%)' }}
                      >
                        <svg className="w-14 h-14 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {item.is_authorized && (
                          <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 text-xs font-medium rounded-full" style={{ color: '#3d5a5a' }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-800 truncate">{item.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-5">Recent Uploads</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {images.slice(0, 4).map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(item.file_url)}
                          alt={item.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'; }}
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-800 truncate text-sm">{item.file_name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{(item.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canvases.length === 0 && images.length === 0 && (
              <div className="text-center py-16">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: '#f0f7f7' }}
                >
                  <CanvasIcon />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No work yet</h3>
                <p className="text-gray-500 mb-6">Create your first certificate to get started</p>
                <button
                  onClick={() => navigate('/canvas')}
                  className="px-6 py-3 text-white font-medium rounded-xl"
                  style={{ backgroundColor: '#ee7158' }}
                >
                  Create Certificate
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const res = await imagesApi.getAll();
      setImages(res.data.data || []);
    } catch (e) { }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await imagesApi.upload(file);
      fetchImages();
    } catch (e) { }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await imagesApi.delete(id);
      fetchImages();
    } catch (e) { }
  };

  return (
    <PageLayout title="Assets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Assets</h2>
            <p className="text-gray-500 mt-1">Manage your images and files</p>
          </div>
          <label
            className="px-5 py-2.5 text-white font-medium rounded-xl cursor-pointer transition-all hover:shadow-lg"
            style={{ backgroundColor: '#ee7158' }}
          >
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            {uploading ? 'Uploading...' : '+ Upload Image'}
          </label>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {images.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(item.file_url)}
                    alt={item.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-3">
                  <button
                    onClick={() => {
                      // In a real app, we'd store the image in state or context
                      // For now, let's create a new canvas with this image
                      navigate('/canvas', { state: { initialImage: getImageUrl(item.file_url) } });
                    }}
                    className="px-4 py-2 bg-white text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Use in Canvas
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-700 truncate">{item.file_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(item.file_size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0f7f7' }}>
              <AssetsIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No assets yet</h3>
            <p className="text-gray-500 mb-8">Upload images to use in your certificates</p>
            <label className="px-8 py-3.5 text-white font-medium rounded-xl cursor-pointer inline-block shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: '#ee7158' }}>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              Upload Image
            </label>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <PageLayout title="Profile">
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-32" style={{ background: 'linear-gradient(135deg, #3d5a5a 0%, #67c5c8 100%)' }} />

          <div className="px-8 pb-8">
            <div className="-mt-16 mb-6 flex items-end gap-6">
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg"
                style={{ backgroundColor: '#ee7158' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500">@{user?.username}</p>
              </div>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-6">
                {message}
              </div>
            )}

            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 text-white font-medium rounded-xl transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#ee7158' }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, canvases: 0, authorized: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getUsers().then(res => {
      setStats(prev => ({ ...prev, users: res.data.data?.length || 0 }));
    }).catch(() => { });
  }, []);

  return (
    <PageLayout title="Admin Dashboard" isAdmin>
      <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0f7f7' }}>
                <UsersIcon />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
                <p className="text-gray-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff0ed' }}>
                <CanvasIcon />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.canvases}</p>
                <p className="text-gray-500">Certificates</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0fff0' }}>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.authorized}</p>
                <p className="text-gray-500">Authorized</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="px-6 py-3 text-white font-medium rounded-xl transition-all hover:shadow-lg"
              style={{ backgroundColor: '#3d5a5a' }}
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', role_id: 2 });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.data || []);
    } catch (e) { }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
      } else {
        await adminApi.createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', username: '', email: '', password: '', role_id: 2 });
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch (e) { }
  };

  return (
    <PageLayout title="User Management" isAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Users</h2>
            <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: '', username: '', email: '', password: '', role_id: 2 });
              setShowModal(true);
            }}
            className="px-5 py-2.5 text-white font-medium rounded-xl transition-all hover:shadow-lg"
            style={{ backgroundColor: '#ee7158' }}
          >
            + Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className={idx !== users.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: user.role_name === 'admin' ? '#3d5a5a' : '#ee7158' }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${user.role_name === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {user.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({ ...user, password: '' });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-600 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#67c5c8' } as React.CSSProperties}
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>User</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-white font-medium rounded-xl transition-all"
                    style={{ backgroundColor: '#ee7158' }}
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; userOnly?: boolean }> = ({ children, adminOnly, userOnly }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 rounded-full mx-auto mb-4" style={{ borderTopColor: '#ee7158' }} />
          <SarvarthLogo />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/user/dashboard" replace />;
  if (userOnly && isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return <>{children}</>;
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verify/:certificateId" element={<VerificationPage />} />
          <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/user/dashboard" element={<ProtectedRoute userOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute userOnly><AssetsPage /></ProtectedRoute>} />
          <Route path="/canvas" element={<ProtectedRoute userOnly><AdvancedCanvasPage /></ProtectedRoute>} />
          <Route path="/canvas/:id" element={<ProtectedRoute userOnly><AdvancedCanvasPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute userOnly><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
