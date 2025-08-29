import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Menu, Clock, Plus } from 'lucide-react';

const Header = ({ selectedDate, handleDateChange, setAddPanelOpen, setMobileMenuOpen }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-[#0b0d12]/80 backdrop-blur border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-md bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.1]"><Menu className="h-4 w-4" /></button>
        <div className="hidden lg:flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input type="date" value={selectedDate} onChange={handleDateChange} className="bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 text-sm px-3 py-2 rounded-md outline-none" />
          <button onClick={() => setAddPanelOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 text-white text-sm font-medium ring-1 ring-indigo-400/30 hover:ring-indigo-300/50 transition">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  setAddPanelOpen: PropTypes.func.isRequired,
  setMobileMenuOpen: PropTypes.func.isRequired,
};

export default Header;