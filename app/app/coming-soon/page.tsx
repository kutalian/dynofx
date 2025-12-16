'use client';

import Link from 'next/link';

export default function ComingSoonPage() {
    return (
        <div className="auth-page-body">
            <div className="back-home">
                <Link href="/">← Back to Home</Link>
            </div>

            <div className="auth-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <div
                    className="auth-wrapper"
                    style={{
                        display: 'block',
                        padding: '4rem 2rem',
                        minHeight: 'auto',
                        gridTemplateColumns: 'none'
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'var(--gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Mobile App Coming Soon
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--gray)',
                        marginBottom: '2rem',
                        lineHeight: 1.6
                    }}>
                        We're working hard to bring the DynoFX experience to your mobile device.
                        Stay tuned for updates!
                    </p>

                    <div style={{
                        background: 'rgba(124, 58, 237, 0.1)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>What to expect:</h3>
                        <ul style={{ listStyle: 'none', textAlign: 'left', display: 'inline-block' }}>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✅ Trade on the go
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✅ Push notifications
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✅ Offline mode for courses
                            </li>
                        </ul>
                    </div>

                    <Link href="/" className="btn btn-primary">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
