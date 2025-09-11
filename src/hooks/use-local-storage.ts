'use client';
import { useState, useEffect, useCallback } from 'react';

// A helper function to safely parse JSON from localStorage
function safeJsonParse<T>(item: string | null): T | null {
    if (item === null) return null;
    try {
        return JSON.parse(item);
    } catch (error) {
        console.error("Failed to parse JSON from localStorage", error);
        return null;
    }
}


export const useLocalStorage = <T,>(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            const parsedItem = safeJsonParse<T>(item);
            return parsedItem ?? initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });
    
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
             if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
             console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);


    return [storedValue, setValue] as const;
};

      