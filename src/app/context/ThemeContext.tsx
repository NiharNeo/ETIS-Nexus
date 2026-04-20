import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type AestheticTheme = 'default' | 'midnight' | 'cyberpunk' | 'emerald';

interface ThemeContextValue {
  theme: AestheticTheme;
  setTheme: (theme: AestheticTheme) => void;
  widgets: {
    activity: boolean;
    growth: boolean;
    updates: boolean;
    events: boolean;
  };
  setWidgetVisibility: (widget: 'activity' | 'growth' | 'updates' | 'events', visible: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AestheticProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [theme, setThemeState] = useState<AestheticTheme>('default');
  const [widgets, setWidgetsState] = useState({
    activity: true,
    growth: true,
    updates: true,
    events: true
  });

  // Sync with user settings on load
  useEffect(() => {
    if (user?.settings) {
      if (user.settings.theme) setThemeState(user.settings.theme as AestheticTheme);
      if (user.settings.widgets) setWidgetsState(user.settings.widgets);
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: AestheticTheme) => {
    setThemeState(newTheme);
    updateUser({
      ...user,
      settings: {
        ...user?.settings,
        theme: newTheme,
        widgets: user?.settings?.widgets || widgets
      }
    } as any);
  };

  const setWidgetVisibility = (widget: 'activity' | 'growth' | 'updates' | 'events', visible: boolean) => {
    const newWidgets = { ...widgets, [widget]: visible };
    setWidgetsState(newWidgets);
    updateUser({
      ...user,
      settings: {
        ...user?.settings,
        theme: user?.settings?.theme || theme,
        widgets: newWidgets
      }
    } as any);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, widgets, setWidgetVisibility }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAesthetics() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAesthetics must be used within ThemeProvider');
  return ctx;
}
