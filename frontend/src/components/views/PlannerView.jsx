import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckSquare, Sparkles, CalendarRange, ListChecks, Calendar, X, Sun } from 'lucide-react';
import TaskItem from '../common/TaskItem.jsx';
import * as utils from '../../utils';

const PlannerView = ({ tasks, selectedDate, handleDateChange, timetable, setTimetable, setTasks, onEditTask, onToggleDone, commonBlocks, setCommonBlocks, getDayBlocks }) => {
  const plannerTasks = tasks.filter((t) => utils.isSameDay(t.date, selectedDate)).sort((a,b) => a.time?.localeCompare(b.time || '') || 0);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickType, setQuickType] = useState('task');
  const [quickTime, setQuickTime] = useState('');
  const [ttScope, setTtScope] = useState('this');
  const ttWeekKey = utils.weekKeyFromDateStr(selectedDate);
  const ttData = timetable[ttWeekKey] || { mon: [], tue: [], wed: [], thu: [], fri: [] };
  const upcomingTasks = tasks.filter((t) => {
    const td = utils.parseDate(t.date);
    return td > utils.parseDate(selectedDate) && td <= utils.addDays(utils.parseDate(selectedDate), 7);
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  // Handler for combining day-specific and common blocks
  const getCombinedDayBlocks = (dateStr) => {
    const dayKey = utils.dayKeyFromDateStr(dateStr);
    const weekKey = utils.weekKeyFromDateStr(dateStr);
    const daySpecificBlocks = dayKey ? (timetable[weekKey]?.[dayKey] || []) : [];
    const commonBlocksForDay = commonBlocks.filter(b => b.days.includes(dayKey) && new Date(dateStr) >= utils.parseDate(b.dateRange.start) && new Date(dateStr) <= utils.parseDate(b.dateRange.end));
    const allBlocks = [...daySpecificBlocks, ...commonBlocksForDay.map(b => ({ start: b.start, end: b.end }))];
    return utils.normalizeBlocks(allBlocks);
  };

  const hasOverlap = (newBlock, existingBlocks) => {
    const newStart = utils.t2min(newBlock.start);
    const newEnd = utils.t2min(newBlock.end);
    return existingBlocks.some(block => {
      const existingStart = utils.t2min(block.start);
      const existingEnd = utils.t2min(block.end);
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const handleAddQuickTask = () => {
    if (!quickTitle) return;
    if (quickTime && utils.timeFallsInBlocks(quickTime, getCombinedDayBlocks(selectedDate))) {
      alert('Error: This task clashes with a busy window. Please choose another time.');
      return;
    }
    const newTask = {
      id: utils.uid(),
      title: quickTitle,
      type: quickType,
      date: selectedDate,
      time: quickTime,
      notes: '',
      createdAt: utils.todayStr(),
      done: false,
      revisable: quickType === 'coding',
      revisionStage: 0,
      links: [],
    };
    setTasks((prev) => [...prev, newTask]);
    setQuickTitle('');
    setQuickTime('');
  };

  const handleAddTimetableBlock = (day) => {
    const startInput = document.getElementById(`tt-${day}-start`);
    const endInput = document.getElementById(`tt-${day}-end`);
    const newBlock = { start: startInput.value, end: endInput.value };
    if (!newBlock.start || !newBlock.end || utils.t2min(newBlock.start) >= utils.t2min(newBlock.end)) return;

    const existingBlocks = getCombinedDayBlocks(selectedDate);
    if (hasOverlap(newBlock, existingBlocks)) {
      alert('Error: This schedule clashes with an existing busy window.');
      return;
    }

    setTimetable((prev) => {
      const newTt = { ...prev };
      newTt[ttWeekKey] = newTt[ttWeekKey] || { mon: [], tue: [], wed: [], thu: [], fri: [] };
      const blocks = [...newTt[ttWeekKey][day], newBlock];
      newTt[ttWeekKey][day] = utils.normalizeBlocks(blocks);
      return newTt;
    });
    startInput.value = '';
    endInput.value = '';
  };

  const handleDeleteTimetableBlock = (day, index) => {
    setTimetable((prev) => {
      const newTt = { ...prev };
      const blocks = [...newTt[ttWeekKey][day]];
      blocks.splice(index, 1);
      newTt[ttWeekKey][day] = blocks;
      return newTt;
    });
  };

  const [newCommonBlock, setNewCommonBlock] = useState({ id: utils.uid(), start: '', end: '', days: [], dateRange: { start: '', end: '' } });

  const handleAddCommonBlock = () => {
    if (!newCommonBlock.start || !newCommonBlock.end || newCommonBlock.days.length === 0 || !newCommonBlock.dateRange.start || !newCommonBlock.dateRange.end) return;
    
    let isOverlap = false;
    for (let day of newCommonBlock.days) {
      let tempDate = utils.parseDate(newCommonBlock.dateRange.start);
      while (utils.toISODate(tempDate) <= newCommonBlock.dateRange.end) {
        if (utils.dayKeyFromDateStr(utils.toISODate(tempDate)) === day) {
          const dayBlocks = getCombinedDayBlocks(utils.toISODate(tempDate));
          if (hasOverlap(newCommonBlock, dayBlocks)) {
            isOverlap = true;
            break;
          }
        }
        tempDate = utils.addDays(tempDate, 1);
      }
      if (isOverlap) break;
    }
    
    if (isOverlap) {
      alert("Error: This common block clashes with an existing busy window.");
      return;
    }

    setCommonBlocks(prev => [...prev, newCommonBlock]);
    setNewCommonBlock({ id: utils.uid(), start: '', end: '', days: [], dateRange: { start: '', end: '' } });
  };

  const handleDeleteCommonBlock = (id) => {
    setCommonBlocks(prev => prev.filter(b => b.id !== id));
  };

  const CommonBlockItem = ({ block }) => {
    return (
        <div className="p-2 rounded-lg bg-rose-500/10 ring-1 ring-rose-400/20 text-xs text-rose-200 flex items-center justify-between">
            <div>
                <span>{block.start}–{block.end}</span>
                <span className="ml-2 text-slate-400">{block.days.map(d => d.slice(0, 3)).join(', ')}</span>
                <span className="ml-2 text-slate-500">{block.dateRange.start} to {block.dateRange.end}</span>
            </div>
            <button onClick={() => handleDeleteCommonBlock(block.id)}><X className="h-3 w-3" /></button>
        </div>
    );
  };

  const TaskList = ({ items }) => {
    if (items.length === 0) {
      return <div className="p-3 text-xs text-slate-500">No items</div>;
    }
    return (
      <div className="p-2 space-y-2">
        {items.map(task => <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onEditTask={onEditTask} />)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl tracking-tight font-semibold">Planner</h2>
          <p className="text-sm text-slate-400">Choose a date to plan and review tasks.</p>
        </div>
        <input type="date" value={selectedDate} onChange={handleDateChange} className="bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 text-sm px-3 py-2 rounded-md outline-none" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <CheckSquare className="h-4 w-4 text-slate-300" />
            <h3 className="text-sm font-medium">Tasks for selected date</h3>
          </div>
          <TaskList items={plannerTasks} />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <Sparkles className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">Quick add</h3>
            </div>
            <div className="p-4 space-y-3">
              <input value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder="Title" className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={quickType} onChange={(e) => setQuickType(e.target.value)} className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none">
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="coding">Coding</option>
                </select>
                <input type="time" value={quickTime} onChange={(e) => setQuickTime(e.target.value)} className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
              </div>
              <button onClick={handleAddQuickTask} className="w-full px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 ring-1 ring-indigo-400/30 hover:ring-indigo-300/50 text-sm font-medium text-white">Add</button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <CalendarRange className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">Time table (Mon–Fri)</h3>
              <div className="ml-auto flex items-center gap-2">
                <select value={ttScope} onChange={(e) => setTtScope(e.target.value)} className="bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 text-xs px-2 py-1 rounded-md outline-none">
                  <option value="this">This week</option>
                  <option value="next">Next week</option>
                </select>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-slate-400">Add your class time blocks. Tasks can only be scheduled outside these blocks.</p>
              <div className="space-y-3">
                {utils.dayKeys.map((day) => (
                  <div key={day} className="p-2 rounded-lg bg-white/[0.03] ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 capitalize">{day}</span>
                      <div className="flex items-center gap-2">
                        <input id={`tt-${day}-start`} type="time" className="bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                        <span className="text-xs text-slate-500">–</span>
                        <input id={`tt-${day}-end`} type="time" className="bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                        <button onClick={() => handleAddTimetableBlock(day)} className="text-xs px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10">Add</button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ttData[day].length > 0 ? ttData[day].map((block, index) => (
                        <span key={index} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-white/[0.06] ring-1 ring-white/10">
                          <Calendar className="h-3 w-3" />
                          <span>{block.start}–{block.end}</span>
                          <button onClick={() => handleDeleteTimetableBlock(day, index)} className="hover:text-slate-200 text-slate-400"><X className="h-3 w-3" /></button>
                        </span>
                      )) : <span className="text-[11px] text-slate-500">No blocks</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[11px] text-slate-500">This applies only to the selected week. Switch to “Next week” to set a different timetable.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <Sun className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">Common busy windows</h3>
            </div>
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <input type="time" value={newCommonBlock.start} onChange={(e) => setNewCommonBlock(prev => ({...prev, start: e.target.value}))} className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                    <input type="time" value={newCommonBlock.end} onChange={(e) => setNewCommonBlock(prev => ({...prev, end: e.target.value}))} className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Applies to</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                            <button key={day} onClick={() => setNewCommonBlock(prev => ({...prev, days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day] }))}
                                className={`text-xs px-2 py-1 rounded-md ring-1 ${newCommonBlock.days.includes(day) ? 'bg-indigo-500/20 ring-indigo-400/20' : 'bg-white/[0.06] ring-white/10'}`}>
                                {day.slice(0,3)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Date Range</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <input type="date" value={newCommonBlock.dateRange.start} onChange={(e) => setNewCommonBlock(prev => ({...prev, dateRange: {...prev.dateRange, start: e.target.value}}))} className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                        <input type="date" value={newCommonBlock.dateRange.end} onChange={(e) => setNewCommonBlock(prev => ({...prev, dateRange: {...prev.dateRange, end: e.target.value}}))} className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                    </div>
                </div>
                <button onClick={handleAddCommonBlock} className="w-full px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 ring-1 ring-indigo-400/30 hover:ring-indigo-300/50 text-sm font-medium text-white">Add common block</button>
                <div className="mt-2 space-y-2">
                    {commonBlocks.map(block => <CommonBlockItem key={block.id} block={block} />)}
                </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <ListChecks className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">Upcoming (next 7 days)</h3>
            </div>
            <TaskList items={upcomingTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

PlannerView.propTypes = {
  tasks: PropTypes.array.isRequired,
  selectedDate: PropTypes.string.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  timetable: PropTypes.object.isRequired,
  setTimetable: PropTypes.func.isRequired,
  setTasks: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
  onToggleDone: PropTypes.func.isRequired,
  commonBlocks: PropTypes.array.isRequired,
  setCommonBlocks: PropTypes.func.isRequired,
  getDayBlocks: PropTypes.func.isRequired,
};

export default PlannerView;
