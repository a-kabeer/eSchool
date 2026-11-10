import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Campus } from '@/types';
import { api } from '@/services/api';
import { signalRService } from '@/services/signalr';

interface CampusContextValue {
  campuses: Campus[];
  currentCampus: Campus | null;
  setCurrentCampus: (campus: Campus) => void;
  signalRConnected: boolean;
  liveEvent: string | null;
}

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
  const [liveEvent, setLiveEvent] = useState<string | null>(null);

  useEffect(() => {
    api.getCampuses().then((data) => {
      setCampuses(data);
      if (data && data.length > 0) {
        setCurrentCampus(data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!currentCampus) return;

    signalRService.connectCounter(currentCampus.id, (data: unknown) => {
      setSignalRConnected(true);
      const feeData = data as { amountPaid?: number; studentName?: string };
      setLiveEvent(`Fee received: PKR ${(feeData?.amountPaid ?? 8500).toLocaleString()} for ${feeData?.studentName ?? 'Student'}`);
      setTimeout(() => setLiveEvent(null), 6000);
    });

    signalRService.connectAttendance(currentCampus.id, (data: unknown) => {
      setSignalRConnected(true);
      const attData = data as { presentCount?: number };
      setLiveEvent(`Attendance updated: ${attData?.presentCount ?? 0} students recorded`);
      setTimeout(() => setLiveEvent(null), 6000);
    });

    setSignalRConnected(true);

    return () => {
      signalRService.disconnect();
    };
  }, [currentCampus]);

  return (
    <CampusContext.Provider
      value={{
        campuses,
        currentCampus,
        setCurrentCampus,
        signalRConnected,
        liveEvent,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used inside CampusProvider');
  return ctx;
}
