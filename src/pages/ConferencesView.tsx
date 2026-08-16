/**
 * Conference directory and creation screen.
 *
 * This component lists published conferences and allows organizers to create new ones. It connects
 * to the conference API and sets the active conference context across the app.
 */

import React, { useState, useEffect } from 'react';
import { Conference, User } from '../shared/types';
import { api } from '../services/api';
import { 
  Building2, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Radio, 
  Globe, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  ExternalLink,
  X,
  Layers
} from 'lucide-react';

interface ConferencesViewProps {
  currentUser?: User | null;
  currentConferenceId: string;
  onSelectConference: (conf: Conference) => void;
}

export const ConferencesView: React.FC<ConferencesViewProps> = ({
  currentUser,
  currentConferenceId,
  onSelectConference
}) => {
  const isOrganizer = Boolean(currentUser && ['organizer', 'administrator', 'super_admin'].includes(currentUser.role));
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    startDate: '',
    endDate: '',
    venueName: 'Kigali Convention Centre',
    capacity: 2000
  });

  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    setLoading(true);
    try {
      const data = await api.getConferences();
      setConferences(data);
    } catch (err) {
      console.error('Failed to load conferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) return;

    try {
      const newConf = await api.createConference(formData);
      setConferences([newConf, ...conferences]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        tagline: '',
        description: '',
        startDate: '',
        endDate: '',
        venueName: 'Kigali Convention Centre',
        capacity: 2000
      });
      onSelectConference(newConf);
    } catch (err) {
      console.error('Error creating conference:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-extrabold border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>SHC Platform • Multi-Conference Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Conference Directory & Portfolios
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Browse physical, virtual, and hybrid conferences hosted in Rwanda. Select a conference or publish a new one if you are an organizer.
          </p>
        </div>

        {isOrganizer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/25 shrink-0"
            title="Publish a new conference summit (Organizers Only)"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Conference</span>
          </button>
        )}
      </div>

      {/* Conference Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium text-xs">
          Loading conference directory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conferences.map((conf) => {
            const isSelected = conf.id === currentConferenceId;
            return (
              <div
                key={conf.id}
                className={`bg-white border rounded-3xl overflow-hidden transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl'
                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img src={conf.bannerImage} alt={conf.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {conf.shortCode}
                    </span>
                    <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {conf.status}
                    </span>
                  </div>

                  {isSelected && currentUser && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-extrabold truncate">{conf.title}</h3>
                    <p className="text-xs text-slate-300 font-medium truncate">{conf.tagline}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {conf.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-gray-50 border border-gray-200 rounded-2xl p-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-[11px] truncate">{conf.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-[11px] truncate">{conf.city}, {conf.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-semibold text-[11px]">{conf.registeredCount} Registered</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-[11px]">Hybrid LiveKit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onSelectConference(conf)}
                      className={`flex-1 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition ${
                        isSelected && currentUser
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      <span>
                        {currentUser
                          ? isSelected
                            ? 'Active for schedule'
                            : 'Open schedule'
                          : 'View conference'}
                      </span>
                      {!(isSelected && currentUser) && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Conference Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Create Hybrid Conference</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Conference Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Africa AI & Cloud Innovation Forum 2026"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Building Intelligent Infrastructure for Tomorrow"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="e.g. Nov 12, 2026"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    placeholder="e.g. Nov 14, 2026"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Location</label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of conference tracks and goals..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-600/20"
                >
                  Publish Conference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
