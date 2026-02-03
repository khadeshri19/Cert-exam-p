import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import SarvarthLogo from '../../components/common/SarvarthLogo';
import '../../styles/pages/dashboard.css';

const UserProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <>
            <Sidebar isAdmin={false} />
            <main className="main-content">
                <div className="page-container">
                    <header className="page-header">
                        <h1 className="page-title">Profile</h1>
                    </header>

                    <div className="profile-container">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar-large">
                                <SarvarthLogo size="lg" />
                            </div>
                        </div>
                        <div className="profile-form-section">
                            <div className="profile-form">
                                <div className="profile-field">
                                    <span className="profile-label">Name</span>
                                    <span className="profile-value">{user?.name}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-label">Username</span>
                                    <span className="profile-value">{user?.username}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-label">Role</span>
                                    <span className="profile-value">{user?.role_name}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-label">Organization</span>
                                    <span className="profile-value">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserProfile;
