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
        const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        onChange(selectedOptions);
    }

    return (
        <div>
            <label className="block text-sm font-medium text-text-primary">
                {label}
            </label>
            <select
                multiple
                value={selectedValues}
                onChange={handleSelect}
                className="custom-multiselect mt-1 block w-full p-2 text-sm bg-card-bg text-text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-input transition-all h-48"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} className="p-2">
                        {option.label}
                    </option>
                ))}
            </select>
            <p className="text-xs text-text-secondary mt-1">Hold Ctrl/Cmd to select multiple options.</p>
        </div>
    );
};

export default MultiSelect;
