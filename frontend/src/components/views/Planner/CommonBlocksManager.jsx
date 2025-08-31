import { useState } from 'react';
import PropTypes from 'prop-types';
import { Sun, X } from 'lucide-react';
import * as utils from '../../../utils';

const CommonBlocksManager = ({ commonBlocks, setCommonBlocks, getCombinedDayBlocks, hasOverlap }) => {
  const [newCommonBlock, setNewCommonBlock] = useState({ id: utils.uid(), start: '', end: '', days: [], dateRange: { start: '', end: '' } });

  const handleAddCommonBlock = () => {
    if (!newCommonBlock.start || !newCommonBlock.end || newCommonBlock.days.length === 0 || !newCommonBlock.dateRange.start || !newCommonBlock.dateRange.end) {
      alert("Please fill all fields for the common block.");
      return;
    }

    if (utils.t2min(newCommonBlock.start) >= utils.t2min(newCommonBlock.end)) {
        alert("Error: Start time must be before end time.");
        return;
    }

    let isOverlap = false;
    for (let day of newCommonBlock.days) {
      let tempDate = utils.parseDate(newCommonBlock.dateRange.start);
      while (utils.toISODate(tempDate) <= newCommonBlock.dateRange.end) {
        if (utils.dayKeyFromDateStr(utils.toISODate(tempDate)) === day) {
          if (hasOverlap(newCommonBlock, getCombinedDayBlocks(utils.toISODate(tempDate)))) {
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

    setCommonBlocks(prev => [...prev, newCommonBlock].sort((a,b) => a.start.localeCompare(b.start)));
    setNewCommonBlock({ id: utils.uid(), start: '', end: '', days: [], dateRange: { start: '', end: '' } });
  };

  const handleDeleteCommonBlock = (id) => {
    setCommonBlocks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <Sun className="h-4 w-4 text-slate-300" />
        <h3 className="text-sm font-medium">Common Busy Windows</h3>
      </div>
      <div className="p-4 space-y-3">
        {/* Time inputs */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="time"
            value={newCommonBlock.start}
            onChange={(e) => setNewCommonBlock((prev) => ({ ...prev, start: e.target.value }))}
            className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"
          />
          <input
            type="time"
            value={newCommonBlock.end}
            onChange={(e) => setNewCommonBlock((prev) => ({ ...prev, end: e.target.value }))}
            className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"
          />
        </div>
        
        {/* Day selection buttons */}
        <div>
          <label className="text-xs text-slate-400">Applies to</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
              <button
                key={day}
                onClick={() =>
                  setNewCommonBlock((prev) => ({
                    ...prev,
                    days: prev.days.includes(day)
                      ? prev.days.filter((d) => d !== day)
                      : [...prev.days, day],
                  }))
                }
                className={`text-xs px-2 py-1 rounded-md ring-1 ${
                  newCommonBlock.days.includes(day)
                    ? "bg-indigo-500/20 ring-indigo-400/20 text-indigo-200"
                    : "bg-white/[0.06] ring-white/10"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Date range inputs */}
        <div>
          <label className="text-xs text-slate-400">Date Range</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <input
              type="date"
              value={newCommonBlock.dateRange.start}
              onChange={(e) => setNewCommonBlock((prev) => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
              className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"
            />
            <input
              type="date"
              value={newCommonBlock.dateRange.end}
              onChange={(e) => setNewCommonBlock((prev) => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
              className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"
            />
          </div>
        </div>

        <button onClick={handleAddCommonBlock} className="w-full px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 ring-1 ring-indigo-400/30 text-sm font-medium text-white">
          Add Common Block
        </button>
        
        {/* List of existing common blocks */}
        <div className="mt-2 space-y-2">
          {commonBlocks.length > 0 ? commonBlocks.map((block) => (
            <div key={block.id} className="p-2 rounded-lg bg-rose-500/10 ring-1 ring-rose-400/20 text-xs text-rose-200 flex items-center justify-between">
              <div>
                <span>{block.start}–{block.end}</span>
                <span className="ml-2 text-slate-400">{block.days.map(d => d.slice(0,3)).join(', ')}</span>
                <span className="ml-2 text-slate-500">{block.dateRange.start} to {block.dateRange.end}</span>
              </div>
              <button onClick={() => handleDeleteCommonBlock(block.id)} className="hover:text-rose-100"><X className="h-3 w-3" /></button>
            </div>
          )) : <div className="text-xs text-slate-500 text-center py-2">No common blocks defined.</div>}
        </div>
      </div>
    </div>
  );
};

CommonBlocksManager.propTypes = {
  /** Array of all recurring common busy blocks */
  commonBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
  
  /** Function to update the common blocks state */
  setCommonBlocks: PropTypes.func.isRequired,
  
  /** Function that merges timetable and common blocks for a given date */
  getCombinedDayBlocks: PropTypes.func.isRequired,
  
  /** Function that checks if a new block overlaps with existing ones */
  hasOverlap: PropTypes.func.isRequired,
};

export default CommonBlocksManager;