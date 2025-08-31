import { useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarPlus, CalendarClock, Trash, Edit, Save, XCircle } from 'lucide-react';

const ScheduleManager = ({ templateLibrary, scheduledTemplates, setScheduledTemplates, onOpenTemplateManager }) => {
  // State for the "Apply Template" form
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [applyDateRange, setApplyDateRange] = useState({ start: '', end: '' });

  // State for inline editing of an existing schedule
  const [editingInstance, setEditingInstance] = useState(null);

  const publishedTemplates = templateLibrary.filter(t => t.status === 'published');

  const handleApplySchedule = () => {
    if (!selectedTemplateId || !applyDateRange.start || !applyDateRange.end) {
      alert('Please select a template and a full date range.');
      return;
    }

    const newScheduledItem = {
      id: `sched_instance_${Date.now()}`,
      templateId: selectedTemplateId,
      dateRange: applyDateRange,
    };
    
    const isOverlap = scheduledTemplates.some(inst => 
        applyDateRange.start <= inst.dateRange.end && applyDateRange.end >= inst.dateRange.start
    );

    if (isOverlap) {
        alert('Error: The selected date range overlaps with an existing schedule.');
        return;
    }

    setScheduledTemplates(prev => [...prev, newScheduledItem].sort((a,b) => a.dateRange.start.localeCompare(b.dateRange.start)));
    alert('Schedule applied successfully!');
    setSelectedTemplateId('');
    setApplyDateRange({ start: '', end: '' });
  };
  
  const handleRemoveSchedule = (instanceId) => {
    if (window.confirm('Are you sure you want to remove this schedule from your planner?')) {
        setScheduledTemplates(prev => prev.filter(inst => inst.id !== instanceId));
    }
  };

  const handleUpdateSchedule = () => {
    if (!editingInstance.dateRange.start || !editingInstance.dateRange.end) {
        alert('Error: Please provide a valid start and end date.');
        return;
    }
      
    // Add overlap check for edits as well
    const isOverlap = scheduledTemplates.some(inst => 
        inst.id !== editingInstance.id && // Exclude the one being edited
        editingInstance.dateRange.start <= inst.dateRange.end && 
        editingInstance.dateRange.end >= inst.dateRange.start
    );

    if (isOverlap) {
        alert('Error: The new date range overlaps with another schedule.');
        return;
    }

    setScheduledTemplates(prev => prev.map(inst => inst.id === editingInstance.id ? editingInstance : inst));
    setEditingInstance(null);
  };


  return (
    <>
      {/* Section 1: Manage Current Schedules */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <CalendarClock className="h-4 w-4 text-slate-300"/>
            <h3 className="text-sm font-medium">Current Schedules</h3>
        </div>
        <div className="p-4 space-y-2">
            {scheduledTemplates.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">No schedules applied.</p>
            ) : (
                scheduledTemplates.map(instance => {
                    const template = templateLibrary.find(t => t.id === instance.templateId);
                    const isEditing = editingInstance?.id === instance.id;

                    if (isEditing) {
                        return (
                            <div key={instance.id} className="p-2 rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30 space-y-2">
                                <p className="text-sm font-semibold text-white">{template?.name || 'Unknown Template'}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={editingInstance.dateRange.start} onChange={e => setEditingInstance(p => ({...p, dateRange: {...p.dateRange, start: e.target.value}}))} className="w-full bg-white/[0.1] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"/>
                                    <input type="date" value={editingInstance.dateRange.end} onChange={e => setEditingInstance(p => ({...p, dateRange: {...p.dateRange, end: e.target.value}}))} className="w-full bg-white/[0.1] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"/>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleUpdateSchedule} className="w-full text-xs py-1 flex items-center justify-center gap-1 rounded bg-green-600 hover:bg-green-500"><Save className="h-3 w-3"/> Save</button>
                                    <button onClick={() => setEditingInstance(null)} className="w-full text-xs py-1 flex items-center justify-center gap-1 rounded bg-slate-600 hover:bg-slate-500"><XCircle className="h-3 w-3"/> Cancel</button>
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={instance.id} className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-white">{template?.name || 'Unknown Template'}</p>
                                <p className="text-xs text-slate-400">{instance.dateRange.start} to {instance.dateRange.end}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingInstance(JSON.parse(JSON.stringify(instance)))} className="p-1.5 rounded-md hover:bg-indigo-500/30"><Edit className="h-3 w-3 text-indigo-300"/></button>
                                <button onClick={() => handleRemoveSchedule(instance.id)} className="p-1.5 rounded-md hover:bg-rose-500/30"><Trash className="h-3 w-3 text-rose-400"/></button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
      
      {/* Section 2: Apply a New Template */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
          <CalendarPlus className="h-4 w-4 text-slate-300" />
          <h3 className="text-sm font-medium">Apply a Template</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Template</label>
            <select 
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 text-sm rounded-md px-2 py-2 outline-none"
            >
              <option value="">-- Select Published Template --</option>
              {publishedTemplates.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Apply for Date Range</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <input type="date" value={applyDateRange.start} onChange={e => setApplyDateRange(p => ({...p, start: e.target.value}))} className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"/>
              <input type="date" value={applyDateRange.end} onChange={e => setApplyDateRange(p => ({...p, end: e.target.value}))} className="w-full bg-white/[0.06] ring-1 ring-white/10 text-xs rounded-md px-2 py-1 outline-none"/>
            </div>
          </div>
          <button onClick={handleApplySchedule} className="w-full px-3 py-2 rounded-md bg-green-600/90 hover:bg-green-600 text-sm font-medium text-white">
            Apply to Planner
          </button>
        </div>
      </div>
    </>
  );
};

ScheduleManager.propTypes = {
    templateLibrary: PropTypes.array.isRequired,
    scheduledTemplates: PropTypes.array.isRequired,
    setScheduledTemplates: PropTypes.func.isRequired,
    onOpenTemplateManager: PropTypes.func.isRequired,
};

export default ScheduleManager;

