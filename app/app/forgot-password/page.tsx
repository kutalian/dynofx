'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [formAlert, setFormAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormAlert(null);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);

            if (email) {
                setFormAlert({ message: '✓ Reset link sent to your email!', type: 'success' });
                setEmail('');
            } else {
                setFormAlert({ message: '✗ Please enter a valid email', type: 'error' });
            }
        }, 1500);
    };

    return (
        <div className="auth-page-body">
            <div className="back-home">
                <Link href="/">← Back to Home</Link>
            </div>

            <div className="auth-container">
                <div className="auth-wrapper">
                    {/* Left Side - Branding */}
                    <div className="auth-branding">
                        <div>
                            <div className="logo">DynoFX</div>
                            <div className="branding-content">
                                <h2>Start Your Trading Journey Today</h2>
                                <p>Practice trading risk-free with $100,000 virtual money and learn from expert traders.</p>
                                <ul className="feature-list">
                                    <li>Risk-free simulation environment</li>
                                    <li>500+ educational video lessons</li>
                                    <li>Real-time market data</li>
                                    <li>Compete with other traders</li>
                                    <li>Track your progress & achievements</li>
                                </ul>
                            </div>
                        </div>
                        <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                            🎓 100% Educational Platform - No Real Money Trading
                        </div>
                    </div>

                    {/* Right Side - Forms */}
                    <div className="auth-forms">
                        <div className="form-container active" style={{ display: 'block' }}>
                            <div className="form-header">
                                <h2>Reset Password</h2>
                                <p>Enter your email to receive a reset link</p>
                            </div>

                            {formAlert && (
                                <div
                                    className="alert show"
                                    style={{
                                        display: 'flex',
                                        padding: '0.875rem 1rem',
                                        borderRadius: '12px',
                                        marginBottom: '1.5rem',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '0.9rem',
                                        backgroundColor: formAlert.type === 'success' ? '#d1fae5' : '#fee2e2',
                                        color: formAlert.type === 'success' ? '#065f46' : '#991b1b',
                                        border: `1px solid ${formAlert.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
                                    }}
                                >
                                    {formAlert.message}
                                </div>
                            )}

                            <form onSubmit={handleForgotPassword}>
                                <div className="form-group">
                                    <label htmlFor="forgotEmail">Email Address</label>
                                    <input
                                        type="email"
                                        id="forgotEmail"
                                        className="auth-input"
                                        placeholder="your@email.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            Sending<span className="spinner"></span>
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>

                            <div className="switch-form" style={{ marginTop: '2rem' }}>
                                <Link href="/login">← Back to Sign In</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
