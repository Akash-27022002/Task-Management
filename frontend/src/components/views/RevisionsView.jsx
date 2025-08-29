import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js/auto';
import { AlertTriangle, Clock, ListChecks, Info } from 'lucide-react';
import TaskItem from '../common/TaskItem.jsx';
import * as utils from '../../utils';

const RevisionsView = ({ tasks, onReview, onEditTask }) => {
  const revChartRef = useRef(null);
  const revChartInstance = useRef(null);
  const now = utils.parseDate(utils.todayStr());

  const revisables = tasks.filter((t) => t.revisable && t.revisionStage < 3);
  const due = revisables.filter((t) => {
    const nextRevDate = utils.getNextRevisionDate(t);
    return nextRevDate && nextRevDate <= now;
  });
  const upcoming = revisables.filter((t) => {
    const nextRevDate = utils.getNextRevisionDate(t);
    return nextRevDate && nextRevDate > now;
  });

  const revCounts = [7, 30, 90].map(span => revisables.filter(t => {
    const nextRevDate = utils.getNextRevisionDate(t);
    return nextRevDate && nextRevDate <= utils.addDays(now, span);
  }).length);

  useEffect(() => {
    if (revChartInstance.current) {
      revChartInstance.current.data.datasets[0].data = revCounts;
      revChartInstance.current.update();
    } else {
      revChartInstance.current = new Chart(revChartRef.current, {
        type: 'bar',
        data: { labels: ['7d', '30d', '90d'], datasets: [{ data: revCounts, backgroundColor: '#22d3ee' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.06)' } } } },
      });
    }
  }, [tasks]);

  const RevItem = ({ task, onReview }) => {
    const nextRevDate = utils.getNextRevisionDate(task);
    const label = nextRevDate ? nextRevDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
    return (
      <div className="task-item-bg">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate">{task.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 ring-1 ring-white/10">Stage {task.revisionStage + 1}</span>
            <span className="text-xs text-slate-400">Due: {label}</span>
          </div>
        </div>
        <button onClick={() => onReview(task.id)} className="rev-button">Review</button>
      </div>
    );
  };

  RevItem.propTypes = {
    task: PropTypes.object.isRequired,
    onReview: PropTypes.func.isRequired,
  };

  const RevList = ({ items }) => {
    if (items.length === 0) return <div className="p-3 text-xs text-slate-500">No items</div>;
    return (
      <div className="p-2 space-y-2">
        {items.map(task => <RevItem key={task.id} task={task} onReview={onReview} />)}
      </div>
    );
  };

  RevList.propTypes = {
    items: PropTypes.array.isRequired,
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl tracking-tight font-semibold">Revisions</h2>
          <p className="text-sm text-slate-400">Review at 1 week, 1 month, and 3 months after adding.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h3 className="text-sm font-medium">Due or overdue</h3>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/20">{due.length}</span>
            </div>
            <RevList items={due} />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <Clock className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">Upcoming</h3>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 ring-1 ring-white/10">{upcoming.length}</span>
            </div>
            <RevList items={upcoming} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <ListChecks className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">Revision cadence</h3>
            </div>
            <div className="p-4">
              <div className="relative h-40">
                <canvas ref={revChartRef} id="revChart"></canvas>
              </div>
              <p className="mt-2 text-xs text-slate-400">Counts due at 7d / 30d / 90d</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <Info className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-medium">How it works</h3>
            </div>
            <div className="p-4 text-sm text-slate-400 space-y-2">
              <p>Each revisable item schedules at +7d, +30d, +90d from the created date. Mark “Review” to progress to the next stage.</p>
              <p>Coding tasks are revisable by default. You can toggle revision when adding.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

RevisionsView.propTypes = {
  tasks: PropTypes.array.isRequired,
  onReview: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
};

export default RevisionsView;