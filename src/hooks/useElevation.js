import { useState, useEffect, useCallback } from 'react';
import { getElevationAt, getTerrainType } from '../utils/marsCoords';

export function useElevation() {
  const [elevationMeta, setElevationMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/elevation-gale.json')
      .then((res) => res.json())
      .then((data) => {
        setElevationMeta(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando elevación de Gale:', err);
        setLoading(false);
      });
  }, []);

  const getElevation = useCallback((lat, lng) => {
    return getElevationAt(lat, lng);
  }, []);

  const getTerrain = useCallback((lat, lng, elev, slope) => {
    return getTerrainType(lat, lng, elev, slope);
  }, []);

  return { elevationMeta, loading, getElevation, getTerrain };
}
