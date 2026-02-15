import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner component.
 *
 * @param {Object} props
 * @param {string} [props.message] - Loading message
 * @param {'sm'|'md'|'lg'} [props.size] - Spinner size
 * @param {boolean} [props.fullPage] - Whether to center in the full viewport
 */
export default function LoadingSpinner({
    message = 'Loading...',
    size = 'md',
    fullPage = false,
}) {
    const sizes = { sm: 20, md: 32, lg: 48 };
    const iconSize = sizes[size] || sizes.md;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: fullPage ? 0 : '64px 24px',
                minHeight: fullPage ? '100vh' : 'auto',
                gap: 16,
            }}
        >
            <Loader2
                size={iconSize}
                color="var(--color-primary, #10b981)"
                style={{
                    animation: 'spin 1s linear infinite',
                }}
            />
            {message && (
                <p
                    style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        fontWeight: 500,
                    }}
                >
                    {message}
                </p>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
