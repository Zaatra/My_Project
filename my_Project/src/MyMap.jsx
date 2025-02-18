import { useState, useCallback, useMemo, useEffect } from 'react';
import MapGL, { Layer, Source, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import worldGeoJSON from '../world_countries.json';

const MAPTILER_ACCESS_TOKEN = import.meta.env.VITE_MAPTILER_ACCESS_TOKEN;
const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_ACCESS_TOKEN}`;

const CURRENT_USER = 'Ameer';

const MyMap = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);

    const formatUTCDateTime = useCallback(date =>
        date.toISOString()
            .replace('T', ' ')
            .replace(/\.\d{3}Z$/, ''),
        []
    );

    useEffect(() => {
        setCurrentTime(formatUTCDateTime(new Date()));
        const timer = setInterval(() => {
            setCurrentTime(formatUTCDateTime(new Date()));
        }, 1000);
        return () => clearInterval(timer);
    }, [formatUTCDateTime]);

    const [viewState, setViewState] = useState({
        longitude: 0,
        latitude: 20,
        zoom: 1.5,
        bearing: 0,
        pitch: 0
    });

    const carbonIntensityData = useMemo(() => ({
        'AUS': 1200,
        'SGS': 100,
        'FRO': 200,
        'SWE': 50,
        'GBR': 400,
        'CAN': 600,
        'ALA': 150,
        'USA': 800,
        'CHN': 1300,
        'IND': 1400,
        'BRA': 700,
        'RUS': 900,
        'JPN': 500,
        'DEU': 300,
        'FRA': 80,
        'ZAF': 1100,
        'IDN': 950,
        'default': 400
    }), []);

    const getColorForIntensity = useCallback(intensity => {
        const maxIntensity = 1500;
        const minIntensity = 0;
        const normalizedIntensity = Math.max(minIntensity, Math.min(maxIntensity, intensity || carbonIntensityData.default));
        const ratio = (normalizedIntensity - minIntensity) / (maxIntensity - minIntensity);

        let r, g;
        const b = 0;

        if (ratio < 0.5) {
            r = Math.round(ratio * 2 * 255);
            g = 255;
        } else {
            g = Math.round(Math.max(0, (1 - (ratio - 0.5) * 2)) * 255);
            r = 255;
        }

        return `rgb(${r},${g},${b})`;
    }, [carbonIntensityData]);

    // Initialize GeoJSON data with colors
    useEffect(() => {
        const features = worldGeoJSON.features.map(feature => ({
            ...feature,
            properties: {
                ...feature.properties,
                fillColor: getColorForIntensity(carbonIntensityData[feature.properties.adm0_a3])
            }
        }));

        setGeoJsonData({
            type: 'FeatureCollection',
            features
        });
    }, [carbonIntensityData, getColorForIntensity]);

    const handleCountryClick = useCallback(event => {
        const feature = event.features?.[0];
        if (!feature) {
            return;
        }

        const countryCode = feature.properties.adm0_a3;
        const countryName = feature.properties.name;
        const intensity = carbonIntensityData[countryCode] || carbonIntensityData.default;

        // Generate sample data
        const now = new Date();
        const carbonData = {
            carbonConsumption: (Math.random() * 1000).toFixed(2),
            carbonFootprint: (Math.random() * 500).toFixed(2),
            carbonIntensity: intensity,
            timestamp: formatUTCDateTime(now),
            lastUpdate: now.toLocaleTimeString(),
            user: CURRENT_USER
        };

        toast.info(
            <div style={{ padding: '10px' }}>
                <h4 style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    {countryName} ({countryCode})
                </h4>
                <p><strong>Carbon Consumption:</strong> {carbonData.carbonConsumption} MT</p>
                <p><strong>Carbon Footprint:</strong> {carbonData.carbonFootprint} MT per capita</p>
                <p><strong>Carbon Intensity:</strong> {carbonData.carbonIntensity} gCO2eq/kWh</p>
                <p style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>
                    <small>Data as of: {carbonData.timestamp} UTC</small>
                </p>
                <p style={{ fontSize: '0.8em', color: '#666' }}>
                    <small>Viewed by: {carbonData.user}</small>
                </p>
            </div>,
            {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
                style: { minWidth: '300px' }
            }
        );
    }, [carbonIntensityData, formatUTCDateTime]);

    const layerStyle = useMemo(() => ({
        id: 'countries',
        type: 'fill',
        paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.9,
                0.6
            ]
        }
    }), []);

    const onHover = useCallback(event => {
        if (event.features?.length > 0) {
            if (hoveredCountry !== null) {
                event.target.setFeatureState(
                    { source: 'countries', id: hoveredCountry },
                    { hover: false }
                );
            }
            const id = event.features[0].id;
            event.target.setFeatureState(
                { source: 'countries', id },
                { hover: true }
            );
            setHoveredCountry(id);
        }
    }, [hoveredCountry]);

    const onMouseLeave = useCallback(event => {
        if (hoveredCountry !== null) {
            event.target.setFeatureState(
                { source: 'countries', id: hoveredCountry },
                { hover: false }
            );
            setHoveredCountry(null);
        }
    }, [hoveredCountry]);

    const handleMove = useCallback(evt => {
        setViewState(evt.viewState);
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <MapGL
                {...viewState}
                onMove={handleMove}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE_URL}
                interactiveLayerIds={['countries']}
                onClick={handleCountryClick}
                onMouseMove={onHover}
                onMouseLeave={onMouseLeave}
                cursor={hoveredCountry ? 'pointer' : 'grab'}
            >
                {geoJsonData && (
                    <Source id="countries" type="geojson" data={geoJsonData}>
                        <Layer {...layerStyle} />
                    </Source>
                )}
                <NavigationControl position="top-right" />
            </MapGL>

            <ToastContainer />

            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                zIndex: 1
            }}>
                <span style={{ fontWeight: 'bold' }}>Carbon Intensity Scale:</span>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    <span>Low</span>
                    <div style={{
                        width: '200px',
                        height: '15px',
                        background: 'linear-gradient(to right, green, yellow, red)',
                        borderRadius: '3px'
                    }} />
                    <span>High</span>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '10px',
                right: '60px',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '12px',
                zIndex: 1
            }}>
                <div style={{ fontWeight: 'bold' }}>User: {CURRENT_USER}</div>
                <div>UTC: {currentTime}</div>
            </div>
        </div>
    );
};

export default MyMap;