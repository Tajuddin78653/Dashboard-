'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import type { AdminConfig } from '@/lib/api';

interface TradingModeContextValue {
  paperTrading: boolean;
  dhanConfigured: boolean;
  loading: boolean;
}

const TradingModeContext = createContext<TradingModeContextValue>({
  paperTrading: true,
  dhanConfigured: false,
  loading: true,
});

export function TradingModeProvider({ children }: { children: ReactNode }) {
  const [paperTrading, setPaperTrading] = useState(true);
  const [dhanConfigured, setDhanConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<AdminConfig>('/admin/config')
      .then((data) => {
        setPaperTrading(data.paper_trading);
        setDhanConfigured(data.dhan_configured);
      })
      .catch(() => {
        // Non-fatal — keep defaults (paper=true)
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <TradingModeContext.Provider value={{ paperTrading, dhanConfigured, loading }}>
      {children}
    </TradingModeContext.Provider>
  );
}

export function useTradingMode() {
  return useContext(TradingModeContext);
}
