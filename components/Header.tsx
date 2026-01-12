
import React, { useState, useEffect } from 'react';
import { getFormattedDate, getFormattedTime } from '../utils/timeUtils';

const Header: React.FC = () => {
  const [time, setTime] = useState(getFormattedTime());

  useEffect(() => {
    const timer = setInterval(() => setTime(getFormattedTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-6 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-lg">
      <div className="flex flex-col items-center sm:items-start">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          Tasmis Cottage
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Meal Management System</p>
      </div>
      <div className="text-center sm:text-right">
        <div className="text-slate-100 font-semibold">{getFormattedDate()}</div>
        <div className="text-emerald-400 font-mono text-lg">{time}</div>
      </div>
    </header>
  );
};

export default Header;
