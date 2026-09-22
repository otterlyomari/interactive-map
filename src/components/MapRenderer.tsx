import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Region, Landmark } from '../data/regions';

interface MapRendererProps {
  regions: Region[];
  landmarks: Landmark[];
  activeTab: 'regions' | 'landmarks' | 'checklist';
  onAddLandmark: (lat: number, lng: number) => void;
  onUpdateLandmark: (landmark: Landmark) => void;
}

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;

function LabelPaneSetup() {
  const map = useMap();
  useEffect(() => {
    if (!map.getPane('labels')) {
      map.createPane('labels');
      const pane = map.getPane('labels');
      if (pane) {
        pane.style.zIndex = '650';
        pane.style.pointerEvents = 'none';
      }
    }
  }, [map]);
  return null;
}

function MapClickHandler({ activeTab, onAddLandmark }: { activeTab: string, onAddLandmark: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!map) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Only handle right-clicks when on the landmarks tab
      if (activeTabRef.current === 'landmarks') {
        // Prevent the default browser right-click context menu
        e.preventDefault();

        const containerPoint = map.mouseEventToContainerPoint(e);
        const latlng = map.containerPointToLatLng(containerPoint);

        onAddLandmark(latlng.lat, latlng.lng);
      }
    };

    const mapContainer = map.getContainer();
    mapContainer.addEventListener('contextmenu', handleContextMenu);

    return () => {
      mapContainer.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [map, onAddLandmark]);

  return null;
}

const countryNameMapping: Record<string, string> = {
  'united states': 'united states of america',
  'czech republic': 'czechia',
  'korea, republic of': 'south korea',
  'dem. rep. congo': 'democratic republic of the congo',
  'swaziland': 'eswatini',
  'macedonia': 'north macedonia',
};

export default function MapRenderer({ regions, landmarks, activeTab, onAddLandmark, onUpdateLandmark }: MapRendererProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(res => res.json()),
      fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json').then(res => res.json())
    ])
      .then(([countriesGeo, statesGeo]) => {
        setGeoData({
          type: "FeatureCollection",
          features: [...countriesGeo.features, ...statesGeo.features]
        });
      })
      .catch((err) => console.error('Failed to load map boundaries:', err));
  }, []);

  const normalizeCountryName = (rawName: string) => {
    if (!rawName) return '';
    const lower = rawName.toLowerCase().trim();
    return countryNameMapping[lower] || lower;
  };

  const getFeatureStyle = (feature: any) => {
    const props = feature.properties || {};
    const rawName = props.ADMIN || props.name || props.NAME || '';
    
    const normalized = normalizeCountryName(rawName);
    const matchedRegion = regions.find(r => 
      (r.type === 'country' && r.name.toLowerCase().trim() === normalized) ||
      (r.type === 'state' && r.name.toLowerCase().trim() === rawName.toLowerCase().trim())
    );

    const isCompleted = matchedRegion ? matchedRegion.completed : false;
    const isWishlist = matchedRegion ? matchedRegion.wishlist : false;

    let fillColor = 'transparent';
    let color = '#334155';
    let fillOpacity = 0;

    if (isCompleted) {
      fillColor = '#34d399'; // Emerald
      color = '#059669';
      fillOpacity = 0.6;
    } else if (isWishlist) {
      fillColor = '#38bdf8'; // Sky Blue
      color = '#0284c7';
      fillOpacity = 0.5;
    }

    return {
      fillColor,
      fillOpacity,
      color,
      weight: isCompleted || isWishlist ? 2 : 1,
    };
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#111111] overflow-hidden">
      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        minZoom={3}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomControl={false} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', backgroundColor: '#111111' }}
        className="absolute inset-0 w-full h-full"
      >
        <LabelPaneSetup />
        
        <MapClickHandler activeTab={activeTab} onAddLandmark={onAddLandmark} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={`https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`}
          noWrap={true}
        />

        {geoData && (
          <GeoJSON 
            key={regions.map(r => `${r.completed ? 1 : 0}${r.wishlist ? 1 : 0}`).join('')}
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={(feature, layer) => {
              const props = feature.properties || {};
              const regionName = props.ADMIN || props.name || props.NAME;
              if (regionName) {
                layer.bindPopup(`
                  <div style="font-family: sans-serif; color: #0f172a; font-size: 12px;">
                    <strong>${regionName}</strong>
                  </div>
                `);
              }
            }}
          />
        )}

        {landmarks.map(l => (
          <Marker 
            key={l.id} 
            position={[l.lat, l.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onUpdateLandmark({
                  ...l,
                  lat: position.lat,
                  lng: position.lng,
                });
              }
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', color: '#0f172a', fontSize: '12px' }}>
                <strong>📍 {l.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        <TileLayer
          pane="labels"
          attribution=''
          url={`https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`}
          noWrap={true}
        />
      </MapContainer>
    </div>
  );
}