// import React from 'react';
// import PropTypes from 'prop-types';
// import { ClockAlert } from 'lucide-react';
// import TaskItem from '../common/TaskItem.jsx';
// import * as utils from '../../utils';

// const BacklogView = ({ tasks, handleClearCompleted, onEditTask, onToggleDone }) => {
//   const overdueTasks = tasks.filter((t) => !t.done && utils.parseDate(t.date) < utils.parseDate(utils.todayStr()) && t.type !== 'reminder');

//   const TaskList = ({ items }) => {
//     if (items.length === 0) {
//       return <div className="p-3 text-xs text-slate-500">No items</div>;
//     }
//     return (
//       <div className="p-2 space-y-2">
//         {items.map(task => <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onEditTask={onEditTask} />)}
//       </div>
//     );
//   };

//   TaskList.propTypes = {
//     items: PropTypes.array.isRequired,
//   };

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl md:text-3xl tracking-tight font-semibold">Backlog</h2>
//           <p className="text-sm text-slate-400">Overdue and unfinished items.</p>
//         </div>
//         <button onClick={handleClearCompleted} className="px-3 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 text-sm">Clear completed</button>
//       </div>
//       <div className="rounded-xl border border-white/10 bg-white/[0.03]">
//         <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
//           <ClockAlert className="h-4 w-4 text-rose-300" />
//           <h3 className="text-sm font-medium">Overdue</h3>
//           <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/20">{overdueTasks.length}</span>
//         </div>
//         <TaskList items={overdueTasks} />
//       </div>
//     </>
//   );
// };

// BacklogView.propTypes = {
//   tasks: PropTypes.array.isRequired,
//   handleClearCompleted: PropTypes.func.isRequired,
//   onEditTask: PropTypes.func.isRequired,
//   onToggleDone: PropTypes.func.isRequired,
// };

// export default BacklogView;

import PropTypes from 'prop-types';
import { AlarmClockOff } from 'lucide-react'; // Changed ClockAlert to AlarmClockOff
import TaskItem from '../common/TaskItem.jsx';
import * as utils from '../../utils';

const BacklogView = ({ tasks, handleClearCompleted, onEditTask, onToggleDone }) => {
  const overdueTasks = tasks.filter((t) => !t.done && utils.parseDate(t.date) < utils.parseDate(utils.todayStr()) && t.type !== 'reminder');
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl tracking-tight font-semibold">Backlog</h2>
          <p className="text-sm text-slate-400">Overdue and unfinished items.</p>
        </div>
        <button onClick={handleClearCompleted} className="px-3 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 text-sm">Clear completed</button>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
          <AlarmClockOff className="h-4 w-4 text-rose-300" /> {/* Changed ClockAlert to AlarmClockOff */}
          <h3 className="text-sm font-medium">Overdue</h3>
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/20">{overdueTasks.length}</span>
        </div>
        <div className="p-2 space-y-2">
          {overdueTasks.length === 0 ? (
            <div className="p-3 text-xs text-slate-500">No items</div>
          ) : (
            overdueTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onEditTask={onEditTask} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

BacklogView.propTypes = {
  tasks: PropTypes.array.isRequired,
  handleClearCompleted: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
  onToggleDone: PropTypes.func.isRequired,
};

export default BacklogView;
