import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function EmptyState({
    title = 'No data found',
    message = 'There are no items to display at this time.',
    icon,
    action,
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--radius-xl)',
                    background: 'rgba(148, 163, 184, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                }}
            >
                {icon || <AlertCircle size={28} color="var(--text-tertiary)" />}
            </div>

            <h3
                style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                }}
            >
                {title}
            </h3>

            <p
                style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-tertiary)',
                    maxWidth: 360,
                    lineHeight: 1.6,
                }}
            >
                {message}
            </p>

            {action && <div style={{ marginTop: 20 }}>{action}</div>}
        </div>
    );
}
