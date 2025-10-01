import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomTheme } from '../../types';
import Button from '../ui/Button';
import { Plus, Trash2, Edit, Check, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const ThemeBuilder: React.FC = () => {
    const { customThemes, addCustomTheme, updateCustomTheme, deleteCustomTheme, applyCustomTheme, activeCustomThemeId } = useTheme();
    const [editingTheme, setEditingTheme] = useState<Partial<CustomTheme> | null>(null);

    const defaultColors = {
        primary: '#3b82f6',
        background: '#1a202c',
        card: '#2d3748',
        text: '#e2e8f0',
        border: '#4a5568',
    };

    const neonPreset = {
        primary: '#39ff14', // Neon Green
        background: '#0d0d0d',
        card: '#1a1a1a',
        text: '#f0f0f0',
        border: '#333333',
    };

    useEffect(() => {
        if (editingTheme) {
            // Apply a temporary preview
            // In a real app this would be more complex, but for now we'll just edit
        }
    }, [editingTheme]);
    
    const handleColorChange = (colorName: keyof CustomTheme['colors'], value: string) => {
        if (editingTheme) {
            setEditingTheme(prev => ({
                ...prev,
                colors: { ...prev!.colors!, [colorName]: value }
            }));
        }
    };

    const handleNewTheme = () => {
        setEditingTheme({
            id: `custom_${Date.now()}`,
            name: 'My New Theme',
            colors: { ...defaultColors }
        });
    };
    
    const handleEditTheme = (theme: CustomTheme) => {
        setEditingTheme({ ...theme });
    };
    
    const handleSaveTheme = () => {
        if (!editingTheme || !editingTheme.name) {
            toast.error("Theme name cannot be empty.");
            return;
        }
        if (editingTheme.id && customThemes.some(t => t.id === editingTheme.id)) {
            updateCustomTheme(editingTheme as CustomTheme);
            toast.success("Theme updated!");
        } else {
            addCustomTheme(editingTheme as CustomTheme);
            toast.success("Theme saved!");
        }
        setEditingTheme(null);
    };

    const handleApplyNeon = () => {
        setEditingTheme({
            id: `custom_${Date.now()}`,
            name: 'My Neon Theme',
            colors: { ...neonPreset }
        });
    };

    return (
        <div>
            <h3 className="text-lg font-semibold">Custom Theme Builder</h3>
            <p className="text-sm text-gray-500 mb-4">Create, manage, and apply your own themes.</p>

            {editingTheme ? (
                <div className="p-4 border rounded-lg dark:border-dark-border bg-gray-50 dark:bg-gray-900/50 space-y-4">
                    <h4 className="font-semibold">{editingTheme.id ? 'Edit Theme' : 'Create New Theme'}</h4>
                    <input 
                        type="text" 
                        value={editingTheme.name || ''} 
                        onChange={e => setEditingTheme(p => ({...p!, name: e.target.value}))}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border dark:border-dark-border"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {(Object.keys(editingTheme.colors!) as Array<keyof CustomTheme['colors']>).map(key => (
                            <div key={key}>
                                <label className="block text-sm font-medium capitalize mb-1">{key}</label>
                                <input 
                                    type="color" 
                                    value={editingTheme.colors![key]}
                                    onChange={e => handleColorChange(key, e.target.value)}
                                    className="w-full h-10 p-1 bg-white dark:bg-gray-800 border rounded-md cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setEditingTheme(null)}>Cancel</Button>
                        <Button onClick={handleSaveTheme}>Save Theme</Button>
                    </div>
                </div>
            ) : (
                 <div className="flex gap-2">
                    <Button onClick={handleNewTheme} leftIcon={<Plus size={16}/>}>Create New Theme</Button>
                    <Button onClick={handleApplyNeon} variant="secondary" leftIcon={<Palette size={16}/>}>Neon Preset</Button>
                </div>
            )}
            
            <div className="mt-6 space-y-3">
                <h4 className="font-semibold">My Themes</h4>
                {customThemes.length > 0 ? (
                    customThemes.map(theme => (
                        <div key={theme.id} className="p-3 border dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.border}}></div>
                                <p className="font-medium">{theme.name}</p>
                                {activeCustomThemeId === theme.id && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={14}/> Active</span>}
                            </div>
                            <div className="space-x-2">
                                <Button size="sm" variant="secondary" onClick={() => applyCustomTheme(activeCustomThemeId === theme.id ? null : theme.id)}>
                                    {activeCustomThemeId === theme.id ? 'Deactivate' : 'Apply'}
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleEditTheme(theme)} leftIcon={<Edit size={14} />}>Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => deleteCustomTheme(theme.id)} leftIcon={<Trash2 size={14} />}>Delete</Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 py-4">No custom themes created yet.</p>
                )}
            </div>
        </div>
    );
};

export default ThemeBuilder;