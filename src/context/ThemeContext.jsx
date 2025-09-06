import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mpl-theme") : null;
    return stored === "dark" || stored === "light" ? stored : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    body.classList.toggle("dark", isDark);
    body.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("mpl-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);


