import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Trash, Save, Book } from 'lucide-react';
import * as utils from '../../../utils';

const emptyTemplate = {
  id: '',
  name: 'New Template',
  type: 'Individual Days',
  status: 'draft',
  schedule: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  common: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
};

// --- Sub-component for the new Common Blocks UI ---
const CommonBlockEditor = ({ commonData, onUpdate }) => {
    const [newBlock, setNewBlock] = useState({ label: 'New Common Event', start: '12:00', end: '13:00', days: [] });

    const groupedBlocks = useMemo(() => {
        const groups = {};
        for (const day of utils.dayKeys) {
            (commonData[day] || []).forEach(block => {
                const key = `${block.label}|${block.start}|${block.end}`;
                if (!groups[key]) {
                    groups[key] = {
                        label: block.label,
                        start: block.start,
                        end: block.end,
                        days: [],
                        dayIds: {} // To track specific IDs for deletion
                    };
                }
                groups[key].days.push(day);
                groups[key].dayIds[day] = block.id;
            });
        }
        return Object.values(groups);
    }, [commonData]);

    const handleAdd = () => {
        if (!newBlock.label || !newBlock.start || !newBlock.end || newBlock.days.length === 0) {
            alert('Please provide a label, time range, and select at least one day.');
            return;
        }
        onUpdate({ type: 'add', payload: newBlock });
        setNewBlock({ label: 'New Common Event', start: '12:00', end: '13:00', days: [] }); // Reset form
    };

    const handleDelete = (groupedBlock) => {
        onUpdate({ type: 'delete', payload: groupedBlock });
    };

    const toggleDay = (day) => {
        setNewBlock(prev => {
            const newDays = prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day];
            return { ...prev, days: newDays };
        });
    };
    
    return (
        <div className="space-y-4">
            {/* List of existing grouped blocks */}
            <div className="space-y-2">
                {groupedBlocks.map((group, index) => (
                    <div key={index} className="p-2 bg-white/[0.08] rounded-md text-xs flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{group.label}</p>
                            <p className="text-slate-400">{group.start} - {group.end}</p>
                            <p className="text-indigo-300 text-[10px]">{group.days.map(d => d.slice(0,3)).join(', ')}</p>
                        </div>
                        <button onClick={() => handleDelete(group)} className="hover:text-rose-300 p-1"><Trash className="h-4 w-4 text-rose-400"/></button>
                    </div>
                ))}
            </div>

            {/* Form for adding a new common block */}
            <div className="p-2 border border-white/10 rounded-lg space-y-3">
                <input type="text" value={newBlock.label} onChange={e => setNewBlock(p => ({...p, label: e.target.value}))} className="w-full bg-white/[0.08] p-1 rounded-md text-xs" placeholder="Block Label"/>
                <div className="grid grid-cols-2 gap-2">
                    <input type="time" value={newBlock.start} onChange={e => setNewBlock(p => ({...p, start: e.target.value}))} className="bg-white/[0.08] p-1 rounded-md text-xs"/>
                    <input type="time" value={newBlock.end} onChange={e => setNewBlock(p => ({...p, end: e.target.value}))} className="bg-white/[0.08] p-1 rounded-md text-xs"/>
                </div>
                <div className="flex flex-wrap gap-1">
                    {utils.dayKeys.map(day => (
                        <button key={day} onClick={() => toggleDay(day)} className={`text-[10px] px-2 py-1 rounded-md ring-1 ${newBlock.days.includes(day) ? "bg-sky-500/20 ring-sky-400/30 text-sky-200" : "bg-white/[0.06] ring-white/10"}`}>{day.slice(0,3)}</button>
                    ))}
                </div>
                <button onClick={handleAdd} className="w-full text-xs text-sky-300 flex items-center justify-center gap-1 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30"><Plus className="h-3 w-3"/> Add Common Block</button>
            </div>
        </div>
    );
};

