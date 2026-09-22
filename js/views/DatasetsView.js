/**
 * Smart Land GIS - GIS Datasets Management View
 */
import { store } from "../store.js";
import { toast } from "../components/Toast.js";
import { formatArea } from "../spatial-utils.js";
import { parseKmlText } from "../kml-parser.js";

export class DatasetsView {
  constructor(containerId = "view-datasets") {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("dataset:change", () => this.render());
    store.subscribe("plots:change", () => this.render());
  }

  render() {
    const datasets = store.datasets;
    const activeId = store.activeDatasetId;

    this.container.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 24px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a;">GIS Master Plans & Datasets</h1>
            <p style="font-size: 13px; color: #64748b;">
              Manage cadastral datasets, switch between master plan sectors, or upload custom GeoJSON / KML flight plans.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" id="btn-reset-demo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Reset to Demo Plans
            </button>
            <button class="btn btn-primary btn-sm" id="btn-create-dataset">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Master Plan
            </button>
          </div>
        </div>

        <!-- Upload Drag and Drop Zone -->
        <div class="analytics-card" style="border: 2px dashed #cbd5e1; background: #ffffff; text-align: center; padding: 32px 20px; cursor: pointer;" id="upload-dropzone">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Upload Cadastral Dataset or KML Flight Plan</h3>
          <p style="font-size: 12.5px; color: #64748b; margin-bottom: 14px;">
            Drag & drop GeoJSON (.geojson, .json) or KML Flight Plan (.kml).
          </p>
          <input type="file" id="file-input-geojson" accept=".geojson,.json,.kml" style="display: none;">
          <button class="btn btn-outline btn-sm" id="btn-browse-file" style="margin: 0 auto;">Select GeoJSON / KML File</button>
        </div>

        <!-- Datasets Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
          ${datasets.map(ds => {
            const isActive = ds.id === activeId;
            const plots = ds.plots || [];
            const totalArea = plots.reduce((acc, p) => acc + (p.area || 0), 0);
            const areaFmt = formatArea(totalArea);

            return `
              <div class="analytics-card" style="border: 2px solid ${isActive ? '#2563eb' : '#e2e8f0'}; position: relative;">
                <div class="analytics-card-header" style="background: ${isActive ? '#eff6ff' : '#ffffff'};">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isActive ? '#2563eb' : '#64748b'}" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    <span style="font-size: 14.5px; font-weight: 700; color: #0f172a;">${ds.name}</span>
                  </div>
                  ${isActive ? '<span class="badge badge-primary">Active Plan</span>' : ''}
                </div>

                <div class="analytics-card-body" style="gap: 12px;">
                  <p style="font-size: 12.5px; color: #475569; min-height: 38px;">
                    ${ds.description || "Master plan cadastral mapping."}
                  </p>

                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 11.5px;">
                    <div>
                      <span style="color: #64748b; display: block;">Plots</span>
                      <strong style="font-size: 13px; color: #0f172a;">${plots.length}</strong>
                    </div>
                    <div>
                      <span style="color: #64748b; display: block;">Total Area</span>
                      <strong style="font-size: 13px; color: #2563eb;">${areaFmt.acres}</strong>
                    </div>
                    <div>
                      <span style="color: #64748b; display: block;">Roads</span>
                      <strong style="font-size: 13px; color: #0f172a;">${(ds.roads || []).length}</strong>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
                    <span style="font-size: 11px; color: #94a3b8;">Created: ${ds.created || '2026-03-01'}</span>
                    ${isActive ? `
                      <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.8;">Currently Loaded</button>
                    ` : `
                      <button class="btn btn-primary btn-sm btn-switch-ds" data-id="${ds.id}">
                        Switch to Plan
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const switchBtn = e.target.closest(".btn-switch-ds");
      const browseBtn = e.target.closest("#btn-browse-file") || e.target.closest("#upload-dropzone");
      const resetBtn = e.target.closest("#btn-reset-demo");
      const newPlanBtn = e.target.closest("#btn-create-dataset");

      if (switchBtn) {
        const dsId = switchBtn.dataset.id;
        store.setActiveDataset(dsId);
        toast.success(`Switched to master plan: ${store.getActiveDataset().name}`);
      } else if (browseBtn && !e.target.closest(".btn-switch-ds")) {
        const fileInput = this.container.querySelector("#file-input-geojson");
        if (fileInput) fileInput.click();
      } else if (resetBtn) {
        if (confirm("Reset all datasets back to default master plans? Any newly created plots will be reverted.")) {
          store.resetToDemo();
          toast.success("Reset to factory demo datasets.");
        }
      } else if (newPlanBtn) {
        const name = prompt("Enter Name for the New Master Plan Sector:", "Sector 18 Greenfield Hub");
        if (name && name.trim()) {
          const newDs = {
            id: `dataset-${Date.now()}`,
            name: name.trim(),
            description: "Custom urban land development sector.",
            center: [28.6139, 77.2090],
            zoom: 15,
            isDefault: false,
            created: new Date().toISOString().split("T")[0],
            plots: [],
            roads: [],
            drainage: [],
            electricityPoles: [],
            lightPoles: [],
            floodRegions: []
          };
          store.datasets.push(newDs);
          store.setActiveDataset(newDs.id);
          toast.success(`Created and switched to: ${newDs.name}`);
        }
      }
    });

    // File input handler
    const fileInput = this.container.querySelector("#file-input-geojson");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file);
      });
    }

    // Drag and drop
    const dropzone = this.container.querySelector("#upload-dropzone");
    if (dropzone) {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#2563eb";
        dropzone.style.background = "#eff6ff";
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.style.borderColor = "#cbd5e1";
        dropzone.style.background = "#ffffff";
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#cbd5e1";
        dropzone.style.background = "#ffffff";
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    }
  }

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;

        // Check if file is KML
        if (file.name.toLowerCase().endsWith(".kml") || text.includes("<kml")) {
          const parsedKml = parseKmlText(text, file.name);
          store.setKmlFlightPlan(parsedKml);
          toast.success(`Loaded KML Flight Plan: ${parsedKml.fileName} (${parsedKml.summary.points} points, ${parsedKml.summary.lines} lines, ${parsedKml.summary.areas} areas)`);
          store.setView("map");
          return;
        }

        const json = JSON.parse(text);
        let importedPlots = [];

        if (json.type === "FeatureCollection" && Array.isArray(json.features)) {
          importedPlots = json.features.map((f, i) => {
            const props = f.properties || {};
            // Convert GeoJSON [lon, lat] back to Leaflet [lat, lon]
            let coords = [];
            if (f.geometry && f.geometry.type === "Polygon" && f.geometry.coordinates[0]) {
              coords = f.geometry.coordinates[0].map(c => [c[1], c[0]]);
            }
            return {
              id: props.id || `PLT-IMP-${100 + i}`,
              plotNumber: props.plotNumber || `Imported #${i + 1}`,
              surveyNumber: props.surveyNumber || `SY-IMP-${i + 1}`,
              zone: props.zone || "Residential",
              status: props.status || "Available",
              length: props.length || 100,
              width: props.width || 100,
              area: props.areaSqM || 10000,
              perimeter: props.perimeter || 400,
              owner: props.owner || "Imported Owner",
              coordinates: coords,
              roadAccess: {
                roadName: props.roadName || "Access Road",
                roadType: "Collector Road",
                distanceMeters: 5.0,
                status: "Direct Frontage"
              },
              drainage: {
                drainId: "DRN-01",
                type: props.drainageType || "Closed Box Culvert",
                distanceMeters: 6.0,
                status: "Connected"
              },
              electricityPole: {
                poleId: props.electricPole || "EP-01",
                voltage: "440V LT",
                distanceMeters: 10.0,
                clearanceCompliant: true
              },
              lightPole: {
                poleId: props.lightPole || "LP-01",
                type: "LED Smart Luminaire",
                distanceMeters: 12.0,
                illuminated: true
              },
              floodRegion: {
                zoneCategory: "Low Risk",
                zoneCode: props.floodZone || "Zone C",
                inundationDepthMeters: 0.0,
                status: "Normal"
              }
            };
          });
        }

        if (importedPlots.length > 0) {
          const newDs = {
            id: `dataset-upload-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            description: `Imported from ${file.name} with ${importedPlots.length} parcel features.`,
            center: importedPlots[0].coordinates[0] || [28.6139, 77.2090],
            zoom: 15,
            isDefault: false,
            created: new Date().toISOString().split("T")[0],
            plots: importedPlots,
            roads: store.getActiveDataset().roads,
            drainage: store.getActiveDataset().drainage,
            electricityPoles: store.getActiveDataset().electricityPoles,
            lightPoles: store.getActiveDataset().lightPoles,
            floodRegions: store.getActiveDataset().floodRegions
          };

          store.datasets.push(newDs);
          store.setActiveDataset(newDs.id);
          toast.success(`Successfully imported ${importedPlots.length} parcels into ${newDs.name}!`);
        } else {
          toast.warning("No valid polygon features found in GeoJSON.");
        }
      } catch (err) {
        toast.error("Failed to parse file: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}
