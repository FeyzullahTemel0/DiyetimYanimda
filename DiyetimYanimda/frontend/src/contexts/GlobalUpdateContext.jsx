import React, { createContext, useContext, useState, useCallback } from 'react';

// Context
const GlobalUpdateContext = createContext();

export function GlobalUpdateProvider({ children }) {
  const [updateKey, setUpdateKey] = useState(0);

  // Herhangi bir işlemden sonra çağrılır
  const triggerGlobalUpdate = useCallback(() => {
    setUpdateKey((k) => k + 1);
  }, []);

  return (
    <GlobalUpdateContext.Provider value={{ updateKey, triggerGlobalUpdate }}>
      {children}
    </GlobalUpdateContext.Provider>
  );
}

export function useGlobalUpdate() {
  return useContext(GlobalUpdateContext);
}