const TemplateEditorModal = ({ isOpen, onClose, templates, onSave, onDelete }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    if (selectedId) {
      const template = templates.find(t => t.id === selectedId);
      setEditingTemplate(template ? JSON.parse(JSON.stringify(template)) : null);
    } else {
      setEditingTemplate(null);
    }
  }, [selectedId, templates]);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    const newTpl = { ...emptyTemplate, id: `lib_template_${Date.now()}`};
    onSave(newTpl);
    setSelectedId(newTpl.id);
  };

  const validateTemplate = () => {
    if (!editingTemplate) return false;
    for (const day of utils.dayKeys) {
      const allDayBlocks = [...(editingTemplate.schedule[day] || []), ...(editingTemplate.common[day] || [])];
      for (const blockToCheck of allDayBlocks) {
         if (utils.hasTimeOverlap(blockToCheck, allDayBlocks)) {
            alert(`Error: Overlapping time found for "${blockToCheck.label}" on ${day}. Please correct the times.`);
            return false;
         }
      }
    }
    return true;
  };

  const handleSaveChanges = () => {
    if (validateTemplate()) {
        onSave(editingTemplate);
        alert('Draft saved!');
    }
  };
  
  const handlePublish = () => {
    if (validateTemplate()) {
        onSave({ ...editingTemplate, status: 'published' });
        alert('Template published successfully!');
    }
  };
  
  const handleDelete = () => {
    if (editingTemplate) {
        onDelete(editingTemplate.id);
        setSelectedId(null);
        setEditingTemplate(null);
    }
  };

  const handleBlockChange = (day, type, index, field, value) => {
    setEditingTemplate(prev => {
        const updated = { ...prev };
        updated[type][day][index][field] = value;
        return updated;
    });
  };

  const handleAddScheduleBlock = (day) => {
    setEditingTemplate(prev => {
        const updated = { ...prev };
        const newBlock = { id: `block_schedule_${Date.now()}`, start: '09:00', end: '10:00', label: 'New Event'};
        updated.schedule[day].push(newBlock);
        return updated;
    });
  };

  const handleDeleteScheduleBlock = (day, index) => {
    setEditingTemplate(prev => {
        const updated = { ...prev };
        updated.schedule[day].splice(index, 1);
        return updated;
    });
  };

  const handleCommonBlockUpdate = (action) => {
    setEditingTemplate(prev => {
        const updated = JSON.parse(JSON.stringify(prev));
        if (action.type === 'add') {
            const { label, start, end, days } = action.payload;
            days.forEach(day => {
                const newBlock = { id: `common_${day}_${Date.now()}`, label, start, end };
                if (!updated.common[day]) updated.common[day] = [];
                updated.common[day].push(newBlock);
            });
        } else if (action.type === 'delete') {
            const { dayIds } = action.payload;
            Object.entries(dayIds).forEach(([day, blockId]) => {
                updated.common[day] = updated.common[day].filter(b => b.id !== blockId);
            });
        }
        return updated;
    });
  };

  const scheduleEditorSection = (day) => (
    <div className="space-y-2">
      {editingTemplate.schedule?.[day]?.map((block, index) => (
         <div key={block.id} className="flex items-center gap-2 text-xs">
             <input type="text" value={block.label} onChange={e => handleBlockChange(day, 'schedule', index, 'label', e.target.value)} className="w-full bg-white/[0.08] p-1 rounded-md"/>
             <input type="time" value={block.start} onChange={e => handleBlockChange(day, 'schedule', index, 'start', e.target.value)} className="bg-white/[0.08] p-1 rounded-md"/>
             <input type="time" value={block.end} onChange={e => handleBlockChange(day, 'schedule', index, 'end', e.target.value)} className="bg-white/[0.08] p-1 rounded-md"/>
             <button onClick={() => handleDeleteScheduleBlock(day, index)}><Trash className="h-3 w-3 text-rose-400"/></button>
         </div>
      ))}
      <button onClick={() => handleAddScheduleBlock(day)} className="text-xs text-sky-400 flex items-center gap-1"><Plus className="h-3 w-3"/> Add Block</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#1e1e2e] text-white w-full max-w-4xl h-[90vh] rounded-2xl border border-white/10 shadow-lg flex flex-col">
        <header className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Book className="h-5 w-5"/> Template Manager</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><X className="h-5 w-5"/></button>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <aside className="w-1/3 border-r border-white/10 p-4 space-y-2 overflow-y-auto">
            <button onClick={handleCreateNew} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 text-sm font-medium">
                <Plus className="h-4 w-4"/> New Template
            </button>
            {templates.map(t => (
              <div key={t.id} onClick={() => setSelectedId(t.id)} className={`p-3 rounded-md cursor-pointer ${selectedId === t.id ? 'bg-indigo-500/40' : 'hover:bg-white/5'}`}>
                <h4 className="font-semibold">{t.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>{t.status}</span>
              </div>
            ))}
          </aside>

          <section className="w-2/3 p-4 overflow-y-auto">
            {editingTemplate ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <input type="text" value={editingTemplate.name} onChange={e => setEditingTemplate(p => ({...p, name: e.target.value}))} className="text-xl font-bold bg-transparent border-b-2 border-white/10 focus:border-indigo-500 outline-none w-1/2"/>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSaveChanges} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-md text-sm flex items-center gap-1"><Save className="h-4 w-4"/> Save Draft</button>
                        <button onClick={handlePublish} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-md text-sm flex items-center gap-1">Publish</button>
                        <button onClick={handleDelete} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-md"><Trash className="h-4 w-4 text-rose-300"/></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg space-y-3">
                      <h3 className="font-semibold text-center border-b border-white/10 pb-2 mb-3">Schedule Blocks</h3>
                      {utils.dayKeys.map(day => <div key={day}><h4 className="text-sm font-bold capitalize text-slate-300 mb-1">{day}</h4>{scheduleEditorSection(day)}</div>)}
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg space-y-3">
                      <h3 className="font-semibold text-center border-b border-white/10 pb-2 mb-3">Common Blocks</h3>
                      <CommonBlockEditor 
                          commonData={editingTemplate.common}
                          onUpdate={handleCommonBlockUpdate}
                      />
                  </div>
                </div>
              </div>
            ) : <div className="text-center text-slate-400 pt-20">Select a template from the list or create a new one.</div>}
          </section>
        </main>
      </div>
    </div>
  );
};

TemplateEditorModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TemplateEditorModal;

