import React, { useState, useEffect } from 'react';
import MapRenderer from './components/MapRenderer';
import Sidebar from './components/Sidebar';
import ConfirmModal from './components/ConfirmModal';
import { initialRegions, Region, Landmark } from './data/regions';

export default function App() {
  const [activeTab, setActiveTab] = useState<'regions' | 'landmarks' | 'checklist'>('regions');
  
  const [regions, setRegions] = useState<Region[]>(() => {
    try {
      const saved = localStorage.getItem('global_mapper_regions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length < 200) {
          localStorage.setItem('global_mapper_regions', JSON.stringify(initialRegions));
          return initialRegions;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load regions', e);
    }
    return initialRegions;
  });

  const [landmarks, setLandmarks] = useState<Landmark[]>(() => {
    try {
      const saved = localStorage.getItem('global_mapper_landmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('global_mapper_regions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('global_mapper_landmarks', JSON.stringify(landmarks));
  }, [landmarks]);

  const toggleRegionField = (id: string, field: 'completed' | 'wishlist') => {
    setRegions(prev => prev.map(reg => reg.id === id ? { ...reg, [field]: !reg[field] } : reg));
  };

  const addLandmark = (landmark: Landmark) => {
    setLandmarks(prev => [...prev, landmark]);
  };

  // State for adding a new landmark with a modal prompt
  const [pendingLandmarkPos, setPendingLandmarkPos] = useState<{ lat: number; lng: number } | null>(null);
  const [newLandmarkName, setNewLandmarkName] = useState('');

  const handlePromptAddLandmark = (lat: number, lng: number) => {
    setPendingLandmarkPos({ lat, lng });
    setNewLandmarkName('New Landmark');
  };

  const confirmAddLandmark = () => {
    if (pendingLandmarkPos) {
      addLandmark({
        id: Date.now().toString(),
        name: newLandmarkName.trim() || 'New Landmark',
        lat: pendingLandmarkPos.lat,
        lng: pendingLandmarkPos.lng,
      });
      setPendingLandmarkPos(null);
      setNewLandmarkName('');
    }
  };

  const updateLandmark = (updated: Landmark) => {
    setLandmarks(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  // State to track which landmark is staged for deletion
  const [landmarkToDelete, setlandmarkToDelete] = useState<string | null>(null);

  const deleteLandmark = (id: string) => {
    setlandmarkToDelete(id);
  };

  const executeDeleteLandmark = () => {
    if (landmarkToDelete) {
      setLandmarks(prev => prev.filter(l => l.id !== landmarkToDelete));
      setlandmarkToDelete(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none relative" onContextMenu={(e) => e.preventDefault()}>
      <Sidebar 
        regions={regions} 
        toggleRegionField={toggleRegionField} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        landmarks={landmarks}
        deleteLandmark={deleteLandmark}
      />
      
      <main className="flex-1 h-full relative min-w-0">
        <MapRenderer 
          regions={regions} 
          landmarks={landmarks} 
          activeTab={activeTab}
          onAddLandmark={handlePromptAddLandmark}
          onUpdateLandmark={updateLandmark}
        />
      </main>

      {/* Moved ConfirmModal out of main so it covers the full viewport cleanly */}
      <ConfirmModal 
        isOpen={pendingLandmarkPos !== null}
        title="Add Custom Landmark"
        message="Enter a name for your new map marker:"
        confirmText="Add Pin"
        showInput={true}
        inputValue={newLandmarkName}
        onInputChange={setNewLandmarkName}
        inputPlaceholder="Landmark name..."
        onConfirm={confirmAddLandmark}
        onCancel={() => setPendingLandmarkPos(null)}
      />
    
      <ConfirmModal 
        isOpen={landmarkToDelete !== null}
        title="Delete Landmark"
        message="Are you sure you want to remove this custom landmark? This action cannot be undone."
        confirmText="Delete"
        onConfirm={executeDeleteLandmark}
        onCancel={() => setlandmarkToDelete(null)}
      />
    </div>
  );
}