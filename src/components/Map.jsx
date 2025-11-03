import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import '../App.css';

function Map({ location }) {
  // Transformation de la chaîne en objet pour extraire les coordonnées
  const locationArray = location.split(', ').map(item => {
    const [key, value] = item.split(': ');
    return [key.trim(), parseFloat(value)];
  });

  const locationObject = Object.fromEntries(locationArray);

  const { Latitude, Longitude } = locationObject;

  // Vérification des coordonnées
  if (!Latitude || !Longitude) {
    return null; // Pas de carte si les coordonnées sont manquantes
  }

  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZmVybmFuZG1lc2FuZ2UiLCJhIjoiY20ydGFsdnJzMDB3czJxc2ZpaDExNWwzcyJ9.R1mCNm44sgm2rRTXqA0-8Q';
    mapRef.current = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/streets-v11', // Style de la carte
      container: mapContainerRef.current,
      center: [Longitude, Latitude],
      zoom: 14,
      collectResourceTiming: false, // Désactive la collecte de ressources
    });

    new mapboxgl.Marker({ color: 'red' })
      .setLngLat([Longitude, Latitude])
      .addTo(mapRef.current);

    return () => {
      mapRef.current.remove();
    };
  }, [Latitude, Longitude]);

  return (
    <>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{ width: '100%', height: '250px' }}
      />
    </>
  );
}

export default Map;
