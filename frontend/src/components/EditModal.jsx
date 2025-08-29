import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NotebookPen, X, Trash2, Link, Plus } from 'lucide-react';
import * as utils from '../utils';

const EditModal = ({ task, onClose, onSave, onDelete, timetable }) => {
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(task.time || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [revisable, setRevisable] = useState(task.revisable);
  const [links, setLinks] = useState(task.links || []);
  const [linkInput, setLinkInput] = useState({ label: '', url: '' });

  const handleSave = () => {
    if (time && !utils.timeFallsInBlocks(time, (timetable[utils.weekKeyFromDateStr(date)] && timetable[utils.weekKeyFromDateStr(date)][utils.dayKeyFromDateStr(date)]) || [])) {
      // Simple visual feedback for invalid time
      return;
    }
    onSave({ ...task, title, date, time, notes, revisable, links });
  };

  const handleAddLink = () => {
    if (linkInput.label && linkInput.url) {
      setLinks([...links, linkInput]);
      setLinkInput({ label: '', url: '' });
    }
  };

  const handleDeleteLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-4">
        <div className="w-full md:max-w-lg rounded-xl bg-[#0b0d12] border border-white/10 shadow-xl">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <NotebookPen className="h-4 w-4 text-slate-300" />
            <h3 className="text-sm font-medium">Edit item</h3>
            <button onClick={onClose} className="ml-auto p-2 rounded-md hover:bg-white/[0.06]"><X className="h-4 w-4" /></button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" rows="3"></textarea>
            </div>
            <div>
              <label className="text-xs text-slate-400">Revision</label>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setRevisable(!revisable)} className="px-2 py-2 rounded-md ring-1 ring-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition">
                    <div className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded-full ring-1 ring-white/10 ${revisable ? 'bg-emerald-500/20' : 'bg-white/10'}`}></span>
                      <span className="text-xs text-slate-300">{revisable ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </button>
                </div>
                <div className="text-xs text-slate-400">Stage: <span className="text-slate-200">{task.revisionStage}</span>/3</div>
              </div>
            </div>
            {(task.type === 'coding' || links.length > 0) && (
              <div>
                <div className="mt-2 flex items-center gap-2">
                  <Link className="h-4 w-4 text-slate-300" />
                  <span className="text-sm text-slate-300">Links</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.1]">
                      <Link className="h-3 w-3" />
                      <span>{l.label}</span>
                      <button onClick={() => handleDeleteLink(i)}><X className="h-3 w-3" /></button>
                    </a>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  <input value={linkInput.label} onChange={(e) => setLinkInput({ ...linkInput, label: e.target.value })} placeholder="Label" className="col-span-2 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
                  <input value={linkInput.url} onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })} placeholder="https://…" className="col-span-3 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
                </div>
                <button onClick={handleAddLink} className="mt-2 px-3 py-2 rounded-md bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 hover:ring-white/20 text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add link
                </button>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
            <button onClick={() => onDelete(task.id)} className="px-3 py-2 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/20 text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-2 rounded-md bg-white/[0.02] hover:bg-white/[0.06] ring-1 ring-white/10 text-sm">Cancel</button>
              <button onClick={handleSave} className="px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 ring-1 ring-indigo-400/30 hover:ring-indigo-300/50 text-sm font-medium text-white">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EditModal.propTypes = {
  task: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  timetable: PropTypes.object.isRequired,
};

export default EditModal;