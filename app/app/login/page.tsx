'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formAlert, setFormAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const supabase = createClient();

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with Google:', error);
            setFormAlert({ message: 'Error logging in with Google', type: 'error' });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormAlert(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setFormAlert({ message: `✗ ${error.message}`, type: 'error' });
            } else {
                setFormAlert({ message: '✓ Login successful! Redirecting...', type: 'success' });
                // We typically wait for the router/state update, but for UX we can redirect manually or wait for the auth state listener
                // A hard redirect ensures the full app state is refreshed
                window.location.href = '/dashboard';
            }
        } catch (error) {
            setFormAlert({ message: '✗ An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
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
                                <h2>Welcome Back!</h2>
                                <p>Sign in to continue your trading journey</p>
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

                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label htmlFor="loginEmail">Email Address</label>
                                    <input
                                        type="email"
                                        id="loginEmail"
                                        className="auth-input"
                                        placeholder="your@email.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="loginPassword">Password</label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="loginPassword"
                                            className="auth-input"
                                            placeholder="Enter your password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '🙈' : '👁️'}
                                        </span>
                                    </div>
                                </div>

                                <div className="checkbox-group">
                                    <input type="checkbox" id="rememberMe" />
                                    <label htmlFor="rememberMe">Remember me</label>
                                </div>

                                <div className="forgot-password-link">
                                    <Link href="/forgot-password">Forgot Password?</Link>
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            Signing In<span className="spinner"></span>
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="divider">Or continue with</div>

                            <div className="social-buttons" style={{ gridTemplateColumns: '1fr' }}>
                                <button
                                    className="btn-social"
                                    type="button"
                                    onClick={handleGoogleLogin}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>

                            <div className="switch-form">
                                Don't have an account? <Link href="/signup">Sign Up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
