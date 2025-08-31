// src/components/Planner/PlannerView.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';
import * as utils from '../../../utils';

import PlannerHeader from './PlannerHeader';
import ViewToggle from './ViewToggle';
import TasksView from './TasksView';
import TimetableView from './TimetableView';

const PlannerView = ({ tasks, selectedDate, handleDateChange, timetable, setTimetable, setTasks, onEditTask, onToggleDone, commonBlocks, setCommonBlocks }) => {
  const [viewMode, setViewMode] = useState("tasks");

  // --- DATA DERIVATION ---
  const plannerTasks = tasks
    .filter((t) => utils.isSameDay(t.date, selectedDate))
    .sort((a, b) => a.time?.localeCompare(b.time || '') || 0);

  const upcomingTasks = tasks
    .filter((t) => {
      const td = utils.parseDate(t.date);
      return td > utils.parseDate(selectedDate) && td <= utils.addDays(utils.parseDate(selectedDate), 7);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  // --- CORE LOGIC & HANDLERS ---
  const getCombinedDayBlocks = (dateStr) => {
    console.log("Getting combined blocks for date:", dateStr);
    const dayKey = utils.dayKeyFromDateStr(dateStr);
    const weekKey = utils.weekKeyFromDateStr(dateStr);
    const daySpecificBlocks = dayKey ? (timetable[weekKey]?.[dayKey] || []) : [];
    console.log("Day Specific Blocks:", daySpecificBlocks,timetable[weekKey], dayKey,weekKey); 
     const commonBlocksForDay = commonBlocks.filter(b => b.days.includes(dayKey) && new Date(dateStr) >= utils.parseDate(b.dateRange.start) && new Date(dateStr) <= utils.parseDate(b.dateRange.end));
      // console.log("Common Blocks for Day:", commonBlocksForDay);
     const allBlocks = [...daySpecificBlocks, ...commonBlocksForDay.map(b => ({ start: b.start, end: b.end, label: b.label }))];
    // console.log("All Blocks:", allBlocks);
    return utils.normalizeBlocks(allBlocks);
  };

  const handleAddTask = (newTaskData) => {
    if (newTaskData.time && utils.timeFallsInBlocks(newTaskData.time, getCombinedDayBlocks(selectedDate))) {
      alert('Error: This task clashes with a busy window. Please choose another time.');
      return;
    }
    const newTask = {
      id: utils.uid(),
      ...newTaskData,
      date: selectedDate,
      notes: '',
      createdAt: utils.todayStr(),
      done: false,
      revisable: newTaskData.type === 'coding',
      revisionStage: 0,
      links: [],
    };
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div className="space-y-6">
      <PlannerHeader selectedDate={selectedDate} handleDateChange={handleDateChange} />
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === 'tasks' ? (
        <TasksView
          plannerTasks={plannerTasks}
          upcomingTasks={upcomingTasks}
          onAddTask={handleAddTask}
          onToggleDone={onToggleDone}
          onEditTask={onEditTask}
        />
      ) : (
        <TimetableView
          selectedDate={selectedDate}
          timetable={timetable}
          setTimetable={setTimetable}
          commonBlocks={commonBlocks}
          setCommonBlocks={setCommonBlocks}
          getCombinedDayBlocks={getCombinedDayBlocks}
        />
      )}
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