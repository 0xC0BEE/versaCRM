import { useState, useEffect, useCallback } from 'react';

/**
 * A generic hook to manage form state.
 * @param initialState The initial state of the form.
 * @param dependency A prop (like a selected item to edit) that should cause the form state to reset.
 */
export function useForm<T extends object>(initialState: T, dependency?: T | null) {
    const [formData, setFormData] = useState<T>(initialState);

    // Effect to reset the form state when the dependency changes (e.g., a new item is selected for editing)
    useEffect(() => {
        if (dependency) {
            // A more careful merge to prevent overwriting defined properties (like an empty array) with `undefined`.
            const newState = { ...initialState };
            for (const key in dependency) {
                // Ensure the key is on the dependency object itself
                if (Object.prototype.hasOwnProperty.call(dependency, key)) {
                    const value = (dependency as any)[key];
                    // Only overwrite if the new value is not undefined.
                    // This prevents `actions: []` in initialState from being replaced by `actions: undefined` from a partial dependency.
                    if (value !== undefined) {
                        (newState as any)[key] = value;
                    }
                }
            }
            setFormData(newState);
        } else {
            // When creating a new item (no dependency), reset to the initial state.
            setFormData(initialState);
        }
    }, [dependency, initialState]);

    const handleChange = useCallback((field: keyof T, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCustomFieldChange = useCallback((fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            customFields: {
                ...(prev as any).customFields,
                [fieldId]: value,
            }
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialState);
    }, [initialState]);

    return { formData, setFormData, handleChange, handleCustomFieldChange, resetForm };
}