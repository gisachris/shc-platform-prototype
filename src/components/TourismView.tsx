import React, { useState, useEffect } from 'react';
import { TourismItem, TourismCategory } from '../types';
import { api } from '../services/api';
import { 
  MapPin, 
  Compass, 
  Phone, 
  Globe, 
  Star, 
  Search, 
  Sparkles, 
  Hotel, 
  Utensils, 
  Car, 
  ShieldAlert, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const TourismView: React.FC = () => {
  const [items, setItems] = useState<TourismItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<TourismItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTourism();
  }, []);

  const loadTourism = async () => {
    setLoading(true);
    try {
      const data = await api.getTourism();
      setItems(data);
    } catch (err) {
      console.error('Failed to load tourism data:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories: { id: string; label: string; icon: React.FC<any> }[] = [
    { id: 'all', label: 'All Highlights', icon: Compass },
    { id: 'attraction', label: 'Attractions & Safaris', icon: Sparkles },
    { id: 'hotel', label: 'Hotels & Stays', icon: Hotel },
    { id: 'restaurant', label: 'Dining & Cafes', icon: Utensils },
    { id: 'transport', label: 'Transit & Yego Cabs', icon: Car },
    { id: 'emergency', label: 'Emergency Desk', icon: ShieldAlert },
  ];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80')" }}></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHC Platform • Delegate Experience</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Explore Rwanda & Kigali
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to the Remarkable Land of a Thousand Hills! Discover eco-luxury gorilla trekking safaris, 5-star conference hotels, vibrant dining, and transport services before and after your sessions.
          </p>

          {/* Quick info bar */}
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Venue: Kigali Convention Centre (KCC)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>24/7 Helpline: +250 788 313 131</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attractions, stays, food..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Grid of Tourism Cards */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium text-xs">
          Loading Rwanda Tourism Guide...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching tourism locations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different filter category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                  {item.category}
                </div>
                {item.rating && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-white" />
                    <span>{item.rating}</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl w-fit">
                    <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.distanceFromVenue}</span>
                  </div>
                </div>

                {/* Highlight Tags */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.highlights.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition mt-2 shadow-xs"
                >
                  <span>View Details & Contacts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
            <div className="relative h-56 bg-slate-900">
              <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider mb-1">
                  {selectedItem.category} • {selectedItem.priceRange || 'Delegate Experience'}
                </div>
                <h3 className="text-xl font-black text-slate-900">{selectedItem.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">{selectedItem.location}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedItem.distanceFromVenue}</span>
                </div>
                {selectedItem.contactNumber && (
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-200 text-slate-900 font-semibold">
                    <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Contact: {selectedItem.contactNumber}</span>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {selectedItem.highlights && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Key Highlights</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedItem.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-700 bg-slate-100 p-2 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                {selectedItem.website && (
                  <a
                    href={selectedItem.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold py-3 px-5 rounded-2xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
