import { useState, useEffect, useCallback, useRef } from 'react';
import { SovereignDocument } from '../types';

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export function useGoogleDrive(documents: SovereignDocument[], onMerge: (remoteDocs: SovereignDocument[]) => void) {
  const [tokens, setTokens] = useState<GoogleTokens | null>(() => {
    const saved = localStorage.getItem('google_drive_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('last_sync_time');
    return saved ? parseInt(saved, 10) : null;
  });

  const syncIntervalRef = useRef<number | null>(null);

  const connect = useCallback(async () => {
    try {
      const resp = await fetch('/api/auth/google/url');
      const { url } = await resp.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      window.open(
        url,
        'google_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error('Connection failure:', err);
    }
  }, []);

  const disconnect = useCallback(() => {
    setTokens(null);
    localStorage.removeItem('google_drive_tokens');
    localStorage.removeItem('last_sync_time');
    if (syncIntervalRef.current) window.clearInterval(syncIntervalRef.current);
  }, []);

  const sync = useCallback(async () => {
    if (!tokens || isSyncing) return;
    setIsSyncing(true);
    try {
      // 1. Fetch remote data
      const fetchResp = await fetch('/api/drive/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens })
      });
      const remoteData = await fetchResp.json();
      
      if (remoteData.documents && remoteData.documents.length > 0) {
        onMerge(remoteData.documents);
      }

      // 2. Upload local data (simplistic overwrite for now, merge happens on client)
      await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, documents })
      });

      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now.toString());
    } catch (err) {
      console.error('Sync failure:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [tokens, documents, isSyncing, onMerge]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const newTokens = event.data.tokens;
        setTokens(newTokens);
        localStorage.setItem('google_drive_tokens', JSON.stringify(newTokens));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (tokens) {
      // Initial sync
      sync();
      // Periodic sync every 2 minutes
      syncIntervalRef.current = window.setInterval(sync, 120000);
      return () => {
        if (syncIntervalRef.current) window.clearInterval(syncIntervalRef.current);
      };
    }
  }, [tokens]); // Only run on token change/init

  return {
    isCloudConnected: !!tokens,
    isSyncing,
    lastSyncTime,
    connect,
    disconnect,
    sync
  };
}
