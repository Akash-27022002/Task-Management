// src/components/Planner/TasksView.jsx

import PropTypes from 'prop-types';
import { CheckSquare, ListChecks } from 'lucide-react';
import TaskItem from '../../common/TaskItem.jsx'; // Adjust path as needed
import QuickAddTask from './QuickAddTask';

const TaskList = ({ items, onToggleDone, onEditTask }) => {
  if (items.length === 0) {
    return <div className="p-3 text-xs text-slate-500">No items</div>;
  }
  return (
    <div className="p-2 space-y-2">
      {items.map(task => <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onEditTask={onEditTask} />)}
    </div>
  );
};

const TasksView = ({ plannerTasks, upcomingTasks, onAddTask, onToggleDone, onEditTask }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <CheckSquare className="h-4 w-4 text-slate-300" />
        <h3 className="text-sm font-medium">Tasks for selected date</h3>
      </div>
      <TaskList items={plannerTasks} onToggleDone={onToggleDone} onEditTask={onEditTask} />
    </div>

    <div className="space-y-4">
      <QuickAddTask onAddTask={onAddTask} />
      <div className="rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
          <ListChecks className="h-4 w-4 text-slate-300" />
          <h3 className="text-sm font-medium">Upcoming (next 7 days)</h3>
        </div>
        <TaskList items={upcomingTasks} onToggleDone={onToggleDone} onEditTask={onEditTask} />
      </div>
    </div>
  </div>
);

export default TasksView;