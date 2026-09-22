import React, { useState } from 'react';
import { Globe, Map, MapPin, CheckSquare, Search, Database, Sparkles, CheckCircle2, Circle, Star, Trash2 } from 'lucide-react';
import { Landmark, Region } from '../data/regions';

interface SidebarProps {
  regions: Region[];
  toggleRegionField: (id: string, field: 'completed' | 'wishlist') => void;
  activeTab: 'regions' | 'landmarks' | 'checklist';
  setActiveTab: (tab: 'regions' | 'landmarks' | 'checklist') => void;
  landmarks: Landmark[];
  deleteLandmark: (id: string) => void;
}

export default function Sidebar({ 
  regions, 
  toggleRegionField, 
  activeTab, 
  setActiveTab, 
  landmarks, 
  deleteLandmark 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'wishlist'>('all');

  const completedCount = regions.filter(r => r.completed).length;
  const wishlistCount = regions.filter(r => r.wishlist).length;
  const totalCount = regions.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredRegions = regions.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'completed') return r.completed;
    if (filter === 'wishlist') return r.wishlist;
    return true;
  });

  const usStates = filteredRegions.filter(r => r.type === 'state');
  const countries = filteredRegions.filter(r => r.type === 'country');

  return (
    <aside className="w-80 min-w-[320px] border-r border-slate-800/80 bg-slate-900/90 flex flex-col justify-between p-5 z-10 shadow-2xl h-full">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">Global Mapper</h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Territory & Wishlist Tracker</p>
          </div>
        </div>

        <div className="my-4 h-px bg-slate-800/80 shrink-0" />

        {/* Navigation Links */}
        <nav className="space-y-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab('regions')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'regions' 
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm' 
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Map className="w-4 h-4 text-cyan-400" />
            <span>Countries & States</span>
          </button>

          <button 
            onClick={() => setActiveTab('landmarks')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'landmarks' 
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm' 
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>Custom Landmarks</span>
          </button>

          <button 
            onClick={() => setActiveTab('checklist')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'checklist' 
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm' 
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Progress Checklist</span>
          </button>
        </nav>

        {/* Dynamic Panel Content */}
        <div className="mt-4 flex-1 flex flex-col overflow-hidden p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60">
          {activeTab === 'regions' && (
            <div className="flex flex-col h-full space-y-3 overflow-hidden">
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 50 states, countries..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                <button 
                  onClick={() => setFilter('all')}
                  className={`flex-1 py-1 text-[11px] rounded font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('completed')}
                  className={`flex-1 py-1 text-[11px] rounded font-medium transition-colors ${filter === 'completed' ? 'bg-emerald-600/30 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Visited ({completedCount})
                </button>
                <button 
                  onClick={() => setFilter('wishlist')}
                  className={`flex-1 py-1 text-[11px] rounded font-medium transition-colors ${filter === 'wishlist' ? 'bg-sky-600/30 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Wishlist ({wishlistCount})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Countries Section */}
                {countries.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Countries</p>
                    {countries.map((region) => (
                      <div 
                        key={region.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 transition text-xs group"
                      >
                        <span className={`${region.completed ? 'text-slate-200 font-medium' : region.wishlist ? 'text-sky-300 font-medium' : 'text-slate-400'}`}>
                          {region.name}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => toggleRegionField(region.id, 'wishlist')}
                            className={`p-1 rounded transition-colors ${region.wishlist ? 'text-sky-400 bg-sky-500/10' : 'text-slate-700 hover:text-slate-400'}`}
                            title="Toggle Wishlist"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button 
                            onClick={() => toggleRegionField(region.id, 'completed')}
                            className="p-1 cursor-pointer"
                            title="Toggle Visited"
                          >
                            {region.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-700 group-hover:text-slate-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* US States Section */}
                {usStates.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">U.S. States</p>
                    {usStates.map((region) => (
                      <div 
                        key={region.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 transition text-xs group"
                      >
                        <span className={`${region.completed ? 'text-slate-200 font-medium' : region.wishlist ? 'text-sky-300 font-medium' : 'text-slate-400'}`}>
                          {region.name}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => toggleRegionField(region.id, 'wishlist')}
                            className={`p-1 rounded transition-colors ${region.wishlist ? 'text-sky-400 bg-sky-500/10' : 'text-slate-700 hover:text-slate-400'}`}
                            title="Toggle Wishlist"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button 
                            onClick={() => toggleRegionField(region.id, 'completed')}
                            className="p-1 cursor-pointer"
                            title="Toggle Visited"
                          >
                            {region.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-700 group-hover:text-slate-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'landmarks' && (
            <div className="flex flex-col h-full space-y-3 overflow-hidden">
              <p className="text-xs text-slate-400 leading-relaxed shrink-0 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                💡 Click anywhere on the map to pin custom landmarks or historical sites.
              </p>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {landmarks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No custom landmarks added yet.</p>
                ) : (
                  landmarks.map(l => (
                    <div key={l.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-semibold text-slate-200">{l.name}</h4>
                        <span className="text-[10px] text-slate-500">{l.lat.toFixed(2)}, {l.lng.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => deleteLandmark(l.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Remove Landmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="flex flex-col h-full space-y-3 overflow-y-auto pr-1 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center space-y-2 shrink-0">
                <div className="text-3xl font-black text-emerald-400">{completionPercentage}%</div>
                <div className="text-slate-400">Total World Progress</div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                </div>
              </div>

              <div className="space-y-2 shrink-0">
                <div className="flex justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Visited Regions</span>
                  <span className="font-bold text-emerald-400">{completedCount} / {totalCount}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Wishlist Destinations</span>
                  <span className="font-bold text-sky-400">{wishlistCount}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Custom Landmarks</span>
                  <span className="font-bold text-rose-400">{landmarks.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/80 pt-3 mt-3 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local DB Active</span>
        </div>
        <span className="flex items-center space-x-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/60">
          <Sparkles className="w-3 h-3 mr-1" />
          OSS Free
        </span>
      </div>
    </aside>
  );
}