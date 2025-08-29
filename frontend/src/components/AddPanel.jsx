import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Code2, Info, Link, X } from 'lucide-react';
import * as utils from '../utils';

const AddPanel = ({ onClose, onSave, selectedDate, timetable }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [revisable, setRevisable] = useState(false);
  const [linkBuffer, setLinkBuffer] = useState([]);
  const [linkInput, setLinkInput] = useState({ label: '', url: '' });

  const timeIsBlocked = time && !utils.timeFallsInBlocks(time, (timetable[utils.weekKeyFromDateStr(date)] && timetable[utils.weekKeyFromDateStr(date)][utils.dayKeyFromDateStr(date)]) || []);

  useEffect(() => {
    if (type === 'coding') {
      setRevisable(true);
    }
  }, [type]);

  const handleAddLink = () => {
    if (linkInput.label && linkInput.url) {
      setLinkBuffer([...linkBuffer, linkInput]);
      setLinkInput({ label: '', url: '' });
    }
  };

  const handleSave = () => {
    if (!title) return;
    if (timeIsBlocked) return;

    const newTask = {
      id: utils.uid(),
      title,
      type,
      date,
      time,
      notes,
      createdAt: utils.todayStr(),
      done: false,
      revisable: revisable || type === 'coding',
      revisionStage: 0,
      links: linkBuffer,
    };
    onSave((prev) => [...prev, newTask]);
    onClose();
  };

  return (
    <div className="border border-white/10 rounded-xl bg-white/[0.03]">
      <div className="p-4 grid grid-cols-1 md:grid-cols-7 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" placeholder="E.g., Build auth page" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none">
            <option value="task">Task</option>
            <option value="reminder">Reminder</option>
            <option value="coding">Coding</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
          {timeIsBlocked && <p className="mt-1 text-[11px] text-amber-300">Selected time falls inside your class timetable. Pick another time.</p>}
        </div>
        <div>
          <label className="text-xs text-slate-400">Needs revision</label>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => setRevisable(!revisable)} className="px-2 py-2 rounded-md ring-1 ring-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition">
              <div className="flex items-center gap-2">
                <span className={`h-4 w-4 rounded-full ring-1 ring-white/10 ${revisable ? 'bg-emerald-500/20' : 'bg-white/10'}`}></span>
                <span className="text-xs text-slate-300">{revisable ? 'Enabled' : 'Disabled'}</span>
              </div>
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">Notes</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" placeholder="Optional" />
        </div>
      </div>

      {type === 'coding' && (
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-4 w-4 text-slate-300" />
            <span className="text-sm text-slate-300">Coding Links</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <input value={linkInput.label} onChange={(e) => setLinkInput({ ...linkInput, label: e.target.value })} placeholder="Label (e.g., Repo, PR, Live)" className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
            </div>
            <div className="md:col-span-3">
              <input value={linkInput.url} onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })} placeholder="https://…" className="w-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20 rounded-md px-3 py-2 text-sm outline-none" />
            </div>
            <div className="md:col-span-1">
              <button onClick={handleAddLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 hover:ring-white/20 text-sm">
                <Plus className="h-4 w-4" />
                Add link
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {linkBuffer.map((link, index) => (
              <span key={index} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-white/[0.06] ring-1 ring-white/10">
                <Link className="h-3 w-3" />
                <span>{link.label}</span>
                <button onClick={() => setLinkBuffer(linkBuffer.filter((_, i) => i !== index))} className="text-slate-400 hover:text-slate-200"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="h-4 w-4" />
          <span>Tip: Coding items default to revision tracking.</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md bg-white/[0.02] hover:bg-white/[0.06] ring-1 ring-white/10 text-sm">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 ring-1 ring-indigo-400/30 hover:ring-indigo-300/50 text-sm font-medium text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

AddPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedDate: PropTypes.string.isRequired,
  timetable: PropTypes.object.isRequired,
};

export default AddPanel;