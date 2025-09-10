
'use client';
import { useState, createContext, useContext, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
