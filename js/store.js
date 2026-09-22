/**
 * Smart Land GIS - Central Application Store
 */
import { INITIAL_DATASETS } from "./data/initial-datasets.js";
import { APP_CONFIG } from "./config.js";
import { estimatePlotDimensions, getPolygonCentroid, distanceToLineString, calculateDistance, isPointInPolygon } from "./spatial-utils.js";

class Store {
  constructor() {
    this.subscribers = new Map();
    this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem(APP_CONFIG.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.datasets = parsed.datasets || INITIAL_DATASETS;
        this.activeDatasetId = parsed.activeDatasetId || INITIAL_DATASETS[0].id;
        this.trash = parsed.trash || [];
        this.history = parsed.history || [];
        this.currentUser = parsed.currentUser || {
          name: "Aditya Sharma",
          role: "superadmin", // 'superadmin', 'admin', 'viewer'
          email: "aditya@smartland.gov.in"
        };
      } catch (e) {
        console.error("Error loading saved state, falling back to defaults", e);
        this.initDefaults();
      }
    } else {
      this.initDefaults();
    }

    // UI Runtime State (Not persisted)
    this.activeView = "dashboard"; // dashboard, map, registry, datasets, history, trash, users
    this.selectedPlotId = null;
    this.activeBasemap = "street";
    this.colorPlotsBy = "zoning"; // 'zoning', 'floodRisk', 'status'
    
    this.layerVisibility = {
      plots: true,
      roads: true,
      drainage: true,
      electricPoles: true,
      lightPoles: true,
      floodRegions: true,
      electricBuffer: true,
      lightRadius: true,
      kmlFlightPlan: true
    };

    this.layerOpacity = {
      plots: 0.7,
      roads: 1.0,
      drainage: 0.9,
      floodRegions: 0.45
    };

