import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { imagesApi } from '../../api';
import '../../styles/pages/dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getImageUrl = (fileUrl: string) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  return `${API_URL}/${cleanPath}`;
};

const UserAssets: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await imagesApi.getAll();
      setImages(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img =>
    img.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Sidebar isAdmin={false} />
      <main className="main-content">
        <div className="page-container">
          <header className="page-header">
            <h1 className="page-title">Photo</h1>
            <input
              type="text"
              className="page-search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </header>

          <section className="recents-section">
            <h2 className="recents-title">Recents</h2>

            {loading ? (
              <div className="flex-center" style={{ padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : filteredImages.length > 0 ? (
              <div className="photo-grid">
                {filteredImages.map((img) => (
                  <div key={img.id} className="photo-item">
                    <div className="photo-image">
                      <img
                        src={getImageUrl(img.file_url)}
                        alt={img.file_name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                        }}
                      />
                    </div>
                    <div className="photo-label">{img.file_name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                {searchQuery ? 'No images match your search' : 'No assets uploaded yet'}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default UserAssets;
