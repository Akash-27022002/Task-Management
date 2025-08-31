// src/components/Planner/QuickAddTask.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';

const QuickAddTask = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [time, setTime] = useState('');

  const handleAddClick = () => {
    if (!title) return;
    onAddTask({ title, type, time });
    setTitle('');
    setTime('');
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <Sparkles className="h-4 w-4 text-slate-300" />
        <h3 className="text-sm font-medium">Quick add</h3>
      </div>
      <div className="p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none"
          >
            <option value="task">Task</option>
            <option value="reminder">Reminder</option>
            <option value="coding">Coding</option>
          </select>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="w-full px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 text-sm font-medium text-white"
        >
          Add
        </button>
      </div>
    </div>
  );
};

QuickAddTask.propTypes = {
  onAddTask: PropTypes.func.isRequired,
};

export default QuickAddTask;