    this.isDrawingPlot = false;
    this.kmlFlightPlan = null;
  }

  initDefaults() {
    this.datasets = JSON.parse(JSON.stringify(INITIAL_DATASETS));
    this.activeDatasetId = this.datasets[0].id;
    this.trash = [];
    this.history = [
      {
        id: "hist-001",
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        user: "Admin",
        action: "Master Plan Initialized",
        target: "Sector 14 - Greenfield",
        details: "Loaded 6 standard cadastral parcels, arterial road network, and drainage trunk."
      },
      {
        id: "hist-002",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        user: "Aditya Sharma",
        action: "Flood Hazard Assessed",
        target: "Plot #104",
        details: "Assigned Zone A (High Risk 100-Year Inundation) due to river buffer proximity."
      }
    ];
    this.currentUser = {
      name: "Aditya Sharma",
      role: "superadmin",
      email: "aditya@smartland.gov.in"
    };
    this.saveState();
  }

  saveState() {
    try {
      const stateToSave = {
        datasets: this.datasets,
        activeDatasetId: this.activeDatasetId,
        trash: this.trash,
        history: this.history,
        currentUser: this.currentUser
      };
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Unable to save state to localStorage", e);
    }
  }

  // Reactive Event Bus
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    return () => {
      const arr = this.subscribers.get(event);
      this.subscribers.set(event, arr.filter(cb => cb !== callback));
    };
  }

  emit(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => cb(data));
    }
  }

  // Active Dataset Getters
  getActiveDataset() {
    return this.datasets.find(d => d.id === this.activeDatasetId) || this.datasets[0];
  }

  getPlots() {
    return this.getActiveDataset().plots || [];
  }

  getRoads() {
    return this.getActiveDataset().roads || [];
  }

  getDrainage() {
    return this.getActiveDataset().drainage || [];
  }

  getElectricityPoles() {
    return this.getActiveDataset().electricityPoles || [];
  }

  getLightPoles() {
    return this.getActiveDataset().lightPoles || [];
  }

  getFloodRegions() {
    return this.getActiveDataset().floodRegions || [];
  }

  // KML Flight Plan Methods
  setKmlFlightPlan(kmlData) {
    this.kmlFlightPlan = kmlData;
    this.logHistory(
      "KML Uploaded",
      kmlData.fileName || "Flight Plan",
      `Imported ${kmlData.counts.points} waypoints, ${kmlData.counts.lines} lines, ${kmlData.counts.areas} area polygon.`
    );
    this.emit("kml:change", kmlData);
  }

  clearKmlFlightPlan() {
    this.kmlFlightPlan = null;
    this.emit("kml:change", null);
  }

  // View Navigation
  setView(viewName) {
    this.activeView = viewName;
    this.emit("view:change", viewName);
  }

  // Active Dataset Selection
  setActiveDataset(datasetId) {
    this.activeDatasetId = datasetId;
    this.selectedPlotId = null;
    this.saveState();
    this.emit("dataset:change", this.getActiveDataset());
  }

  // Select Plot
  selectPlot(plotId) {
    this.selectedPlotId = plotId;
    this.emit("plot:select", plotId ? this.getPlotById(plotId) : null);
  }

  getPlotById(plotId) {
    return this.getPlots().find(p => p.id === plotId);
  }

  // Add New Plot with Automatic Spatial Proximity Enrichment
  addPlot(plotData) {
    const dataset = this.getActiveDataset();
    
    // Auto-calculate dimensions if coordinates provided
    if (plotData.coordinates && plotData.coordinates.length >= 3) {
      const dims = estimatePlotDimensions(plotData.coordinates);
      plotData.length = plotData.length || dims.length;
      plotData.width = plotData.width || dims.width;
      plotData.area = plotData.area || dims.area;
      plotData.perimeter = plotData.perimeter || dims.perimeter;
      
      // Auto-analyze spatial relationships with other 5 parameters!
      const centroid = getPolygonCentroid(plotData.coordinates);

      // 1. Road analysis
      if (!plotData.roadAccess || !plotData.roadAccess.roadName) {
        let nearestRoad = null;
        let minRoadDist = Infinity;
        for (let road of dataset.roads) {
          const d = distanceToLineString(centroid, road.coordinates);
          if (d < minRoadDist) {
            minRoadDist = d;
            nearestRoad = road;
          }
        }
        if (nearestRoad) {
          plotData.roadAccess = {
            roadName: nearestRoad.name,
            roadType: nearestRoad.type,
            distanceMeters: minRoadDist,
            frontageWidth: plotData.width,
            status: minRoadDist <= APP_CONFIG.thresholds.roadAccessMaxDistance ? "Direct Frontage" : "Secondary Access"
          };
        }
      }

      // 2. Drainage analysis
      if (!plotData.drainage || !plotData.drainage.type) {
        let nearestDrain = null;
        let minDrainDist = Infinity;
        for (let drain of dataset.drainage) {
          const d = distanceToLineString(centroid, drain.coordinates);
          if (d < minDrainDist) {
            minDrainDist = d;
            nearestDrain = drain;
          }
        }
        if (nearestDrain) {
          plotData.drainage = {
            drainId: nearestDrain.id,
            type: nearestDrain.type,
            distanceMeters: minDrainDist,
            status: minDrainDist <= APP_CONFIG.thresholds.drainageAdequateDistance ? "Connected" : "Lacks Drainage"
          };
        }
      }

      // 3. Electricity Pole analysis
      if (!plotData.electricityPole || !plotData.electricityPole.poleId) {
        let nearestPole = null;
        let minPoleDist = Infinity;
        for (let pole of dataset.electricityPoles) {
          const d = calculateDistance(centroid, pole.coordinates);
          if (d < minPoleDist) {
            minPoleDist = d;
            nearestPole = pole;
          }
        }
        if (nearestPole) {
          plotData.electricityPole = {
            poleId: nearestPole.id,
            voltage: nearestPole.voltage,
            distanceMeters: Math.round(minPoleDist * 10) / 10,
            clearanceCompliant: minPoleDist >= APP_CONFIG.thresholds.electricSafetyClearance
          };
        }
      }

      // 4. Light Pole analysis
      if (!plotData.lightPole || !plotData.lightPole.poleId) {
        let nearestLight = null;
        let minLightDist = Infinity;
        for (let light of dataset.lightPoles) {
          const d = calculateDistance(centroid, light.coordinates);
          if (d < minLightDist) {
            minLightDist = d;
            nearestLight = light;
          }
        }
        if (nearestLight) {
          plotData.lightPole = {
            poleId: nearestLight.id,
            type: nearestLight.type,
            distanceMeters: Math.round(minLightDist * 10) / 10,
            illuminated: minLightDist <= (nearestLight.illuminationRadius || APP_CONFIG.thresholds.lightIlluminationRadius)
          };
        }
      }

      // 5. Flood Region intersection analysis
      if (!plotData.floodRegion || !plotData.floodRegion.zoneCategory) {
        let matchedFloodZone = null;
        for (let flood of dataset.floodRegions) {
          if (isPointInPolygon(centroid, flood.coordinates)) {
            matchedFloodZone = flood;
            break;
          }
        }
        if (matchedFloodZone) {
          plotData.floodRegion = {
            zoneCategory: matchedFloodZone.riskLevel,
            zoneCode: matchedFloodZone.code,
            inundationDepthMeters: matchedFloodZone.riskLevel === "High Risk" ? 1.5 : 0.5,
            status: matchedFloodZone.description
          };
        } else {
          plotData.floodRegion = {
            zoneCategory: "Low Risk",
            zoneCode: "Zone C",
            inundationDepthMeters: 0.0,
            status: "Safe from Flood"
          };
        }
      }
    }

    if (!plotData.id) {
      plotData.id = `PLT-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (!plotData.plotNumber) {
      plotData.plotNumber = `Plot #${plotData.id.split('-')[1] || 'New'}`;
    }

    dataset.plots.push(plotData);

    this.logHistory(
      "Plot Registered",
      plotData.plotNumber,
      `Added with dimensions ${plotData.length}m x ${plotData.width}m (${plotData.area} m²)`
    );

    this.saveState();
    this.emit("plots:change", dataset.plots);
    return plotData;
  }

  // Update Existing Plot
  updatePlot(plotId, updatedFields) {
    const dataset = this.getActiveDataset();
    const idx = dataset.plots.findIndex(p => p.id === plotId);
    if (idx !== -1) {
      dataset.plots[idx] = { ...dataset.plots[idx], ...updatedFields };
      this.logHistory(
        "Plot Updated",
        dataset.plots[idx].plotNumber,
        `Attributes modified by ${this.currentUser.name}`
      );
      this.saveState();
      this.emit("plots:change", dataset.plots);
      if (this.selectedPlotId === plotId) {
        this.emit("plot:select", dataset.plots[idx]);
      }
    }
  }

  // Move Plot to Trash (Soft Delete)
  moveToTrash(plotId) {
    const dataset = this.getActiveDataset();
    const idx = dataset.plots.findIndex(p => p.id === plotId);
    if (idx !== -1) {
      const [removedPlot] = dataset.plots.splice(idx, 1);
      removedPlot.deletedAt = new Date().toISOString();
      removedPlot.originDatasetId = dataset.id;
      this.trash.push(removedPlot);

      this.logHistory(
        "Moved to Trash",
        removedPlot.plotNumber,
        `Transferred to trash bin by ${this.currentUser.name}`
      );

      if (this.selectedPlotId === plotId) {
        this.selectedPlotId = null;
        this.emit("plot:select", null);
      }

      this.saveState();
      this.emit("plots:change", dataset.plots);
      this.emit("trash:change", this.trash);
    }
  }

  // Restore Plot from Trash
  restorePlot(plotId) {
    const idx = this.trash.findIndex(p => p.id === plotId);
    if (idx !== -1) {
      const [restored] = this.trash.splice(idx, 1);
      delete restored.deletedAt;
      
      const targetDataset = this.datasets.find(d => d.id === restored.originDatasetId) || this.getActiveDataset();
      targetDataset.plots.push(restored);

      this.logHistory(
        "Plot Restored",
        restored.plotNumber,
        `Restored from trash back to ${targetDataset.name}`
      );

      this.saveState();
      this.emit("plots:change", this.getActiveDataset().plots);
      this.emit("trash:change", this.trash);
    }
  }

  // Permanently Delete Plot
  permanentlyDeletePlot(plotId) {
    const idx = this.trash.findIndex(p => p.id === plotId);
    if (idx !== -1) {
      const [deleted] = this.trash.splice(idx, 1);
      this.logHistory(
        "Permanently Deleted",
        deleted.plotNumber,
        `Record permanently removed from database`
      );
      this.saveState();
      this.emit("trash:change", this.trash);
    }
  }

  // Empty Entire Trash
  emptyTrash() {
    const count = this.trash.length;
    this.trash = [];
    this.logHistory(
      "Trash Emptied",
      "System",
      `Permanently cleared ${count} records from trash bin`
    );
    this.saveState();
    this.emit("trash:change", this.trash);
  }

  // Audit Logging
  logHistory(action, target, details) {
    const record = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user: this.currentUser.name,
      action,
      target,
      details
    };
    this.history.unshift(record);
    if (this.history.length > 200) this.history.pop();
    this.emit("history:change", this.history);
  }

  // Switch User Role
  setUserRole(newRole) {
    this.currentUser.role = newRole;
    this.saveState();
    this.emit("user:change", this.currentUser);
  }

  // KML Flight Plan Methods
  setKmlFlightPlan(kmlData) {
    this.kmlFlightPlan = kmlData;
    this.layerVisibility.kmlFlightPlan = true;
    this.logHistory(
      "KML Flight Plan Loaded",
      kmlData.fileName || "KML Layer",
      `Imported ${kmlData.points?.length || 0} points, ${kmlData.lines?.length || 0} lines, ${kmlData.areas?.length || 0} areas`
    );
    this.emit("kml:change", this.kmlFlightPlan);
  }

  clearKmlFlightPlan() {
    this.kmlFlightPlan = null;
    this.emit("kml:change", null);
  }

  // Reset to Factory Demo Data
  resetToDemo() {
    this.initDefaults();
    this.emit("dataset:change", this.getActiveDataset());
    this.emit("plots:change", this.getPlots());
    this.emit("trash:change", this.trash);
    this.emit("history:change", this.history);
  }
}

export const store = new Store();
