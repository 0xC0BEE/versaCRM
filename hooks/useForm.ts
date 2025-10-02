import { useState, useEffect, useCallback } from 'react';

/**
 * A generic hook to manage form state.
 * @param initialState The initial state of the form.
 * @param dependency A prop (like a selected item to edit) that should cause the form state to reset.
 */
export function useForm<T>(initialState: T, dependency?: T | null) {
    const [formData, setFormData] = useState<T>(initialState);

    // Effect to reset the form state when the dependency changes (e.g., a new item is selected for editing)
    useEffect(() => {
        setFormData(dependency || initialState);
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