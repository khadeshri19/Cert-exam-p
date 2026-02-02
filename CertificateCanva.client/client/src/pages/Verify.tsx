import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { verificationApi } from '../api';
import {
    CheckCircle,
    XCircle,
    Search,
    Award,
    Calendar,
    User,
    Building,
    Shield,
    Loader2,
} from 'lucide-react';
import './Verify.css';

interface VerificationResult {
    valid: boolean;
    message: string;
    details?: string;
    certificate?: {
        id: string;
        title: string;
        author_name: string;
        authorized_date: string;
        canvas_session_id: string;
        created_at: string;
    };
}

export const Verify: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [searchParams] = useSearchParams();
    const [verificationId, setVerificationId] = useState(code || '');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Auto-verify if id is in URL
    useEffect(() => {
        if (code) {
            handleVerify(code);
        }
    }, [code]);

    const handleVerify = async (idToVerify?: string) => {
        const verifyId = idToVerify || verificationId;
        if (!verifyId.trim()) {
            alert('Please enter a verification ID');
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const response = await verificationApi.verify(verifyId);
            setResult(response.data.data);
        } catch (error: any) {
            setResult({
                valid: false,
                message: '❌ This certificate is NOT valid',
                details: error.response?.data?.message || 'Verification failed. Please check the code and try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="verify-page">
            {/* Header */}
            <div className="verify-header">
                <div className="sarvarth-logo">
                    <Shield size={48} />
                    <span>Sarvarth</span>
                </div>
                <h1>Certificate Verification</h1>
                <p>Verify the authenticity of Sarvarth certificates</p>
            </div>

            {/* Search Box */}
            <div className="verify-search">
                <div className="search-container">
                    <input
                        type="text"
                        className="verify-input"
                        placeholder="Enter verification ID (UUID)"
                        value={verificationId}
                        onChange={(e) => setVerificationId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    />
                    <button
                        className="verify-button"
                        onClick={() => handleVerify()}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="spinner" size={20} />
                        ) : (
                            <Search size={20} />
                        )}
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </div>
            </div>

            {/* Results */}
            {hasSearched && !loading && result && (
                <div className={`verify-result ${result.valid ? 'valid' : 'invalid'}`}>
                    <div className="result-icon">
                        {result.valid ? (
                            <CheckCircle size={64} />
                        ) : (
                            <XCircle size={64} />
                        )}
                    </div>

                    <h2 className="result-message">{result.message}</h2>

                    {result.details && !result.valid && (
                        <p className="result-details">{result.details}</p>
                    )}

                    {result.valid && result.certificate && (
                        <div className="certificate-details">
                            <div className="detail-card">
                                <div className="detail-row">
                                    <Award className="detail-icon" size={20} />
                                    <div>
                                        <label>Certificate Title</label>
                                        <span>{result.certificate.title}</span>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <User className="detail-icon" size={20} />
                                    <div>
                                        <label>Author Name</label>
                                        <span>{result.certificate.author_name}</span>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <Calendar className="detail-icon" size={20} />
                                    <div>
                                        <label>Created Date</label>
                                        <span>{formatDate(result.certificate.created_at)}</span>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <Calendar className="detail-icon" size={20} />
                                    <div>
                                        <label>Authorized Date</label>
                                        <span>{formatDate(result.certificate.authorized_date)}</span>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <Building className="detail-icon" size={20} />
                                    <div>
                                        <label>Issued By</label>
                                        <span>Certificate Canvas</span>
                                    </div>
                                </div>

                                <div className="detail-row verification-code-row">
                                    <Shield className="detail-icon" size={20} />
                                    <div>
                                        <label>Verification ID</label>
                                        <span className="code">{result.certificate.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info */}
            <div className="verify-info">
                <h3>How it works</h3>
                <div className="info-steps">
                    <div className="info-step">
                        <div className="step-number">1</div>
                        <p>Enter the verification code from the certificate</p>
                    </div>
                    <div className="info-step">
                        <div className="step-number">2</div>
                        <p>Click verify to check authenticity</p>
                    </div>
                    <div className="info-step">
                        <div className="step-number">3</div>
                        <p>View certificate details if valid</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="verify-footer">
                <p>&copy; {new Date().getFullYear()} Sarvarth. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Verify;
