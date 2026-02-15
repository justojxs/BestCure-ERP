import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API data fetching with loading, error, and refresh support.
 *
 * @param {Function} fetchFn - Async function that returns data (e.g. api.getProducts)
 * @param {Array} deps - Dependency array for re-fetching
 * @param {Object} options - Options: { immediate: boolean }
 * @returns {{ data, loading, error, refetch, setData }}
 *
 * @example
 *   const { data: products, loading, error, refetch } = useApi(api.getProducts, []);
 */
export function useApi(fetchFn, deps = [], options = { immediate: true }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(options.immediate);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
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

    useEffect(() => {
        if (options.immediate) {
            fetchData();
        }
    }, deps);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return { data, loading, error, refetch: fetchData, setData };
}

/**
 * Custom hook for async mutations (POST, PUT, DELETE) with loading state.
 *
 * @param {Function} mutationFn - Async function to execute
 * @returns {{ mutate, loading, error, data }}
 *
 * @example
 *   const { mutate: deleteProduct, loading } = useMutation(api.deleteProduct);
 *   await deleteProduct(productId);
 */
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
