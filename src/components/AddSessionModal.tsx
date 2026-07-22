import React, { useState } from 'react';
import { Session, SessionTrack, SessionLevel, Speaker } from '../types';
import { api } from '../services/api';
import { X, Calendar, Plus } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakers: Speaker[];
  onSessionCreated: () => void;
  conferenceId?: string;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  speakers,
  onSessionCreated,
  conferenceId
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [track, setTrack] = useState<SessionTrack>('Web Development');
  const [room, setRoom] = useState('Auditorium A');
  const [capacity, setCapacity] = useState<number>(150);
  const [level, setLevel] = useState<SessionLevel>('Intermediate');
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpeakerToggle = (id: string) => {
    if (selectedSpeakerIds.includes(id)) {
      setSelectedSpeakerIds(selectedSpeakerIds.filter(s => s !== id));
    } else {
      setSelectedSpeakerIds([...selectedSpeakerIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      // Calculate startMinutes for sorting
      let startMinutes = 540;
      if (startTime.includes('10:00 AM')) startMinutes = 600;
      if (startTime.includes('11:00 AM')) startMinutes = 660;
      if (startTime.includes('01:00 PM')) startMinutes = 780;
      if (startTime.includes('02:00 PM')) startMinutes = 840;

      await api.saveSession({
        title: title.trim(),
        description: description.trim(),
        day,
        startTime,
        endTime,
        startMinutes,
        endMinutes: startMinutes + 60,
        track,
        room,
        capacity,
        level,
        speakerIds: selectedSpeakerIds,
        tags: [track.split(' ')[0], level],
        conferenceId,
      });

      onSessionCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-800" />
            Add New Conference Session
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-gray-100 text-slate-400 hover:text-slate-900 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <div className="space-y-1">
            <label className="font-semibold text-slate-900">Session Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Next-Gen WebAssembly & WebGPU Runtimes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-900">Description / Abstract *</label>
            <textarea
              rows={3}
              required
              placeholder="Overview of session goals and takeaways..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900 resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-900">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              >
                <option value={1}>Day 1 (Oct 14)</option>
                <option value={2}>Day 2 (Oct 15)</option>
                <option value={3}>Day 3 (Oct 16)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-900">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-900">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-900">Track</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as SessionTrack)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Web Development">Web Development</option>
                <option value="Cloud & Architecture">Cloud & Architecture</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="UX & Product Design">UX & Product Design</option>
                <option value="DevOps & SRE">DevOps & SRE</option>
                <option value="Keynote">Keynote</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-900">Room Location</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-900">Seat Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Speakers */}
          <div className="space-y-2 pt-2">
            <label className="font-semibold text-slate-900">Assign Speakers</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl">
              {speakers.map((spk) => {
                const isSelected = selectedSpeakerIds.includes(spk.id);
                return (
                  <button
                    key={spk.id}
                    type="button"
                    onClick={() => handleSpeakerToggle(spk.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-gray-200 hover:text-slate-900'
                    }`}
                  >
                    {spk.name} ({spk.company})
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-xs"
          >
            Create Session
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};
