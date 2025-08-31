import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as utils from '../../../utils';
import { fetchUserData, saveUserData } from '../../../api/userData';

import PlannerHeader from './PlannerHeader';
import ViewToggle from './ViewToggle';
import TasksView from './TasksView';
import TimetableView from './TimetableView';
import TemplateEditorModal from './TemplateEditorModal';

const PlannerView = ({ userId = "123456" }) => {
  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(true); // 1. Add loading state
  const [tasks, setTasks] = useState([]);
  const [templateLibrary, setTemplateLibrary] = useState([]);
  const [scheduledTemplates, setScheduledTemplates] = useState([]);
  const [dailyNotes, setDailyNotes] = useState({});
  
  const [selectedDate, setSelectedDate] = useState(utils.todayStr());
  const [viewMode, setViewMode] = useState("tasks");
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  // --- DATA PERSISTENCE ---
  useEffect(() => {
    fetchUserData(userId).then(data => {
      if (data) {
        setTasks(data.tasks || []);
        setTemplateLibrary(data.templateLibrary || []);
        setScheduledTemplates(data.scheduledTemplates || []);
        setDailyNotes(data.dailyNotes || {});
      }
      setIsLoading(false); // 2. Set loading to false after data is fetched
    });
  }, [userId]);

  useEffect(() => {
    // 3. Prevent saving on initial load before data is ready
    if (!isLoading) {
      const dataToSave = { tasks, templateLibrary, scheduledTemplates, dailyNotes };
      saveUserData(userId, dataToSave);
    }
  }, [tasks, templateLibrary, scheduledTemplates, dailyNotes, userId, isLoading]); // Add isLoading to dependencies

  // --- NEW CORE LOGIC ---
  const getDaySchedule = useCallback((dateStr) => {
    const activeInstance = scheduledTemplates.find(inst =>
      dateStr >= inst.dateRange.start && dateStr <= inst.dateRange.end
    );
    if (!activeInstance) return [];

    const template = templateLibrary.find(t => t.id === activeInstance.templateId);
    if (!template) return [];

    const dayKey = utils.dayKeyFromDateStr(dateStr);
    const scheduleBlocks = template.schedule?.[dayKey] || [];
    const commonBlocks = template.common?.[dayKey] || [];
    
    const allBlocks = [...scheduleBlocks, ...commonBlocks].map(block => {
        const noteKey = `${dateStr}_${block.id}`;
        const specificNote = dailyNotes[noteKey]?.note || '';
        return { ...block, note: specificNote };
    });

    return utils.normalizeBlocks(allBlocks);
  }, [templateLibrary, scheduledTemplates, dailyNotes]);

  // --- HANDLERS ---
  const handleSaveTemplate = (templateToSave) => {
     setTemplateLibrary(prev => {
        const exists = prev.some(t => t.id === templateToSave.id);
        if (exists) {
            return prev.map(t => t.id === templateToSave.id ? templateToSave : t);
        }
        return [...prev, templateToSave];
     });
  };

  const handleDeleteTemplate = (templateIdToDelete) => {
    const isTemplateInUse = scheduledTemplates.some(inst => inst.templateId === templateIdToDelete);
    if (isTemplateInUse) {
      const confirmDelete = window.confirm(
        'WARNING: This template is in use. Deleting it will also remove it from your schedule. Are you sure?'
      );
      if (!confirmDelete) return;
    }
    setTemplateLibrary(prev => prev.filter(t => t.id !== templateIdToDelete));
    setScheduledTemplates(prev => prev.filter(inst => inst.templateId !== templateIdToDelete));
    alert('Template deleted.');
  };
  
  // ... (existing task handlers would go here)

  return (
    <div className="space-y-6">
      <TemplateEditorModal 
          isOpen={isTemplateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          templates={templateLibrary}
          onSave={handleSaveTemplate}
          onDelete={handleDeleteTemplate}
      />
      <PlannerHeader selectedDate={selectedDate} handleDateChange={(e) => setSelectedDate(e.target.value)} />
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === 'tasks' ? (
        <TasksView plannerTasks={[]} upcomingTasks={[]} onAddTask={() => {}} onToggleDone={() => {}} onEditTask={() => {}} />
      ) : (
        <TimetableView
          selectedDate={selectedDate}
          getDaySchedule={getDaySchedule}
          templateLibrary={templateLibrary}
          scheduledTemplates={scheduledTemplates}
          setScheduledTemplates={setScheduledTemplates}
          onOpenTemplateManager={() => setTemplateModalOpen(true)}
        />
      )}
    </div>
  );
};

PlannerView.propTypes = {
  userId: PropTypes.string,
};

export default PlannerView;

