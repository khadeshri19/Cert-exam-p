import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { canvasApi, adminApi, imagesApi, verificationApi } from './api';
import * as fabric from 'fabric';
import './index.css';

// API URL for constructing image URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper to get full image URL
const getImageUrl = (fileUrl: string) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  // Remove leading slash if present
  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  return `${API_URL}/${cleanPath}`;
};

// ============================================
// THEME CONTEXT
// ============================================
const ThemeContext = createContext<{ isDark: boolean; toggleTheme: () => void }>({ isDark: false, toggleTheme: () => { } });
const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  return <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>{children}</ThemeContext.Provider>;
};

// ============================================
// SARVARTH LOGO
// ============================================
const SarvarthLogo: React.FC = () => (
  <div className="flex items-center gap-0.5">
    <span className="text-xl font-light text-slate-700 dark:text-white tracking-wide">sarv<span className="font-normal">ā</span>rth</span>
    <div className="flex flex-col h-5 ml-1">
      <div className="h-1.5 w-1.5 bg-cyan-400 rounded-sm ml-2" />
      <div className="h-1.5 w-2 bg-red-400 rounded-sm ml-1" />
      <div className="h-1.5 w-2.5 bg-slate-600 rounded-sm" />
    </div>
  </div>
);

// ============================================
// LOGIN PAGE
// ============================================
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin' : '/dashboard');
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); }
    catch (err: any) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-200 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8"><SarvarthLogo /></div>
        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-white" placeholder="Username" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-white" placeholder="Password" required />
          <button type="submit" disabled={loading} className="w-full py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded-lg">{loading ? 'Loading...' : 'Login'}</button>
        </form>
        <p className="text-center text-gray-500 mt-4 text-sm"><Link to="/verify" className="text-red-400">Verify a certificate →</Link></p>
      </div>
    </div>
  );
};

// ============================================
// USER SIDEBAR
// ============================================
const UserSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="w-32 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-3 pt-4">
        <SarvarthLogo />
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link to="/dashboard" className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-red-400 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
          Dashboard
        </Link>
        <Link to="/assets" className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/assets') ? 'bg-red-400 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
          Assets
        </Link>
        <Link to="/canvas" className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/canvas') ? 'bg-red-400 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
          Canvas
        </Link>
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-slate-700">
        <Link to="/profile" className={`flex items-center gap-2 px-3 py-2 rounded-md ${isActive('/profile') ? 'bg-red-400 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
          <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium truncate">{user?.name?.split(' ')[0]}</span>
        </Link>
      </div>
    </aside>
  );
};

// ============================================
// USER LAYOUT
// ============================================
const UserLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <UserSidebar />
      <div className="ml-32">
        {/* Header */}
        <header className="h-12 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h1>
            <div className="relative">
              <input type="text" placeholder="🔍" className="w-32 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-md text-sm text-gray-600 dark:text-gray-300" />
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-500 hover:text-red-500 text-sm">Logout</button>
        </header>
        {children}
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD PAGE
// ============================================
const Dashboard: React.FC = () => {
  const [canvases, setCanvases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await canvasApi.getAll();
        setCanvases(res.data.data || []);
      } catch (e) { }
      setLoading(false);
    };
    fetch();
  }, []);

  // Placeholder data if no canvases
  const placeholders = Array(8).fill(null).map((_, i) => ({ id: `placeholder-${i}`, title: i < 4 ? `Image ${i + 1}` : `Work ${i - 3}`, isPlaceholder: true }));
  const items = canvases.length > 0 ? canvases : placeholders;

  return (
    <UserLayout title="DashBoard">
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Recents</h2>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {items.slice(0, 8).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => !item.isPlaceholder && navigate(`/canvas/${item.id}`)}
                className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden ${!item.isPlaceholder ? 'cursor-pointer hover:shadow-md' : ''} transition`}
              >
                {/* Image Placeholder - Cyan/Green gradient like wireframe */}
                <div className="aspect-[4/3] bg-gradient-to-b from-cyan-300 to-green-400 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {canvases.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/canvas')} className="px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 text-sm">
              + Create New Canvas
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

