// 네비게이션을 제어하기 위한 컨텍스트 컴포넌트입니다.
"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <NavigationContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
};

