# Smart Land GIS: Infrastructure & Parcel Management Portal

**Smart Land GIS** is a high-performance, browser-based geospatial cadastral and infrastructure management system built to mirror the architecture, visual aesthetics, and workflows of [Smart Road GIS](https://smart-road-gis.vercel.app/).

The portal specializes in cadastral plot management with real-time spatial analysis against 5 critical infrastructure and environmental networks:
1. **Plot Size & Geometry**: Length ($m$), Width ($m$), Area ($m^2$, Acres, $sq.ft$), Perimeter, Zoning, Title Owner, Survey Number.
2. **Road Network**: Arterial, collector, and access roadways with width, surface status, and plot frontage distance.
3. **Drainage Network**: Box culverts, concrete swales, and natural channels with flow direction and coverage status.
4. **Electricity Poles**: High-tension ($11kV$) & Low-tension ($440V$) power poles with dynamic $5m$ safety clearance buffer rings.
5. **Light Poles**: Smart LED & Solar luminaires with illumination radius buffers and dark-spot monitoring.
6. **Flood Regions**: Hydrological hazard zones (Zone A 100-Yr, Zone B 500-Yr, Zone C Safe) with automatic parcel intersection warnings and flood depth assessments.

---

## 🚀 Quick Start & How to Run

Because the portal is engineered with modern native ES Modules and CDN-backed GIS engines, you can run it immediately without any heavy build steps!

### Option 1: Built-in Python Server (Immediate)
Run the following command from this directory:
```powershell
python -m http.server 8080
```
Open your browser at:
```
http://localhost:8080/
```

### Option 2: Node / Vite (Optional)
```bash
npm install vite --save-dev
npm run dev
```

### Option 3: Deploy to Vercel / Netlify / GitHub Pages
Upload or push this directory directly to GitHub, Vercel, or Netlify. Zero backend configuration required.

---

## 🗺️ System Views & Features

- **Dashboard**: High-level cadastral KPIs, total land area in Acres and $m^2$, flood vulnerability percentage, zoning distribution chart, and a live "Plots Needing Attention" alert list.
- **Interactive GIS Map**:
  - Basemap switcher: Street (OSM), Satellite (Esri), Dark GIS (CartoDB), Topography (OpenTopoMap).
  - Spatial layer toggles and opacity sliders for all 6 parameters.
  - Interactive "Draw Plot" polygon creation tool with real-time area and length/width calculation.
  - Proximity analysis engine: clicking any plot displays distances to nearest road, drain line, power pole, light pole, and flood hazard zone.
- **Land Registry**: Attribute management table with multi-parameter filtering (by Zoning, Flood Risk, Development Status), column sorting, GeoJSON export, and CSV export.
- **Master Plans & Datasets**: Switch between urban master plans ("Sector 14 Greenfield", "Apex Industrial Hub") or drag-and-drop your own `.geojson` file.
- **Cadastral Audit Log**: Immutable log of parcel creation, boundary adjustments, and user actions.
- **Trash & Recovery**: Soft-delete recycle bin with a safe verification modal requiring typing `DELETE` for permanent removal.
- **Role-Based Access Control**: Instant role simulator switching between Super Admin, Cadastral Officer, and Field Surveyor.

---

## 📁 Directory Structure

```
smart-land-gis/
├── index.html                   # Master HTML5 web page & Leaflet mount
├── package.json                 # Project configuration
├── README.md                    # Project documentation
├── css/
│   ├── main.css                 # Design tokens, variables & typography matching smart-road-gis
│   ├── layout.css               # Collapsible sidebar, topbar, view containers
│   ├── components.css           # Buttons, modals, tables, badges, tabs, drawers
│   ├── map.css                  # Leaflet controls, layer switcher, legend, custom markers
│   └── dashboard.css            # KPI cards, charts, attention lists
└── js/
    ├── app.js                   # Application coordinator & router
    ├── config.js                # Map defaults, zoning colors, thresholds
    ├── store.js                 # Central reactive state store with spatial analysis
    ├── spatial-utils.js         # Haversine distance, Shoelace area, ray-casting intersection
    ├── data/
    │   └── initial-datasets.js  # Pre-loaded realistic master plans with all 6 parameters
    ├── components/
    │   ├── Sidebar.js           # Collapsible sidebar navigation
    │   ├── Topbar.js            # Global search, dataset picker, user pill
    │   ├── PlotDetailDrawer.js  # Slide-out inspector showing all 6 parameters
    │   ├── AddPlotModal.js      # Multi-tab plot creation wizard
    │   ├── DeleteConfirmModal.js# Safe deletion confirmation modal
    │   └── Toast.js             # Toast notification feedback
    └── views/
        ├── DashboardView.js     # Analytics dashboard with KPI cards and charts
        ├── MapView.js           # Interactive Leaflet GIS map view
        ├── LandRegistryView.js  # Filterable and searchable attribute table
        ├── DatasetsView.js      # GIS dataset manager & GeoJSON uploader
        ├── AuditLogView.js      # History and audit timeline
        ├── TrashView.js         # Soft-delete management and recovery
        └── UserManagementView.js# RBAC role switching
```