// ============================================
// ASSETS (PHOTO) PAGE
// ============================================
const AssetsPage: React.FC = () => {
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
    try { await imagesApi.upload(file); fetchImages(); } catch (e) { }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await imagesApi.delete(id); fetchImages(); } catch (e) { }
  };

  // Placeholder images
  const placeholders = Array(8).fill(null).map((_, i) => ({ id: `ph-${i}`, file_name: `Image ${i + 1}`, isPlaceholder: true }));
  const items = images.length > 0 ? images : placeholders;

  return (
    <UserLayout title="Photo">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Recents</h2>
          <label className="px-4 py-1.5 bg-red-400 hover:bg-red-500 text-white text-sm rounded-md cursor-pointer">
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            {uploading ? 'Uploading...' : '+ Upload'}
          </label>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden relative">
                {item.isPlaceholder ? (
                  <div className="aspect-[4/3] bg-gradient-to-b from-cyan-300 to-green-400 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <>
                    <img src={getImageUrl(item.file_url)} alt={item.file_name} className="aspect-[4/3] object-cover w-full" />
                    <button onClick={() => handleDelete(item.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100">×</button>
                  </>
                )}
                <div className="p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.file_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

// ============================================
// CANVAS EDITOR PAGE
// ============================================
const CanvasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', title: '', date: new Date().toISOString().split('T')[0] });
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  // Fetch existing canvas
  useEffect(() => {
    if (id) {
      setLoading(true);
      canvasApi.getOne(id).then(res => {
        setCanvas(res.data.data);
        if (res.data.data.canvas_data) {
          try {
            const data = JSON.parse(res.data.data.canvas_data);
            setFormData({ name: data.name || '', title: data.title || res.data.data.title, date: data.date || new Date().toISOString().split('T')[0] });
          } catch (e) { }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvas && (id ? canvas : true)) {
      const fc = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        backgroundColor: '#ffffff',
      });

      // Add phone frame
      const frame = new fabric.Rect({
        left: 10, top: 10, width: 380, height: 480,
        fill: 'transparent', stroke: '#3b82f6', strokeWidth: 2,
        rx: 20, ry: 20, selectable: false
      });
      fc.add(frame);

      // Load existing canvas data
      if (canvas?.canvas_data) {
        try {
          fc.loadFromJSON(JSON.parse(canvas.canvas_data)).then(() => fc.renderAll());
        } catch (e) { }
      }

      setFabricCanvas(fc);
      return () => { fc.dispose(); };
    }
  }, [canvasRef.current, id, canvas]);

  const handleCreate = async () => {
    try {
      const res = await canvasApi.create(formData.title || 'Untitled');
      setCanvas(res.data.data);
      navigate(`/canvas/${res.data.data.id}`, { replace: true });
    } catch (e) { }
  };

  const handleGenerate = async () => {
    if (!canvas) { await handleCreate(); return; }
    setSaving(true);
    try {
      const canvasData = fabricCanvas ? JSON.stringify({ ...formData, fabricData: fabricCanvas.toJSON() }) : JSON.stringify(formData);
      await canvasApi.update(canvas.id, { title: formData.title, canvas_data: canvasData });
      setGeneratedId(canvas.id);
    } catch (e) { alert('Failed'); }
    setSaving(false);
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    link.download = `certificate-${canvas?.id || 'new'}.png`;
    link.href = dataUrl;
    link.click();
  };

  // If no ID, show create form first
  if (!id) {
    return (
      <UserLayout title="Canvas">
        <div className="p-6">
          <div className="max-w-md bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Create New Canvas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-gray-700 dark:text-white" placeholder="Certificate Title" />
              </div>
              <button onClick={handleCreate} className="w-full py-2 bg-red-400 hover:bg-red-500 text-white rounded-md">Create Canvas</button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (loading) {
    return <UserLayout title="Canvas"><div className="flex items-center justify-center h-96"><div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" /></div></UserLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex">
      {/* Left Sidebar */}
      <aside className="w-32 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen fixed left-0 top-0">
        <div className="p-3 pt-4"><SarvarthLogo /></div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Link to="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Dashboard</Link>
          <Link to="/assets" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Assets</Link>
          <Link to="/canvas" className="block px-3 py-2 rounded-md text-sm font-medium bg-red-400 text-white">Canvas</Link>
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-slate-700">
          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300">
            <div className="w-6 h-6 bg-red-400 rounded-full text-white text-xs flex items-center justify-center">C</div>
            <span className="text-sm">Chirag</span>
          </Link>
        </div>
      </aside>

      {/* Left Panel - Controls */}
      <div className="ml-32 w-48 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen fixed left-32 top-0">
        <div className="p-3 space-y-3">
          {/* Button */}
          <button className="w-full py-2 bg-red-400 hover:bg-red-500 text-white rounded-md text-sm font-medium">Button</button>

          {/* Tool Icons */}
          <div className="flex items-center gap-2 py-2 border-b border-gray-200 dark:border-slate-700">
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">✏️</button>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">📐</button>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">📝</button>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" />
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={saving} className="w-full py-2 bg-red-400 hover:bg-red-500 text-white rounded-md text-sm font-medium disabled:opacity-50">
            {saving ? 'Generating...' : 'Generate'}
          </button>

          {/* Bottom Icons */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-lg">📏</button>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-lg">🔲</button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="ml-80 flex-1 flex flex-col h-screen">
        {/* Top Bar */}
        <header className="h-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <input type="text" placeholder="🔍 Search..." className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-300 w-32" />
            <span className="text-xs text-gray-500">▶️</span>
            <span className="text-xs text-gray-500">⏸️</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/verify/${canvas?.id}`} target="_blank" className="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">Preview</Link>
            <button onClick={handleDownload} className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">Download</button>
          </div>
        </header>

        {/* Canvas Container */}
        <div className="flex-1 bg-gray-200 dark:bg-slate-900 flex items-center justify-center p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-4" style={{ transform: `scale(${zoom / 100})` }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Bottom Bar */}
        <footer className="h-8 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {generatedId && (
              <div className="flex items-center gap-2">
                <input type="text" value={generatedId} readOnly className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs font-mono w-48" />
                <button onClick={() => navigator.clipboard.writeText(generatedId)} className="text-blue-500 hover:text-blue-600">📋</button>
              </div>
            )}
            <span>Zoom: {zoom}%</span>
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="hover:text-gray-700">−</button>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="hover:text-gray-700">+</button>
          </div>
          <button className="text-xs text-blue-500 hover:text-blue-600">Open Sandbox</button>
        </footer>
      </div>
    </div>
  );
};

// ============================================
// PROFILE PAGE
// ============================================
const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '', password: '' });

  return (
    <UserLayout title="Profile">
      <div className="p-6">
        <div className="max-w-md bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-red-400 rounded-lg flex items-center justify-center overflow-hidden">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Username</label>
              <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={formData.email} readOnly className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-md text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Change password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-gray-700 dark:text-white" placeholder="New password" />
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-2 bg-red-400 hover:bg-red-500 text-white rounded-md text-sm">Save</button>
              <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-md text-sm hover:bg-gray-200 dark:hover:bg-slate-600">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

// ============================================
// ADMIN PAGES
// ============================================
const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <aside className="w-32 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen fixed">
        <div className="p-3 pt-4"><SarvarthLogo /></div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Link to="/admin" className={`block px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/admin' ? 'bg-red-400 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Dashboard</Link>
          <Link to="/admin/users" className={`block px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/admin/users' ? 'bg-red-400 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Users</Link>
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 text-sm">
            <div className="w-6 h-6 bg-red-400 rounded-full text-white text-xs flex items-center justify-center">{user?.name?.charAt(0)}</div>
            {user?.name?.split(' ')[0]}
          </div>
        </div>
      </aside>
      <div className="ml-32 flex-1">
        <header className="h-12 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4">
          <h1 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h1>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-500 hover:text-red-500 text-sm">Logout</button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => (
  <AdminLayout title="Admin Dashboard">
    <p className="text-gray-600 dark:text-gray-400 mb-4">Admin can only manage users.</p>
    <Link to="/admin/users" className="px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500">Go to User Management</Link>
  </AdminLayout>
);

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', role_id: 2 });

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { try { const res = await adminApi.getUsers(); setUsers(res.data.data || []); } catch (e) { } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) await adminApi.updateUser(editingUser.id, formData);
      else await adminApi.createUser(formData);
      setShowModal(false); setEditingUser(null); fetchUsers();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
  };

  return (
    <AdminLayout title="User Management">
      <div className="flex justify-end mb-4">
        <button onClick={() => { setEditingUser(null); setFormData({ name: '', username: '', email: '', password: '', role_id: 2 }); setShowModal(true); }} className="px-4 py-2 bg-red-400 text-white rounded-md text-sm hover:bg-red-500">+ Add User</button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Role</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-gray-200 dark:border-slate-700">
                <td className="px-4 py-3 text-gray-800 dark:text-white text-sm">{user.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{user.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded ${user.role_name === 'admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{user.role_name}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditingUser(user); setFormData({ ...user, password: '' }); setShowModal(true); }} className="text-blue-500 hover:text-blue-600 text-sm mr-3">Edit</button>
                  <button onClick={async () => { if (confirm('Delete?')) { await adminApi.deleteUser(user.id); fetchUsers(); } }} className="text-red-500 hover:text-red-600 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" required />
              <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" required />
              <input type="password" placeholder={editingUser ? 'New Password' : 'Password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white" required={!editingUser} />
              <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-white">
                <option value={1}>Admin</option>
                <option value={2}>User</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-white rounded text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-red-400 text-white rounded text-sm hover:bg-red-500">{editingUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

// ============================================
// VERIFY PAGE
// ============================================
const VerifyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [inputCode, setInputCode] = useState(code || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (code) verify(code); }, [code]);
  const verify = async (id: string) => {
    setLoading(true);
    try { const res = await verificationApi.verify(id); setResult(res.data.data); }
    catch (e: any) { setResult({ valid: false, message: e.response?.data?.message || 'Not found' }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-200 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6"><SarvarthLogo /></div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white text-center mb-4">Verify Certificate</h1>
        <div className="flex gap-2 mb-4">
          <input type="text" value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="Certificate ID" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-gray-700 dark:text-white" />
          <button onClick={() => verify(inputCode)} disabled={loading} className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 disabled:opacity-50">{loading ? '...' : 'Verify'}</button>
        </div>
        {result && (
          <div className={`p-4 rounded-lg ${result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-medium ${result.valid ? 'text-green-600' : 'text-red-600'}`}>{result.valid ? '✓ Valid Certificate' : '✕ Invalid'}</p>
            {result.certificate && <p className="text-sm text-gray-600 mt-2">Title: {result.certificate.title}</p>}
          </div>
        )}
        <p className="text-center mt-4"><Link to="/login" className="text-red-400 text-sm">Back to Login</Link></p>
      </div>
    </div>
  );
};

// ============================================
// PROTECTED ROUTE
// ============================================
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; userOnly?: boolean }> = ({ children, adminOnly, userOnly }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (userOnly && isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

// ============================================
// APP
// ============================================
const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify/:code" element={<VerifyPage />} />
          <Route path="/dashboard" element={<ProtectedRoute userOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute userOnly><AssetsPage /></ProtectedRoute>} />
          <Route path="/canvas" element={<ProtectedRoute userOnly><CanvasPage /></ProtectedRoute>} />
          <Route path="/canvas/:id" element={<ProtectedRoute userOnly><CanvasPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute userOnly><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
