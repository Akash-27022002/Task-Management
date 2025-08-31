// src/components/Planner/TimetableEditor.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarRange, Calendar, X } from 'lucide-react';
import * as utils from '../../../utils';

const TimetableEditor = ({ ttData, ttWeekKey, setTimetable, hasOverlap }) => {
  const [ttScope, setTtScope] = useState('this'); // This state is local to the editor now

  const handleAddBlock = (day) => {
    const startInput = document.getElementById(`tt-${day}-start`);
    const endInput = document.getElementById(`tt-${day}-end`);
    const newBlock = { start: startInput.value, end: endInput.value };

    if (!newBlock.start || !newBlock.end) return;
    if (utils.t2min(newBlock.start) >= utils.t2min(newBlock.end)) {
      alert("Error: Start time must be before end time.");
      return;
    }

    const existingBlocks = ttData[day] || [];
    if (hasOverlap(newBlock, existingBlocks)) {
      alert('Error: This schedule clashes with an existing busy window.');
      return;
    }

    setTimetable((prev) => {
      const newTt = { ...prev };
      newTt[ttWeekKey] = newTt[ttWeekKey] || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
      newTt[ttWeekKey][day] = [...(newTt[ttWeekKey][day] || []), newBlock].sort((a,b) => a.start.localeCompare(b.start));
      return newTt;
    });

    startInput.value = '';
    endInput.value = '';
  };

  const handleDeleteBlock = (day, index) => {
    setTimetable((prev) => {
      const newTt = { ...prev };
      const blocks = [...newTt[ttWeekKey][day]];
      blocks.splice(index, 1);
      newTt[ttWeekKey][day] = blocks;
      return newTt;
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <CalendarRange className="h-4 w-4 text-slate-300" />
        <h3 className="text-sm font-medium">Time table (Week-specific)</h3>
      </div>
      <div className="p-4 space-y-3">
        {utils.dayKeys.map((day) => (
          <div key={day} className="p-2 rounded-lg bg-white/[0.03] ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 capitalize">{day}</span>
              <div className="flex items-center gap-2">
                <input id={`tt-${day}-start`} type="time" className="bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                <span className="text-xs text-slate-500">–</span>
                <input id={`tt-${day}-end`} type="time" className="bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none" />
                <button onClick={() => handleAddBlock(day)} className="text-xs px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10">Add</button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(ttData[day] || []).length > 0 ? (
                ttData[day].map((block, index) => (
                  <span key={index} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-white/[0.06] ring-1 ring-white/10">
                    <Calendar className="h-3 w-3" />
                    <span>{block.start}–{block.end}</span>
                    <button onClick={() => handleDeleteBlock(day, index)} className="hover:text-slate-200 text-slate-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500">No blocks for this week</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add PropTypes here

export default TimetableEditor;