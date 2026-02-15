import React from 'react';

/**
 * Reusable stat/KPI card component for dashboard metrics.
 *
 * @param {Object} props
 * @param {string} props.title - Metric label (e.g. "TOTAL REVENUE")
 * @param {string|number} props.value - Primary display value
 * @param {string} [props.subtitle] - Secondary text (e.g. "Avg. order: ₹699")
 * @param {React.ReactNode} props.icon - Lucide icon element
 * @param {string} [props.iconBg] - CSS color for icon background
 * @param {string} [props.trend] - Trend text (e.g. "+12.5%")
 * @param {'up'|'down'} [props.trendDirection] - Trend direction for coloring
 * @param {Function} [props.onClick] - Optional click handler
 */
export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBg = 'rgba(16, 185, 129, 0.15)',
    trend,
    trendDirection = 'up',
    onClick,
}) {
    return (
        <div
            className="stat-card"
            onClick={onClick}
            style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-lg)',
                        background: iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>

                {trend && (
                    <span
                        style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full, 99px)',
                            background:
                                trendDirection === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: trendDirection === 'up' ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        {trendDirection === 'up' ? '↗' : '↘'} {trend}
                    </span>
                )}
            </div>

            <p
                style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: 16,
                    marginBottom: 4,
                }}
            >
                {title}
            </p>

            <p
                style={{
                    fontSize: 'var(--text-3xl, 1.875rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                }}
            >
                {value}
            </p>

            {subtitle && (
                <p
                    style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        marginTop: 4,
                    }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
