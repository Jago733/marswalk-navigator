import { useState, useEffect } from 'react';

export function useRadiation() {
  const [radiation, setRadiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/radiation-rad.json')
      .then((res) => {
        if (!res.ok) throw new Error('Error al leer datos RAD');
        return res.json();
      })
      .then((data) => {
        setRadiation(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { radiation, loading, error };
}
