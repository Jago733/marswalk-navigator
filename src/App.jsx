import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { MarsMap2D } from './components/map/MarsMap2D';
import { RouteViewer3D } from './components/viewer3d/RouteViewer3D';
import { MissionPanel } from './components/panels/MissionPanel';
import { useRoute } from './hooks/useRoute';
import { usePointsOfInterest } from './hooks/usePointsOfInterest';
import { useWeather } from './hooks/useWeather';
import { useRadiation } from './hooks/useRadiation';

export default function App() {
  const [activeTab, setActiveTab] = useState('dual'); // 'dual' | 'map2d' | 'viewer3d' | 'mission'
  const [activeLayer, setActiveLayer] = useState('mars-global-custom');

  const { pois, curiosityRoute, minerals, loading: loadingPois } = usePointsOfInterest();
  const { weather, loading: loadingWeather } = useWeather();
  const { radiation, loading: loadingRadiation } = useRadiation();

  const routeHook = useRoute(pois);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-[#F5F5F7]">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sol={weather?.currentSol || 4120}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center / Left: Viewport according to activeTab */}
        <main className="flex-1 relative h-full overflow-hidden bg-black flex flex-col">
          {activeTab === 'dual' && (
            <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
              {/* Left 50%: 2D Satellite Map */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-white/10">
                <MarsMap2D
                  routeHook={routeHook}
                  pois={pois}
                  curiosityRoute={curiosityRoute}
                  minerals={minerals}
                  activeLayer={activeLayer}
                  onLayerChange={setActiveLayer}
                />
              </div>

              {/* Right 50%: 3D Route Corridor & Profile */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
                <RouteViewer3D
                  calculatedRoute={routeHook.calculatedRoute}
                  hoveredPoint={routeHook.hoveredPoint}
                  onHoverPoint={routeHook.setHoveredPoint}
                />
              </div>
            </div>
          )}

          {activeTab === 'map2d' && (
            <div className="w-full h-full relative">
              <MarsMap2D
                routeHook={routeHook}
                pois={pois}
                curiosityRoute={curiosityRoute}
                minerals={minerals}
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
              />
            </div>
          )}

          {activeTab === 'viewer3d' && (
            <div className="w-full h-full relative">
              <RouteViewer3D
                calculatedRoute={routeHook.calculatedRoute}
                hoveredPoint={routeHook.hoveredPoint}
                onHoverPoint={routeHook.setHoveredPoint}
              />
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="w-full h-full relative overflow-hidden bg-black/60">
              <MissionPanel />
            </div>
          )}
        </main>

        {/* Right HUD Sidebar */}
        <Sidebar
          routeHook={routeHook}
          pois={pois}
          weather={weather}
          radiation={radiation}
          curiosityRoute={curiosityRoute}
          minerals={minerals}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />
      </div>

      {/* Bottom Live Cursor Telemetry Bar */}
      <StatusBar
        hoveredPoint={routeHook.hoveredPoint}
        defaultCoords={{
          lat: routeHook.startPoint?.lat || -4.68,
          lng: routeHook.startPoint?.lng || 137.38,
          elevation: routeHook.startPoint?.elevation || -4450,
        }}
      />
    </div>
  );
}
