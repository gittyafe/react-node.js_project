import React, { useEffect, useState } from 'react';

export default function Timer({ seconds, onExpire }: any) {
    const [s, setS] = useState(seconds);
    useEffect(() => {
        if (s <= 0) return onExpire && onExpire();
        const id = setInterval(() => setS((v) => v - 1), 1000);
        return () => clearInterval(id);
    }, [s, onExpire]);

    return <div>Time left: {s}s</div>;
}
