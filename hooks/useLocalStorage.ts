import { useState, Dispatch, SetStateAction, useCallback } from 'react';

/**
 * A custom hook that persists state to localStorage.
 * It has the same signature as React's `useState` hook.
 *
 * @param key The key to use in localStorage.
 * @param initialValue The initial value if no value is found in localStorage.
 * @returns A stateful value, and a function to update it.
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error, return initial value
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    // useCallback ensures the setter function has a stable identity,
    // preventing it from causing re-renders in child components that depend on it.
    const setValue: Dispatch<SetStateAction<T>> = useCallback(
        (value) => {
            try {
                // We use the functional update form of the setter from useState
                // to get the freshest previous state. This avoids needing `storedValue`
                // in the useCallback dependency array, making the setter function stable.
                setStoredValue((prevValue) => {
                    // Allow value to be a function so we have the same API as useState
                    const valueToStore = value instanceof Function ? value(prevValue) : value;
                    // Save to local storage
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    return valueToStore;
                });
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key] // Only re-create the function if the key changes
    );

    return [storedValue, setValue];
}

export default useLocalStorage;