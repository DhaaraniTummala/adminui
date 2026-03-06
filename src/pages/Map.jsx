import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import placesData from './Places.json';

const MapComponent = () => {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [map, setMap] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const googleMapsApiKey = 'AIzaSyBhw9G-po6CuDH-JGXWxbSKNdSXhUU05oI';

  useEffect(() => {
    const formattedPlaces = placesData.data.features.map((place) => ({
      name: place.properties.placeName,
      lat: place.geometry.coordinates[1],
      lng: place.geometry.coordinates[0],
      address: place.properties.address,
    }));
    setPlaces(formattedPlaces);
  }, []);

  useEffect(() => {
    if (selectedPlace && map) {
      map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
      map.setZoom(15);
    }
  }, [selectedPlace, map]);

  const handleSearch = () => {
    debugger;
    const foundPlace = places.find((p) => p.name.toLowerCase() === search.toLowerCase());

    if (foundPlace) {
      setSelectedPlace(foundPlace);
    } else {
      alert('Place not found!');
      setSelectedPlace(null);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter place name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ border: '1px solid gray', padding: '5px', marginBottom: '5px' }}
      />
      <button
        onClick={handleSearch}
        style={{
          border: '1px solid gray',
          padding: '5px',
          marginBottom: '5px',
          marginLeft: '5px',
          backgroundColor: 'gray',
        }}
      >
        Search
      </button>

      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={{
            height: '600px',
            width: '100%',
          }}
          onLoad={(mapInstance) => setMap(mapInstance)}
          center={{ lat: 33.7619564, lng: -84.3596382 }}
          zoom={12}
        >
          {selectedPlace && (
            <Marker
              position={{
                lat: selectedPlace.lat,
                lng: selectedPlace.lng,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
