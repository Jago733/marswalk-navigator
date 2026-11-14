import { useState, useCallback, useMemo } from 'react';
import { calculateMarsRoute } from '../utils/pathfinding';
import { getElevationAt, getTerrainType } from '../utils/marsCoords';
import { analyzeRouteSafety } from '../utils/safetyCheck';

export function useRoute(defaultPois = []) {
  // Puntos predeterminados sugeridos: Base Camp -> Bahía de Yellowknife
  const [startPoint, setStartPoint] = useState({
    id: 'base-camp',
    name: 'Campamento Base Artemisa-Marte',
    lat: -4.6200,
    lng: 137.4000,
    elevation: -4480,
  });

  const [endPoint, setEndPoint] = useState({
    id: 'yellowknife-bay',
    name: 'Bahía de Yellowknife (Astrobiología)',
    lat: -4.5900,
    lng: 137.4485,
    elevation: -4520,
  });

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcula la ruta inicial automáticamente
  const [calculatedRoute, setCalculatedRoute] = useState(() => {
    return calculateMarsRoute(
      { lat: -4.6200, lng: 137.4000 },
      { lat: -4.5900, lng: 137.4485 }
    );
  });

  const computeRoute = useCallback((origin, dest) => {
    const from = origin || startPoint;
    const to = dest || endPoint;
    if (!from || !to) return;

    setIsCalculating(true);
    setTimeout(() => {
      const result = calculateMarsRoute(
        { lat: from.lat, lng: from.lng },
        { lat: to.lat, lng: to.lng }
      );
      setCalculatedRoute(result);
      setIsCalculating(false);
    }, 120);
  }, [startPoint, endPoint]);

  const setCustomPoint = useCallback((type, lat, lng, name) => {
    const elev = getElevationAt(lat, lng);
    const point = {
      id: `custom-${type}-${Date.now()}`,
      name: name || (type === 'start' ? 'Punto A (Personalizado)' : 'Punto B (Personalizado)'),
      lat,
      lng,
      elevation: elev,
    };

    if (type === 'start') {
      setStartPoint(point);
      computeRoute(point, endPoint);
    } else {
      setEndPoint(point);
      computeRoute(startPoint, point);
    }
  }, [startPoint, endPoint, computeRoute]);

  const resetRoute = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setCalculatedRoute(null);
    setHoveredPoint(null);
    setSelectedPoi(null);
  }, []);

  const safetyAnalysis = useMemo(() => {
    return analyzeRouteSafety(calculatedRoute);
  }, [calculatedRoute]);

  return {
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    calculatedRoute,
    isCalculating,
    hoveredPoint,
    setHoveredPoint,
    selectedPoi,
    setSelectedPoi,
    setCustomPoint,
    computeRoute,
    resetRoute,
    safetyAnalysis,
  };
}
