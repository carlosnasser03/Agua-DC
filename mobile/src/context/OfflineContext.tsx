import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AsyncStorageProvider } from '../services/storage/AsyncStorageProvider';
import apiClient from '../api/client';

const PENDING_REPORTS_KEY = 'offline_pending_reports';
const HORARIOS_CACHE_KEY = 'offline_horarios_cache';
const MY_REPORTS_CACHE_KEY = 'offline_my_reports_cache'; // Fix cache para reportes del usuario

const storage = new AsyncStorageProvider();

export const OfflineContext = createContext<any>(null);

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [pendingSync, setPendingSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // isConnected can be null if uncertain, default to true
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (connected) {
        checkAndSync();
      }
    });

    checkAndSync(); // Initial check

    return () => unsubscribe();
  }, []);

  const checkAndSync = async () => {
    try {
      const queueRaw = await storage.getItem(PENDING_REPORTS_KEY);
      if (!queueRaw) {
        setPendingSync(false);
        return;
      }
      
      const queue = JSON.parse(queueRaw);
      if (queue.length > 0) {
        setPendingSync(true);
        const state = await NetInfo.fetch();
        if (state.isConnected) {
          syncReports(queue);
        }
      } else {
        setPendingSync(false);
      }
    } catch {}
  };

  const syncReports = async (queue: any[]) => {
    if (isSyncing) return;
    setIsSyncing(true);
    let failed: any[] = [];
    
    for (const report of queue) {
      try {
        await apiClient.post('/reports/app', report);
      } catch (err) {
         failed.push(report);
      }
    }
    
    await storage.setItem(PENDING_REPORTS_KEY, JSON.stringify(failed));
    setPendingSync(failed.length > 0);
    setIsSyncing(false);
  };

  const saveReportOffline = async (reportData: any) => {
    try {
      const queueRaw = await storage.getItem(PENDING_REPORTS_KEY);
      const queue = queueRaw ? JSON.parse(queueRaw) : [];
      queue.push({...reportData, offline_timestamp: Date.now()});
      await storage.setItem(PENDING_REPORTS_KEY, JSON.stringify(queue));
      setPendingSync(true);
    } catch {}
  };

  // Cache functions for Horarios
  const saveHorariosCache = async (filters: any, data: any) => {
     try {
       const cacheRaw = await storage.getItem(HORARIOS_CACHE_KEY) || '{}';
       const cache = JSON.parse(cacheRaw);
       cache[JSON.stringify(filters)] = data;
       await storage.setItem(HORARIOS_CACHE_KEY, JSON.stringify(cache));
     } catch {}
  };

  const getHorariosCache = async (filters: any) => {
     try {
       const cacheRaw = await storage.getItem(HORARIOS_CACHE_KEY);
       if (!cacheRaw) return null;
       const cache = JSON.parse(cacheRaw);
       return cache[JSON.stringify(filters)] || null;
     } catch {
       return null;
     }
  };

  // Cache functions for My Reports
  const saveMyReportsCache = async (data: any) => {
     try {
       await storage.setItem(MY_REPORTS_CACHE_KEY, JSON.stringify(data));
     } catch {}
  };

  const getMyReportsCache = async () => {
     try {
       const cacheRaw = await storage.getItem(MY_REPORTS_CACHE_KEY);
       return cacheRaw ? JSON.parse(cacheRaw) : null;
     } catch {
       return null;
     }
  };

  return (
    <OfflineContext.Provider value={{
      isConnected,
      pendingSync,
      isSyncing,
      saveReportOffline,
      saveHorariosCache,
      getHorariosCache,
      saveMyReportsCache,
      getMyReportsCache,
      checkAndSync
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
