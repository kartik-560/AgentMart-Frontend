'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { businessService } from '../services/agentService';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [profile, setProfile] = useState({
    name: 'Apex Retail Enterprises',
    budgetLimit: 50000,
    maxDeliveryHours: 48,
    targetResaleMargin: 25,
    riskTolerance: 'BALANCED',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    businessService.getProfile()
      .then((res) => {
        if (mounted && res?.data) {
          setProfile(res.data);
        }
      })
      .catch(() => {
        // Fallback default state active
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <BusinessContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}

