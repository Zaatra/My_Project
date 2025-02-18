# Global Carbon Intensity Map

A real-time interactive visualization tool for tracking and displaying carbon intensity across different countries. This project provides an intuitive interface to explore global carbon emissions and electricity consumption patterns.

![Carbon Intensity Map](project-screenshot.png)

## Overview

This application visualizes global carbon intensity data through an interactive map interface, allowing users to:
- View real-time carbon intensity levels by country
- Access detailed emissions data for each region
- Track changes in carbon footprint and consumption
- Compare different regions' environmental impact

## Features

- **Real-time Data Visualization**
  - Color-coded countries based on carbon intensity
  - Interactive hover and click effects
  - Dynamic data updates

- **Detailed Country Information**
  - Carbon consumption metrics
  - Carbon footprint per capita
  - Carbon intensity in gCO2eq/kWh
  - Timestamp for data currency

- **User Interface**
  - Intuitive navigation controls
  - Clear color scale legend
  - Real-time UTC clock
  - User session tracking

## Technical Stack

- React 18+
- MapLibre GL JS
- React-MapGL
- React-Toastify
- Vite

## Getting Started

### Prerequisites

```bash
node >= 14.0.0
npm >= 6.14.0
```

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your MapTiler API key:
```env
VITE_MAPTILER_ACCESS_TOKEN=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Usage

The map interface allows users to:
- Click on countries to view detailed carbon data
- Use the zoom controls to adjust the view
- Pan across the map to explore different regions
- View the color scale to understand intensity levels
- Track real-time updates with the UTC clock

## Data Sources

The application uses:
- GeoJSON data for country boundaries
- Sample carbon intensity data for demonstration
- Real-time UTC clock for temporal reference

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MapTiler for providing the map services
- React community for the excellent tooling
- Contributors and maintainers of the dependencies

## Project Status

Initial Development - Last Updated: 2025-02-18 11:01:21 UTC
Current Maintainer: Zaatra

## Screenshots

### Main Interface
![Main Interface](screenshot1.png)
*The main map interface showing global carbon intensity levels*

### Country Details
![Country Details](screenshot2.png)
*Detailed view of country-specific carbon data*

## Future Enhancements

- [ ] Historical data visualization
- [ ] Time-series analysis
- [ ] Regional comparison tools
- [ ] Data export capabilities
- [ ] Custom alert thresholds
- [ ] Mobile optimization

## Support

For support, please open an issue in the repository or contact the maintenance team.