import React, { createContext, useState, useContext, ReactNode } from 'react';

type CalendarSystem = 'gregorian' | 'hijri';

interface DateContextType {
  calendarSystem: CalendarSystem;
  toggleCalendarSystem: () => void;
  formatDate: (dateString: string) => string;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('gregorian');

  const toggleCalendarSystem = () => {
    setCalendarSystem(prev => prev === 'gregorian' ? 'hijri' : 'gregorian');
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (calendarSystem === 'hijri') {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } else {
      // Standard Gregorian DD/MM/YYYY
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).format(date);
    }
  };

  return (
    <DateContext.Provider value={{ calendarSystem, toggleCalendarSystem, formatDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};