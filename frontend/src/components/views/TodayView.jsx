import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js/auto';
import { ChevronLeft, ChevronRight, CalendarClock, Code2, Bell, Calendar, Activity, Ban, Clock, Star } from 'lucide-react';
import TaskItem from '../common/TaskItem.jsx';
import * as utils from '../../utils';

const TodayView = ({ tasks, selectedDate, timetable, onEditTask, onToggleDone, setSelectedDate, freeWindowRatings, handleRateWindow, getDayBlocks }) => {
  const miniChartRef = useRef(null);
  const miniChartInstance = useRef(null);

  const todayTasks = tasks.filter((t) => utils.isSameDay(t.date, selectedDate));
  const scheduleTasks = todayTasks.filter((t) => t.type === 'task').sort((a, b) => a.time?.localeCompare(b.time || '') || 0);
  const codingTasks = todayTasks.filter((t) => t.type === 'coding').sort((a, b) => a.time?.localeCompare(b.time || '') || 0);
  const reminders = todayTasks.filter((t) => t.type === 'reminder').sort((a, b) => a.time?.localeCompare(b.time || '') || 0);
  
  const dayBlocks = getDayBlocks(selectedDate);
  const currentTime = new Date().toTimeString().slice(0,5);

  const currentFreeWindows = utils.freeWindows(dayBlocks).filter(w => {
      const [wHour, wMin] = w.end.split(':').map(Number);
      const windowEnd = new Date().setHours(wHour, wMin, 0);
      return windowEnd > new Date().getTime();
  });

  const reviewedFreeWindows = (freeWindowRatings[selectedDate] || []).filter(w => {
      const [wHour, wMin] = w.end.split(':').map(Number);
      const windowEnd = new Date().setHours(wHour, wMin, 0);
      return windowEnd <= new Date().getTime();
  });

  const getCompletedData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = utils.toISODate(utils.addDays(utils.parseDate(utils.todayStr()), -i));
      data.push(tasks.filter((t) => utils.isSameDay(t.date, d) && t.done).length);
    }
    return data;
  };

  useEffect(() => {
    const labels = Array.from({ length: 7 }, (_, i) => utils.toISODate(utils.addDays(utils.parseDate(utils.todayStr()), i - 6))).map((d) => new Date(d).toLocaleDateString([], { weekday: 'short' }));
    const data = getCompletedData();

    if (miniChartInstance.current) {
      miniChartInstance.current.data.labels = labels;
      miniChartInstance.current.data.datasets[0].data = data;
      miniChartInstance.current.update();
    } else {
      miniChartInstance.current = new Chart(miniChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{ data, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.2)', tension: 0.3, fill: true, pointRadius: 2 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }, y: { ticks: { display: false }, grid: { color: 'rgba(148,163,184,0.06)' } } } },
      });
    }
  }, [tasks, selectedDate]);

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

  const FreeWindowItem = ({ window, isReviewed, onRate }) => {
    const [rating, setRating] = useState(window.rating || 0);
    const windowStartInMinutes = utils.t2min(window.start);
    const windowEndInMinutes = utils.t2min(window.end);
    const currentTimeInMinutes = utils.t2min(utils.min2t(new Date().getHours() * 60 + new Date().getMinutes()));

    let color = '';
    if (isReviewed) {
        if (rating >= 4) color = 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/20';
        else if (rating >= 2) color = 'bg-amber-500/10 text-amber-200 ring-amber-400/20';
        else color = 'bg-rose-500/10 text-rose-200 ring-rose-400/20';
    } else {
        color = 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/20';
    }

    return (
        <div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md ring-1 ${color}`}>
            <Clock className="h-3 w-3" />
            <span>{window.start}–{window.end}</span>
            {isReviewed && (
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                            key={star} 
                            className={`h-3 w-3 cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400 fill-current' : 'text-slate-500'}`}
                            onClick={() => { setRating(star); onRate(selectedDate, window.start, window.end, star); }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl md:text-3xl tracking-tight font-semibold">Today</h2><p className="text-sm text-slate-400">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p></div>
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => setSelectedDate(utils.toISODate(utils.addDays(utils.parseDate(selectedDate), -1)))} className="p-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setSelectedDate(utils.todayStr())} className="px-3 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 text-sm">Today</button>
          <button onClick={() => setSelectedDate(utils.toISODate(utils.addDays(utils.parseDate(selectedDate), 1)))} className="p-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03]"><div className="px-4 py-3 flex items-center gap-2 border-b border-white/5"><CalendarClock className="h-4 w-4 text-slate-300" /><h3 className="text-sm font-medium">Schedule</h3><span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 ring-1 ring-white/10">{scheduleTasks.length}</span></div><TaskList items={scheduleTasks} /></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03]"><div className="px-4 py-3 flex items-center gap-2 border-b border-white/5"><Code2 className="h-4 w-4 text-slate-300" /><h3 className="text-sm font-medium">Coding</h3><span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 ring-1 ring-white/10">{codingTasks.length}</span></div><TaskList items={codingTasks} /></div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03]"><div className="px-4 py-3 flex items-center gap-2 border-b border-white/5"><Bell className="h-4 w-4 text-slate-300" /><h3 className="text-sm font-medium">Reminders</h3><span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 ring-1 ring-white/10">{reminders.length}</span></div><TaskList items={reminders} /></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03]"><div className="px-4 py-3 flex items-center gap-2 border-b border-white/5"><Calendar className="h-4 w-4 text-slate-300" /><h3 className="text-sm font-medium">Today's timetable</h3></div>
            <div className="p-4 space-y-3">
              <div><p className="text-xs text-slate-400">Class blocks</p><div className="mt-1 flex flex-wrap gap-2">{dayBlocks.length > 0 ? (dayBlocks.map((b, i) => (<span key={i} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-200 ring-1 ring-rose-400/20"><Ban className="h-3 w-3" /><span>{b.start}–{b.end}</span></span>))) : (<span className="text-[11px] text-slate-500">No class blocks</span>)}</div></div>
              <div className="border-t border-white/5 pt-3"><p className="text-xs text-slate-400">Free windows</p><div className="mt-1 flex flex-wrap gap-2">{currentFreeWindows.length > 0 ? (currentFreeWindows.map((w, i) => (<FreeWindowItem key={i} window={w} isReviewed={false} />))) : (<span className="text-[11px] text-slate-500">All day</span>)}</div></div>
              <div className="border-t border-white/5 pt-3"><p className="text-xs text-slate-400">Reviewed free windows</p><div className="mt-1 flex flex-wrap gap-2">{reviewedFreeWindows.length > 0 ? (reviewedFreeWindows.map((w, i) => (<FreeWindowItem key={i} window={w} isReviewed={true} onRate={handleRateWindow} />))) : (<span className="text-[11px] text-slate-500">No reviewed windows</span>)}</div></div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03]"><div className="px-4 py-3 flex items-center gap-2 border-b border-white/5"><Activity className="h-4 w-4 text-slate-300" /><h3 className="text-sm font-medium">This week</h3></div>
            <div className="p-4"><div className="relative h-32"><canvas ref={miniChartRef} id="miniChart"></canvas></div><p className="mt-2 text-xs text-slate-400">Completed tasks over last 7 days</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

TodayView.propTypes = {
  tasks: PropTypes.array.isRequired,
  selectedDate: PropTypes.string.isRequired,
  timetable: PropTypes.object.isRequired,
  onEditTask: PropTypes.func.isRequired,
  onToggleDone: PropTypes.func.isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  freeWindowRatings: PropTypes.object.isRequired,
  handleRateWindow: PropTypes.func.isRequired,
  getDayBlocks: PropTypes.func.isRequired,
};

export default TodayView;
