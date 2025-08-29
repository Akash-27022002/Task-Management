import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import TodayView from './components/views/TodayView.jsx';
import PlannerView from './components/views/PlannerView.jsx';
import RevisionsView from './components/views/RevisionsView.jsx';
import BacklogView from './components/views/BacklogView.jsx';
import AddPanel from './components/AddPanel.jsx';
import EditModal from './components/EditModal.jsx';
import * as utils from './utils/index.js';
import './index.css';

const App = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm.tasks.v1')) || [];
    } catch {
      return [];
    }
  });

  const [timetable, setTimetable] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm.timetable.v1')) || {};
    } catch {
      return {};
    }
  });

  const [commonBlocks, setCommonBlocks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm.commonBlocks.v1')) || [];
    } catch {
      return [];
    }
  });
  
  const [freeWindowRatings, setFreeWindowRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm.freeWindowRatings.v1')) || {};
    } catch {
      return {};
    }
  });

  const [selectedDate, setSelectedDate] = useState(utils.todayStr());
  const [activeTab, setActiveTab] = useState('today');
  const [isAddPanelOpen, setAddPanelOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('tm.tasks.v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tm.timetable.v1', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('tm.commonBlocks.v1', JSON.stringify(commonBlocks));
  }, [commonBlocks]);

  useEffect(() => {
    localStorage.setItem('tm.freeWindowRatings.v1', JSON.stringify(freeWindowRatings));
  }, [freeWindowRatings]);

  // Filtering based on search query
  const filteredTasks = tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  // Handlers for state updates
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value || utils.todayStr());
  };

  const handleToggleDone = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleReviewTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, revisionStage: t.revisionStage + 1 } : t)));
  };

  const handleClearCompletedBacklog = () => {
    setTasks((prev) => prev.filter((t) => !t.done));
  };

  const handleSaveEdit = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditingTask(null);
  };

  const handleRateWindow = (date, start, end, rating) => {
    const ratingsForDate = freeWindowRatings[date] || [];
    setFreeWindowRatings(prev => ({
      ...prev,
      [date]: [...ratingsForDate.filter(r => r.start !== start || r.end !== end), { start, end, rating }]
    }));
  };

  const getDayBlocks = (dateStr) => {
    const dayKey = utils.dayKeyFromDateStr(dateStr);
    const weekKey = utils.weekKeyFromDateStr(dateStr);
    const daySpecificBlocks = dayKey ? (timetable[weekKey]?.[dayKey] || []) : [];
    const commonBlocksForDay = commonBlocks.filter(b => b.days.includes(dayKey) && new Date(dateStr) >= utils.parseDate(b.dateRange.start) && new Date(dateStr) <= utils.parseDate(b.dateRange.end));
    const allBlocks = [...daySpecificBlocks, ...commonBlocksForDay.map(b => ({ start: b.start, end: b.end }))];
    return utils.normalizeBlocks(allBlocks);
  };

  return (
    <div className="bg-[#0b0d12] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-100 font-sans min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      {isMobileMenuOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
      <Sidebar
        tasks={tasks}
        selectedDate={selectedDate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        timetable={timetable}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="min-h-screen">
        <Header
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          setAddPanelOpen={setAddPanelOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {isAddPanelOpen && (
            <AddPanel
              onClose={() => setAddPanelOpen(false)}
              onSave={setTasks}
              selectedDate={selectedDate}
              timetable={timetable}
              commonBlocks={commonBlocks}
              getDayBlocks={getDayBlocks}
            />
          )}
          {activeTab === 'today' && <TodayView tasks={filteredTasks} selectedDate={selectedDate} timetable={timetable} onEditTask={setEditingTask} onToggleDone={handleToggleDone} setSelectedDate={setSelectedDate} freeWindowRatings={freeWindowRatings} handleRateWindow={handleRateWindow} getDayBlocks={getDayBlocks} />}
          {activeTab === 'planner' && <PlannerView tasks={filteredTasks} selectedDate={selectedDate} handleDateChange={handleDateChange} timetable={timetable} setTimetable={setTimetable} setTasks={setTasks} onEditTask={setEditingTask} onToggleDone={handleToggleDone} commonBlocks={commonBlocks} setCommonBlocks={setCommonBlocks} getDayBlocks={getDayBlocks} />}
          {activeTab === 'revisions' && <RevisionsView tasks={filteredTasks} onReview={handleReviewTask} onEditTask={setEditingTask} />}
          {activeTab === 'backlog' && <BacklogView tasks={filteredTasks} handleClearCompleted={handleClearCompletedBacklog} onEditTask={setEditingTask} onToggleDone={handleToggleDone} />}
        </section>
      </main>
      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteTask}
          timetable={timetable}
          commonBlocks={commonBlocks}
          getDayBlocks={getDayBlocks}
        />
      )}
    </div>
  );
};

export default App;
