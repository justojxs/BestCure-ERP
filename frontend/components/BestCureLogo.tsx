import React from 'react';

/**
 * BestCure custom SVG logo — a veterinary cross with a heartbeat pulse line,
 * rendered as a polished brand mark. Supports two variants:
 *   • "icon"  — just the emblem (for sidebar)
 *   • "full"  — emblem + wordmark (for login page)
 */
export default function BestCureLogo({ variant = 'icon', size = 44 }) {
    const iconSize = variant === 'full' ? Math.max(size, 56) : size;

    const Emblem = () => (
        <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
        >
            <defs>
                <linearGradient id="bc-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="bc-shine" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="bc-shadow" x="-4" y="-4" width="72" height="72">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#059669" floodOpacity="0.35" />
                </filter>
            </defs>

            {/* Background rounded square */}
            <rect
                x="2" y="2" width="60" height="60" rx="16"
                fill="url(#bc-bg)" filter="url(#bc-shadow)"
            />
            {/* Subtle glassy shine */}
            <rect
                x="2" y="2" width="60" height="60" rx="16"
                fill="url(#bc-shine)"
            />

            {/* Veterinary Cross — clean, thick, modern */}
            <path
                d="M26 14h12v12h12v12H38v12H26V38H14V26h12V14z"
                fill="rgba(255,255,255,0.15)"
                rx="2"
            />

            {/* Heartbeat / Pulse line across the cross center */}
            <polyline
                points="14,32 22,32 25,22 29,42 33,18 37,38 40,28 42,32 50,32"
                fill="none"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Small paw print in bottom-right corner */}
            <g transform="translate(42, 44) scale(0.55)" opacity="0.7">
                {/* Main pad */}
                <ellipse cx="10" cy="14" rx="6" ry="5" fill="white" />
                {/* Toes */}
                <circle cx="3" cy="5" r="2.5" fill="white" />
                <circle cx="10" cy="2" r="2.5" fill="white" />
                <circle cx="17" cy="5" r="2.5" fill="white" />
            </g>

            {/* Inner border for depth */}
            <rect
                x="3" y="3" width="58" height="58" rx="15"
                fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"
            />
        </svg>
    );

    if (variant === 'icon') {
        return <Emblem />;
    }

    // Full variant — emblem + wordmark
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
            <div style={{ position: 'relative' }}>
                <Emblem />
                {/* Animated glow ring */}
                <div style={{
                    position: 'absolute', inset: -6,
                    borderRadius: 22,
                    border: '1.5px solid rgba(16,185,129,0.25)',
                    animation: 'pulse-glow 3s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{
                    fontSize: 28, fontWeight: 800, color: '#fff',
                    letterSpacing: '-0.8px', lineHeight: 1.2,
                    margin: 0,
                }}>
                    Best<span style={{
                        background: 'linear-gradient(135deg, #34d399, #2dd4bf)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>Cure</span>
                </h1>
                <p style={{
                    fontSize: 12.5, fontWeight: 500,
                    color: 'rgba(148,163,184,0.6)',
                    letterSpacing: '2.5px', textTransform: 'uppercase',
                    marginTop: 6,
                }}>
                    Veterinary Medicine Distribution
                </p>
            </div>
        </div>
    );
}
