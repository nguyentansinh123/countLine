// hooks/useLinkExpiration.ts
import { useEffect, useState } from 'react';

interface ExpirationResult {
  expired: boolean;
  expirationTime?: string;
}

export default function useLinkExpiration(pollMs = 30_000) {
  const [expired, setExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function checkOnce() {
      try {
        const res = await fetch('http://localhost:8000/api/check-expiration');
        const data: ExpirationResult = await res.json();
        setExpired(data.expired);
        if (data.expirationTime) setExpiresAt(new Date(data.expirationTime));
      } catch (err) {
        console.error('Expiration check failed', err);
      }
    }

    // initial call + interval
    checkOnce();
    timer = setInterval(checkOnce, pollMs);

    return () => clearInterval(timer);
  }, [pollMs]);

  return { expired, expiresAt };
}
