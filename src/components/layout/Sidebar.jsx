import React, { useState } from 'react';
import {
  Navigation,
  CloudSun,
  ShieldAlert,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { RoutePanel } from '../panels/RoutePanel';
import { WeatherPanel } from '../panels/WeatherPanel';
import { RadiationPanel } from '../panels/RadiationPanel';
import { SafetyPanel } from '../panels/SafetyPanel';

export function Sidebar({
  routeHook,
  pois,
  weather,
  radiation,
  curiosityRoute,
  minerals,
  activeLayer,
  onLayerChange,
}) {
  const [activeTab, setActiveTab] = useState('route');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarTabs = [
    { id: 'route', label: 'Ruta', icon: Navigation },
    { id: 'weather', label: 'Clima', icon: CloudSun },
    { id: 'radiation', label: 'Radiación', icon: Activity },
    { id: 'safety', label: 'Seguridad', icon: ShieldAlert },
  ];

  return (
    <aside
      className={`relative z-20 h-full transition-all duration-300 ease-in-out flex flex-col bg-[#161617]/95 backdrop-blur-2xl border-l border-white/10 ${
        isCollapsed ? 'w-14' : 'w-80 md:w-96'
      }`}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#2C2C2E] border border-white/15 text-[#F5F5F7] flex items-center justify-center shadow-lg hover:bg-[#3A3A3C] transition-colors z-30"
        title={isCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Tabs Header */}
      <div className="p-2 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 w-full justify-around">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-apple-glow'
                    : 'text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/5'
                } ${isCollapsed ? 'justify-center p-2.5' : ''}`}
                title={tab.label}
              >
                <Icon size={16} />
                {!isCollapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'route' && (
            <RoutePanel
              routeHook={routeHook}
              pois={pois}
              activeLayer={activeLayer}
              onLayerChange={onLayerChange}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherPanel weather={weather} />
          )}

          {activeTab === 'radiation' && (
            <RadiationPanel radiation={radiation} />
          )}

          {activeTab === 'safety' && (
            <SafetyPanel
              safetyAnalysis={routeHook.safetyAnalysis}
              calculatedRoute={routeHook.calculatedRoute}
            />
          )}
        </div>
      )}
    </aside>
  );
}
