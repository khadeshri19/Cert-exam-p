import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'An error occurred during login';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-effects">
                <div className="bg-gradient-1"></div>
                <div className="bg-gradient-2"></div>
                <div className="bg-gradient-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Award size={48} />
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to Certificate Canvas</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Need to verify a certificate?{' '}
                            <Link to="/verify">Verify here</Link>
                        </p>
                    </div>
                </div>

                <div className="login-info">
                    <h2>Certificate Canvas</h2>
                    <p>
                        Create, manage, and verify digital certificates with our powerful
                        canvas editor. Streamline your certificate workflow with
                        role-based access control and secure verification.
                    </p>
                    <ul className="feature-list">
                        <li>
                            <span className="feature-icon">✨</span>
                            Create beautiful certificate designs
                        </li>
                        <li>
                            <span className="feature-icon">🔐</span>
                            Secure authentication & authorization
                        </li>
                        <li>
                            <span className="feature-icon">✅</span>
                            Public certificate verification
                        </li>
                        <li>
                            <span className="feature-icon">📊</span>
                            Admin dashboard & user management
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;
