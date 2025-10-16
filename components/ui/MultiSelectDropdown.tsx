import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import Input from './Input';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selectedValues, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);
  
  const filteredOptions = useMemo(() => {
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleToggleOption = (value: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    onChange(Array.from(newSelected));
  };
  
  const selectedLabels = useMemo(() => {
      return options.filter(o => selectedValues.includes(o.value)).map(o => o.label);
  }, [options, selectedValues]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-card-bg px-3 py-2 text-sm ring-offset-background placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <span className="truncate text-text-primary">
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDown size={16} className={`ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border-subtle bg-card-bg shadow-lg">
          <div className="p-2">
            <div className="relative">
                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search members..."
                    className="w-full rounded-md border border-border-subtle bg-hover-bg/50 py-1.5 pl-8 pr-2 text-sm"
                />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.map(option => (
              <li
                key={option.value}
                onClick={() => handleToggleOption(option.value)}
                className="cursor-pointer select-none rounded-md p-2 text-sm hover:bg-hover-bg flex items-center"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  readOnly
                  className="mr-2 h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"
                />
                {option.label}
              </li>
            ))}
             {filteredOptions.length === 0 && <li className="px-2 py-2 text-center text-sm text-text-secondary">No members found.</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;