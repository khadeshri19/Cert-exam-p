import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateApi } from '../api';
import { ShieldCheck, ShieldAlert, FileSearch, Calendar, User, Building2, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

const SarvarthLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const height = size === 'lg' ? 'h-16' : size === 'sm' ? 'h-6' : 'h-8';
    return (
        <div className="flex items-center justify-center">
            <img
                src="/sarvarth-logo.png"
                alt="Sarvarth"
                className={`${height} object-contain`}
            />
        </div>
    );
};

const VerificationPage: React.FC = () => {
    const { certificateId } = useParams<{ certificateId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (certificateId) {
            fetchVerification();
        } else {
            setLoading(false);
            setError("No Certificate ID provided");
        }
    }, [certificateId]);

    const fetchVerification = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await certificateApi.verify(certificateId!);
            setData(res.data.data);
        } catch (e: any) {
            console.error(e);
            setError("Invalid Certificate");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-[#ee7158] rounded-full mx-auto mb-4" />
                    <SarvarthLogo />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-4">
                <div className="w-full max-w-md text-center">
                    <Link to="/" className="inline-block mb-10">
                        <SarvarthLogo size="lg" />
                    </Link>
                    <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="size-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{error}</h1>
                        <p className="text-gray-500 mb-8">The certificate ID you provided does not exist in our system.</p>
                        <Link
                            to="/"
                            className="inline-block px-8 py-3 bg-[#3d5a5a] text-white rounded-xl font-medium"
                        >
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <SarvarthLogo size="lg" />
                    <h2 className="text-gray-500 mt-2 font-medium">Official Verification Portal</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Status Header */}
                    <div className={cn(
                        "p-8 text-center",
                        data.is_authorized ? "bg-green-50" : "bg-amber-50"
                    )}>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-4 border",
                            data.is_authorized
                                ? "bg-white text-green-700 border-green-200"
                                : "bg-white text-amber-700 border-amber-200"
                        )}>
                            {data.is_authorized ? (
                                <><ShieldCheck size={18} /> Authorized</>
                            ) : (
                                <><ShieldAlert size={18} /> Not Authorized</>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {data.certificate_title || "Certificate of Achievement"}
                        </h1>
                        <p className="text-gray-600">Issued by {data.organization_name || "Sarvarth Platform"}</p>
                    </div>

                    <div className="p-10">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                        <User className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Holder Name</p>
                                        <p className="text-lg font-semibold text-gray-800">{data.holder_name}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                        <Calendar className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Issue Date</p>
                                        <p className="text-lg font-semibold text-gray-800">
                                            {new Date(data.issue_date).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                        <Tag className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Certificate ID</p>
                                        <p className="text-lg font-mono font-semibold text-[#ee7158]">{data.certificate_id}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                        <Building2 className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Organization</p>
                                        <p className="text-lg font-semibold text-gray-800">{data.organization_name || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.is_authorized && (
                            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                                <FileSearch className="text-[#3d5a5a] shrink-0" size={24} />
                                <div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        This certificate was verified on {new Date().toLocaleDateString()}. It was authorized by <strong>{data.authorized_by_name || "Administrator"}</strong> on {new Date(data.authorized_at).toLocaleDateString()}.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Sarvarth Platform. All rights reserved.</p>
                        <Link to="/" className="text-xs font-bold text-[#3d5a5a] hover:underline">Sarvarth Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
