
'use client';

import { useState, createContext, useContext, ReactNode, useMemo } from 'react';

interface ImmersiveContextType {
    isImmersive: boolean;
    setIsImmersive: (isImmersive: boolean | ((val: boolean) => boolean)) => void;
}

const ImmersiveContext = createContext<ImmersiveContextType | undefined>(undefined);

export const ImmersiveProvider = ({ children }: { children: ReactNode }) => {
    const [isImmersive, setIsImmersive] = useState(false);

    const contextValue = useMemo(() => ({
        isImmersive,
        setIsImmersive
    }), [isImmersive]);

    return (
        <ImmersiveContext.Provider value={contextValue}>
            {children}
        </ImmersiveContext.Provider>
    );
};

export const useImmersive = () => {
    const context = useContext(ImmersiveContext);
    if (!context) {
        throw new Error('useImmersive must be used within an ImmersiveProvider');
    }
    return context;
};
