# YouTube Analytics Hub | Data with Baraa

This project is a React-based dashboard for visualizing YouTube channel analytics. It fetches data from a Google Sheets CSV link and provides insights into views, engagements, and content performance.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Data Source**:
   Open `src/App.jsx` and locate the `SHEET_CSV_URL` constant. Replace the placeholder with your Google Sheets CSV publish link.
   ```javascript
   const SHEET_CSV_URL = "YOUR_GOOGLE_SHEETS_CSV_LINK_HERE";
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173/`.

## Project Structure

- `src/App.jsx`: Main dashboard component containing analytics logic and UI.
- `src/main.jsx`: Application entry point.
- `src/index.css`: Global styles including Tailwind CSS setup.
- `vite.config.js`: Vite configuration with React and Tailwind CSS v4 plugins.
- `index.html`: Main HTML file.

## Features

- **Live Data Syncing**: Automatically fetches latest data from Google Sheets.
- **Interactive Metrics**: KPIs for total views, average views, and engagement rates.
- **Visual Trends**: Charts showing views over time and top-performing content.
- **Archive Search**: Search through the entire content history.
- **Modern UI**: Clean, responsive design using Tailwind CSS v4.
