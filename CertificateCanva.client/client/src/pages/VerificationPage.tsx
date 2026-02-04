import React, { useState } from 'react';
import { certificateApi } from '../api';
import SarvarthLogo from '../components/common/SarvarthLogo';
import '../styles/pages/verification.css';

const VerificationPage: React.FC = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await certificateApi.verify(code);
            setResult(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Certificate not found');
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="verification-page">
        <main className="verification-content">
          {/* Left Panel - Form with Illustration */}
          <div className="verification-form-panel">
            <form className="verification-form" onSubmit={handleVerify}>
              <div className="verification-logo">
                <SarvarthLogo size="lg" />
              </div>
              <p className="verification-subtitle">Verify the certificate</p>
              <label className="code-label">Code</label>
              <input
                type="text"
                className="code-input"
                placeholder="Enter certificate code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button
                type="submit"
                className="verify-button"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              {error && <div className="verification-error">{error}</div>}
            </form>
          </div>

          {/* Right Panel - Result */}
          <div className="verification-result-panel">
            {result ? (
              <div className="certificate-display">
                <div className="certificate-logo">
                  <SarvarthLogo size="lg" />
                </div>
                <p className="certificate-type">Certificate of Completion</p>
                <h2 className="certificate-holder">
                  {result.holder_name || result.author_name}
                </h2>
                <p className="certificate-completed">successfully completed</p>
                <h3 className="certificate-title">
                  {result.certificate_title || result.title}
                </h3>
                <p className="certificate-date-label">on</p>
                <p className="certificate-date">
                  {result.authorized_date || result.issue_date
                    ? new Date(
                        result.authorized_date || result.issue_date,
                      ).toLocaleDateString()
                    : "-"}
                </p>
                <div className="certificate-badge">
                  <svg viewBox="0 0 60 60" fill="none">
                    <circle
                      cx="30"
                      cy="30"
                      r="28"
                      fill="#fef2f2"
                      stroke="#ee7158"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 30 L27 37 L40 24"
                      stroke="#ee7158"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <p className="verification-empty">
                Enter a certificate code to verify
              </p>
            )}
          </div>
        </main>
      </div>
    );
};

export default VerificationPage;
