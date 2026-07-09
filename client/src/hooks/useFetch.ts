import { useEffect, useState } from 'react';
import axios from 'axios';

export function useFetch<T = any>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        axios
            .get(url)
            .then((r) => mounted && setData(r.data))
            .catch((e) => mounted && setError(String(e)))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [url]);

    return { data, loading, error };
}
