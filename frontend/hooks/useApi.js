import { useState, useEffect, useCallback, useRef } from 'react';

// hook for fetching data — handles loading, errors, and refetching
// prevents state updates on unmounted components using a ref
export function useApi(fetchFn, deps = [], options = { immediate: true }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(options.immediate);
    const [error, setError] = useState(null);

    // track if component is mounted to avoid "force update on unmounted component" memory leaks
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            // only update state if still mounted
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message || 'An error occurred');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [fetchFn]);

    // trigger fetch on mount or when deps change
    useEffect(() => {
        if (options.immediate) {
            fetchData();
        }
    }, deps); // eslint-disable-line

    // cleanup: set ref to false when unmounting
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return { data, loading, error, refetch: fetchData, setData };
}

// hook for mutations (POST/PUT/DELETE) — returns { mutate, loading, error }
export function useMutation(mutationFn) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const mutate = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);

            try {
                const result = await mutationFn(...args);
                setData(result);
                return { success: true, data: result };
            } catch (err) {
                const message = err.message || 'An error occurred';
                setError(message);
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [mutationFn]
    );

    return { mutate, loading, error, data };
}
