import React from 'react';
import PropTypes from 'prop-types';
import { NotebookPen } from 'lucide-react';

const TaskItem = ({ task, onToggleDone, onEditTask }) => {
  const chipClass = `task-chip-common ${task.type === 'coding' ? 'task-chip-coding' : task.type === 'reminder' ? 'task-chip-reminder' : 'task-chip-task'}`;

  return (
    <div className="group task-item-bg">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggleDone(task.id)}
        className="h-4 w-4 rounded bg-white/10 border-white/20 accent-indigo-500"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate ${task.done ? 'line-through text-slate-500' : ''}`}>
            {task.title}
          </span>
          <span className={chipClass}>{task.type}</span>
          {task.time && <span className="text-xs text-slate-400">{task.time}</span>}
        </div>
        {task.notes && <p className="text-[11px] text-slate-500 truncate">{task.notes}</p>}
      </div>
      <button
        onClick={() => onEditTask(task)}
        className="opacity-0 group-hover:opacity-100 transition p-2 rounded hover:bg-white/[0.06]"
      >
        <NotebookPen className="h-4 w-4" />
      </button>
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.object.isRequired,
  onToggleDone: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
};

export default TaskItem;