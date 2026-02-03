import React from 'react';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/pages/dashboard.css';

const UserAssets: React.FC = () => {
    return (
        <>
            <Sidebar isAdmin={false} />
            <main className="main-content">
                <div className="page-container">
                    <header className="page-header">
                        <h1 className="page-title">Photo</h1>
                        <input type="text" className="page-search" placeholder="Search..." />
                    </header>

                    <section className="recents-section">
                        <h2 className="recents-title">Recents</h2>
                        <div className="photo-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="photo-item">
                                    <div className="photo-image">
                                        <span className="grid-item-placeholder">☁️</span>
                                    </div>
                                    <div className="photo-label">Image {i}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
};

export default UserAssets;
