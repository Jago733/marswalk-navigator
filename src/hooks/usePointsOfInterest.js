import { useState, useEffect } from 'react';

export function usePointsOfInterest() {
  const [pois, setPois] = useState([]);
  const [curiosityRoute, setCuriosityRoute] = useState([]);
  const [minerals, setMinerals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/points-of-interest.json').then((r) => r.json()),
      fetch('/data/curiosity-route.json').then((r) => r.json()),
      fetch('/data/minerals.json').then((r) => r.json()),
    ])
      .then(([poisData, curiosityData, mineralsData]) => {
        setPois(poisData);
        setCuriosityRoute(curiosityData);
        setMinerals(mineralsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando POIs y capas:', err);
        setLoading(false);
      });
  }, []);

  return { pois, curiosityRoute, minerals, loading };
}
