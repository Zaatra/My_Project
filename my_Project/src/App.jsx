import MyMap from './MyMap.jsx';
import './App.css';
import Header from './header.jsx'; // Import Header

function App() {
    return (
        <div className="App electricity-maps-app">
            <Header /> {/* Include the new Header */}
            <div className="app-body">
                <aside className="left-sidebar">
                    <div className="sidebar-header">
                        <h1>Electricity Grid Carbon Emissions</h1>
                        <p>See where your electricity comes from and how much CO2 was emitted to produce it</p>
                    </div>
                    <div className="search-bar">
                        <input type="text" placeholder="Search areas (ranked by carbon intensity)" />
                    </div>
                    <div className="ranked-list">
                        {/* Placeholder for ranked list - you can populate with your data */}
                        <ul>
                            <li><span>1</span> <span className="flag">🇦🇺</span> Australia <span className="location">Flinders Island</span></li>
                            <li><span>2</span> <span className="flag">🇬🇸</span> South Georgia and the South Sandwich Islands</li>
                            <li><span>3</span> <span className="flag">🇫🇴</span> Faroe Islands <span className="location">South Island</span></li>
                            <li><span>4</span> <span className="flag">🇸🇪</span> Sweden <span className="location">North Sweden</span></li>
                            <li><span>5</span> <span className="flag">🇸🇪</span> Sweden <span className="location">North Central Sweden</span></li>
                            <li><span>6</span> <span className="flag">🇬🇧</span> Great Britain <span className="location">Orkney Islands</span></li>
                            <li><span>7</span> <span className="flag">🇨🇦</span> Canada <span className="location">Prince Edward Island</span></li>
                            <li><span>8</span> <span className="flag">🇦🇽</span> Åland Islands</li>
                            <li><span>9</span> <span className="flag">🇸🇪</span> Sweden <span className="location">South Central Sweden</span></li>
                            {/* ... more list items ... */}
                        </ul>
                    </div>
                    <details className="about-section">
                        <summary>About Electricity Consumption Map</summary>
                        <div className="about-content">
                            <p>Electricity Consumption Map is a platform providing real-time and predictive electricity signals allowing any device to reduce their cost and emissions by informing them about the best time to consume electricity.</p>
                        </div>
                    </details>
                    <div className="datetime-controls">
                        <div className="timeline-buttons">
                            <button className="timeline-button">72h</button>
                            <button className="timeline-button">3mo</button>
                            <button className="timeline-button">12mo</button>
                            <button className="timeline-button">All</button>
                        </div>
                        <div className="date-time-picker">
                            <button>&lt;</button>
                            <span>Feb 18, 2025, 8:00 AM GMT+2</span>
                            <button>&gt;</button> <button>→</button> {/* Changed here */}
                        </div>
                        <div className="time-slider">
                            {/* Placeholder for time slider */}
                            <div className="slider-bar">
                                <div className="slider-handle"></div>
                            </div>
                            <div className="time-labels">
                                <span>2:00 PM</span>
                                <span></span> {/* Middle label if needed */}
                                <span>LIVE</span>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="map-container">
                    <MyMap />
                </main>
                <aside className="right-sidebar">
                    {/* Placeholder for right sidebar controls */}
                    <div className="zoom-controls">
                        {/* Zoom controls are already in MyMap, you can customize them there if needed */}
                    </div>
                    <div className="other-controls">
                        {/* Add other controls as needed, like icons for reset view, etc. */}
                        <button className="control-button">Fit Bounds</button>
                        <button className="control-button">Reset Orientation</button>
                        <button className="control-button">3D Mode</button>
                        <button className="control-button">Style</button>
                        <button className="control-button">Day/Night</button>
                        <button className="control-button">Grid</button>
                        <button className="control-button">Labels</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default App;