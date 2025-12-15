import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { db } from '../services/mockDatabase';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  loading: boolean;
  isEditing: boolean;
  toggleEditing: () => void;
  updateContent: (key: string, value: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    db.getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await db.updateSettings(newSettings);
  };

  const updateContent = async (key: string, value: string) => {
    if (!settings) return;
    const newOverrides = { ...settings.contentOverrides, [key]: value };
    const newSettings = { ...settings, contentOverrides: newOverrides };
    setSettings(newSettings);
    await db.updateContentOverride(key, value);
  };

  const toggleEditing = () => setIsEditing(prev => !prev);

  if (loading || !settings) return <div className="h-screen flex items-center justify-center bg-gray-50 text-dahab-teal font-bold animate-pulse">Loading App Configuration...</div>;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, isEditing, toggleEditing, updateContent }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
