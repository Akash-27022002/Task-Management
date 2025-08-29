import React from 'react';
import PropTypes from 'prop-types';
import { CalendarDays, CalendarRange, Repeat, Inbox, Target, Search, Download } from 'lucide-react';
import * as utils from '../utils';

const Sidebar = ({ tasks, selectedDate, activeTab, setActiveTab, search, setSearch, timetable, isMobileMenuOpen, setMobileMenuOpen }) => {
  const todayTasks = tasks.filter((t) => utils.isSameDay(t.date, selectedDate) && !t.done && t.type !== 'reminder');
  const revisables = tasks.filter((t) => t.revisable && t.revisionStage < 3);
  const backlogTasks = tasks.filter((t) => !t.done && utils.parseDate(t.date) < utils.parseDate(utils.todayStr()) && t.type !== 'reminder');
  const completedToday = tasks.filter((t) => utils.isSameDay(t.date, selectedDate) && t.done);
  const totalToday = tasks.filter((t) => utils.isSameDay(t.date, selectedDate) && t.type !== 'reminder').length;
  const focusPct = totalToday ? Math.round((completedToday.length / totalToday) * 100) : 0;

  const handleExport = () => {
    const payload = { tasks, timetable };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-manager-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 lg:w-auto z-40 bg-[#0b0d12]/80 backdrop-blur border-r border-white/5 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="h-8 w-8 rounded-md bg-white/[0.06] flex items-center justify-center ring-1 ring-white/10">
          <span className="text-slate-100 tracking-tight text-sm font-semibold">TM</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg tracking-tight font-semibold text-slate-100">Task Manager</h1>
          <p className="text-[11px] text-slate-400">Plan • Code • Review</p>
        </div>
      </div>
      <div className="px-3">
        <div className="p-2 rounded-lg bg-white/[0.04] ring-1 ring-white/10">
          <button onClick={() => { setActiveTab('today'); setMobileMenuOpen(false); }} className={`nav-link ${activeTab === 'today' ? 'active' : ''}`}>
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-medium">Today</span>
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/20">{todayTasks.length}</span>
          </button>
          <button onClick={() => { setActiveTab('planner'); setMobileMenuOpen(false); }} className={`nav-link mt-1 ${activeTab === 'planner' ? 'active' : ''}`}>
            <CalendarRange className="h-4 w-4" />
            <span className="text-sm font-medium">Planner</span>
          </button>
          <button onClick={() => { setActiveTab('revisions'); setMobileMenuOpen(false); }} className={`nav-link mt-1 ${activeTab === 'revisions' ? 'active' : ''}`}>
            <Repeat className="h-4 w-4" />
            <span className="text-sm font-medium">Revisions</span>
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/20">{revisables.length}</span>
          </button>
          <button onClick={() => { setActiveTab('backlog'); setMobileMenuOpen(false); }} className={`nav-link mt-1 ${activeTab === 'backlog' ? 'active' : ''}`}>
            <Inbox className="h-4 w-4" />
            <span className="text-sm font-medium">Backlog</span>
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/20">{backlogTasks.length}</span>
          </button>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-white/[0.03] ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-300" />
            <p className="text-xs text-slate-400">Focus metric</p>
          </div>
          <div className="mt-2">
            <div className="w-full bg-white/[0.06] rounded-full h-2">
              <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${focusPct}%` }}></div>
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>{focusPct}%</span>
              <span>{completedToday.length}/{totalToday} done</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-white/[0.03] ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-300" />
            <input
              placeholder="Search tasks…"
              className="bg-transparent w-full text-sm outline-none placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 px-2">
          <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-md bg-white/[0.06] hover:bg-white/[0.08] ring-1 ring-white/10 hover:ring-white/20 transition">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>
      <div className="mt-6 px-4 pb-4 text-[11px] text-slate-500">
        <p>All data stored locally in your browser.</p>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  tasks: PropTypes.array.isRequired,
  selectedDate: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  timetable: PropTypes.object.isRequired,
  isMobileMenuOpen: PropTypes.bool.isRequired,
  setMobileMenuOpen: PropTypes.func.isRequired,
};

export default Sidebar;
