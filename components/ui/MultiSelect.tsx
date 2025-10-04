import React from 'react';

// Placeholder for a proper MultiSelect component (e.g., using react-select)
interface MultiSelectProps {
    label: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedValues, onChange }) => {
    
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Explicitly type 'option' as HTMLOptionElement to resolve property 'value' not existing on type 'unknown'.
        const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        onChange(selectedOptions);
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <select
                multiple
                value={selectedValues}
                onChange={handleSelect}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options.</p>
        </div>
    );
};

export default MultiSelect;