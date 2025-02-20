import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MyMap = ({
  selectedDate,
  selectedTimeRange,
  viewMode,
  zoneViewEnabled,
  csvDataPath,
  isLiveMode,
  mapData,
  dataFound,
  countryData,
  currentDate
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(2.5);
  const [lat] = useState(48.5);
  const [zoom] = useState(4);
  const [countriesData, setCountriesData] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showDayNight, setShowDayNight] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO'
          }
        },
        layers: [
          {
            id: 'base-map',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [lng, lat],
      zoom: zoom,
      maxBounds: [[-30, 30], [50, 75]]
    });

    map.current.on('load', () => {
      loadGeoJSON();
      
      if (!window.mapControls) {
        window.mapControls = {
          fitBounds: () => {
            if (map.current && countriesData) {
              const bounds = new maplibregl.LngLatBounds();
              countriesData.features.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                  if (feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates.forEach(ring => {
                      ring.forEach(coord => {
                        bounds.extend(coord);
                      });
                    });
                  } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(polygon => {
                      polygon.forEach(ring => {
                        ring.forEach(coord => {
                          bounds.extend(coord);
                        });
                      });
                    });
                  }
                }
              });
              map.current.fitBounds(bounds, { padding: 20 });
            }
          },
          resetOrientation: () => {
            if (map.current) {
              map.current.easeTo({
                pitch: 0,
                bearing: 0,
                duration: 1000
              });
            }
          },
          toggle3DMode: () => {
            if (map.current) {
              setShow3D(!show3D);
              if (!show3D) {
                map.current.easeTo({
                  pitch: 45,
                  bearing: -17.6,
                  duration: 1000
                });
              } else {
                map.current.easeTo({
                  pitch: 0,
                  bearing: 0,
                  duration: 1000
                });
              }
            }
          },
          toggleDayNight: () => {
            setShowDayNight(!showDayNight);
          },
          toggleGrid: () => {
            setShowGrid(!showGrid);
          },
          toggleLabels: () => {
            setShowLabels(!showLabels);
          }
        };
      }

      // Initialize popup
      const newPopup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '400px'
      });
      setPopup(newPopup);
    });

    return () => {
      if (popup) {
        popup.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (countriesData && map.current && map.current.isStyleLoaded() && popup) {
      updateMapData();
    }
  }, [
    countriesData,
    selectedDate,
    viewMode,
    zoneViewEnabled,
    mapData,
    dataFound,
    showLabels,
    show3D,
    showGrid,
    showDayNight
  ]);

  const loadGeoJSON = async () => {
    try {
      const response = await fetch('/countries.geo.json');
      const data = await response.json();
      setCountriesData(data);
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
    }
  };

  const getColorForIntensity = (intensity) => {
    // If no intensity data is available, use a neutral color
    if (intensity === undefined || intensity === null || isNaN(intensity)) {
      return '#CCCCCC';
    }

    // Color scale from green (low) to red (high)
    if (intensity <= 50) return '#00CC00';
    if (intensity <= 100) return '#66CC00';
    if (intensity <= 150) return '#CCCC00';
    if (intensity <= 200) return '#CC6600';
    if (intensity <= 300) return '#CC3300';
    if (intensity <= 400) return '#CC0000';
    return '#990000';
  };

  const getFillOpacity = () => {
    return 0.7;
  };

  const getCountryIntensity = (countryName, selectedDate) => {
    if (!dataFound || !mapData || mapData.length === 0) {
      return null;
    }

    // Get data for the selected country on the selected date
    const countryEntries = mapData.filter(
      entry => entry.Country === countryName &&
      entry.date.toDateString() === selectedDate.toDateString()
    );

    if (countryEntries.length === 0) {
      return null;
    }

    // Get the entry closest to the selected time
    const targetHour = selectedDate.getHours();
    let closestEntry = countryEntries[0];
    let smallestHourDiff = Math.abs(closestEntry.date.getHours() - targetHour);

    countryEntries.forEach(entry => {
      const hourDiff = Math.abs(entry.date.getHours() - targetHour);
      if (hourDiff < smallestHourDiff) {
        smallestHourDiff = hourDiff;
        closestEntry = entry;
      }
    });

    return viewMode === 'production' ? closestEntry.directIntensity : closestEntry.lcaIntensity;
  };

  const updateMapData = () => {
    if (!map.current || !map.current.isStyleLoaded() || !countriesData) return;

    // Check if source already exists, if not add it
    if (!map.current.getSource('countries')) {
      map.current.addSource('countries', {
        type: 'geojson',
        data: countriesData
      });
    } else {
      // Update the source data
      map.current.getSource('countries').setData(countriesData);
    }

    // Remove existing layers if they exist
    if (map.current.getLayer('country-fills')) {
      map.current.removeLayer('country-fills');
    }
    if (map.current.getLayer('country-borders')) {
      map.current.removeLayer('country-borders');
    }
    if (map.current.getLayer('country-labels')) {
      map.current.removeLayer('country-labels');
    }
    if (map.current.getLayer('grid-lines')) {
      map.current.removeLayer('grid-lines');
    }
    if (map.current.getLayer('day-night-layer')) {
      map.current.removeLayer('day-night-layer');
    }

    // Add country fill layer
    map.current.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: 'countries',
      layout: {},
      paint: {
        'fill-color': [
          'case',
          ['has', 'name'],
          [
            'function',
            ['get', 'name'],
            ['literal', countriesData.features.reduce((acc, feature) => {
              const countryName = feature.properties.name;
              const intensity = getCountryIntensity(countryName, selectedDate);
              const color = getColorForIntensity(intensity);
              return { ...acc, [countryName]: color };
            }, {})]
          ],
          '#CCCCCC'
        ],
        'fill-opacity': getFillOpacity(),
        'fill-extrusion-height': show3D ? 
          [
            'case',
            ['has', 'name'],
            [
              'function',
              ['get', 'name'],
              ['literal', countriesData.features.reduce((acc, feature) => {
                const countryName = feature.properties.name;
                const intensity = getCountryIntensity(countryName, selectedDate) || 0;
                const height = intensity * 100;
                return { ...acc, [countryName]: height };
              }, {})]
            ],
            0
          ] : 0
      }
    });

    // Add country border layer
    map.current.addLayer({
      id: 'country-borders',
      type: 'line',
      source: 'countries',
      layout: {},
      paint: {
        'line-color': '#000',
        'line-width': 1
      }
    });

    // Add country labels layer if showLabels is true
    if (showLabels) {
      map.current.addLayer({
        id: 'country-labels',
        type: 'symbol',
        source: 'countries',
        layout: {
          'text-field': ['get', 'name'],
          'text-variable-anchor': ['center'],
          'text-justify': 'center',
          'text-size': 12
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      });
    }

    // Add grid lines layer if showGrid is true
    if (showGrid) {
      const gridSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      };

      // Generate grid lines
      for (let lat = 30; lat <= 75; lat += 5) {
        const lineFeature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[-30, lat], [50, lat]]
          },
          properties: {}
        };
        gridSource.data.features.push(lineFeature);
      }

      for (let lng = -30; lng <= 50; lng += 5) {
        const lineFeature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[lng, 30], [lng, 75]]
          },
          properties: {}
        };
        gridSource.data.features.push(lineFeature);
      }

      if (!map.current.getSource('grid')) {
        map.current.addSource('grid', gridSource);
      } else {
        map.current.getSource('grid').setData(gridSource.data);
      }

      map.current.addLayer({
        id: 'grid-lines',
        type: 'line',
        source: 'grid',
        layout: {},
        paint: {
          'line-color': '#ccc',
          'line-width': 0.5,
          'line-dasharray': [2, 2]
        }
      });
    }

    // Add day-night layer if showDayNight is true
    if (showDayNight) {
      // Create a simple day-night visualization
      const hour = selectedDate.getUTCHours();
      const dayNightSource = {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, 90],
                [0, 90],
                [0, -90],
                [-180, -90],
                [-180, 90]
              ]
            ]
          },
          properties: {}
        }
      };

      if (!map.current.getSource('day-night')) {
        map.current.addSource('day-night', dayNightSource);
      } else {
        map.current.getSource('day-night').setData(dayNightSource.data);
      }

      map.current.addLayer({
        id: 'day-night-layer',
        type: 'fill',
        source: 'day-night',
        layout: {},
        paint: {
          'fill-color': '#000',
          'fill-opacity': 0.2
        }
      });
    }

    // Add click handler for countries
    if (!map.current.listenerCount('click')) {
      map.current.on('click', 'country-fills', (e) => {
        if (!e.features.length) return;
        
        const feature = e.features[0];
        const countryName = feature.properties.name;
        
        // Find intensity data for the clicked country
        const intensity = getCountryIntensity(countryName, selectedDate);
        
        if (intensity === null) {
          popup.setLngLat(e.lngLat)
            .setHTML(`
              <div>
                <h3>${countryName} ()</h3>
                <p>Carbon Intensity (Direct): No data available</p>
              </div>
            `)
            .addTo(map.current);
          return;
        }
        
        // Find the full data entry for more details
        const countryEntries = mapData.filter(
          entry => entry.Country === countryName &&
                 entry.date.toDateString() === selectedDate.toDateString()
        );
        
        let closestEntry = null;
        if (countryEntries.length > 0) {
          const targetHour = selectedDate.getHours();
          closestEntry = countryEntries[0];
          let smallestHourDiff = Math.abs(closestEntry.date.getHours() - targetHour);
          
          countryEntries.forEach(entry => {
            const hourDiff = Math.abs(entry.date.getHours() - targetHour);
            if (hourDiff < smallestHourDiff) {
              smallestHourDiff = hourDiff;
              closestEntry = entry;
            }
          });
        }
        
        if (closestEntry) {
          const formattedDate = closestEntry.date.toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          });

          const zoneInfo = closestEntry['Zone Name'] !== countryName 
            ? `(${closestEntry['Zone Name']})` 
            : '';
            
          popup.setLngLat(e.lngLat)
            .setHTML(`
              <div>
                <h3>${countryName} ${zoneInfo}</h3>
                <p>Data as of: ${formattedDate}</p>
                <p>Carbon Intensity (Direct): ${closestEntry.directIntensity.toFixed(2)} gCO<sub>2</sub>eq/kWh</p>
                <p>Carbon Intensity (LCA): ${closestEntry.lcaIntensity.toFixed(2)} gCO<sub>2</sub>eq/kWh</p>
                <p>Low Carbon: ${closestEntry.lowCarbonPercentage.toFixed(2)}%</p>
                <p>Renewable: ${closestEntry.renewablePercentage.toFixed(2)}%</p>
                <p>Viewed by: ${localStorage.getItem('username') || 'Guest'}</p>
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'country-fills', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'country-fills', () => {
        map.current.getCanvas().style.cursor = '';
      });
    }
  };

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map" />
      {!dataFound && (
        <div className="no-data-overlay">
          <div className="no-data-message">
            No data available for the selected date and time
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMap;