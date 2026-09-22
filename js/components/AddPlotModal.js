/**
 * Smart Land GIS - Add / Edit Plot Wizard Modal
 */
import { store } from "../store.js";
import { toast } from "./Toast.js";
import { estimatePlotDimensions } from "../spatial-utils.js";

export class AddPlotModal {
  constructor() {
    this.container = null;
    this.editingPlotId = null;
    this.activeTab = "tab-specs";
    this.drawnCoordinates = null;
    this.init();
  }

  init() {
    this.container = document.getElementById("add-plot-modal-root");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "add-plot-modal-root";
      document.body.appendChild(this.container);
    }
    this.render();
    this.bindEvents();

    store.subscribe("plot:edit", (plot) => {
      this.open(plot);
    });

    store.subscribe("plot:draw:complete", (coords) => {
      this.openWithDrawnCoords(coords);
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="add-plot-overlay">
        <div class="modal" style="max-width: 680px;">
          <div class="modal-header">
            <div class="modal-title-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
              <h3 class="modal-title" id="plot-modal-heading">Register New Land Plot</h3>
            </div>
            <button class="modal-close-btn" id="plot-modal-close-btn">&times;</button>
          </div>

          <div class="modal-tabs">
            <button class="modal-tab active" data-tab="tab-specs">1. Plot Size & Specs</button>
            <button class="modal-tab" data-tab="tab-infrastructure">2. Utilities & Grid</button>
            <button class="modal-tab" data-tab="tab-flood">3. Flood Hazard</button>
            <button class="modal-tab" data-tab="tab-coords">4. Spatial Geometry</button>
          </div>

          <div class="modal-body">
            <!-- TAB 1: Specs -->
            <div class="tab-pane active" id="tab-specs">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Plot Number / Identifier *</label>
                  <input type="text" id="inp-plot-num" class="form-control" placeholder="e.g. Plot #107" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Cadastral Survey Number</label>
                  <input type="text" id="inp-survey-num" class="form-control" placeholder="e.g. SY-206/3">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Zoning Classification *</label>
                  <select id="inp-zone" class="form-control">
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Mixed-Use">Mixed-Use</option>
                    <option value="Public/Utility">Public / Utility</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Development Status</label>
                  <select id="inp-status" class="form-control">
                    <option value="Available">Available</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Under Development">Under Development</option>
                    <option value="Disputed">Disputed</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Plot Length (m) *</label>
                  <input type="number" id="inp-length" class="form-control" placeholder="100.0" step="0.5" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Plot Width (m) *</label>
                  <input type="number" id="inp-width" class="form-control" placeholder="120.0" step="0.5" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Calculated Area (m²)</label>
                  <input type="number" id="inp-area" class="form-control" placeholder="12000.0" step="1" readonly style="background: #f1f5f9; font-weight: 700; color: #2563eb;">
                </div>
                <div class="form-group">
                  <label class="form-label">Area in Acres (auto)</label>
                  <input type="text" id="inp-acres" class="form-control" readonly style="background: #f1f5f9; font-weight: 600;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Owner / Title Holder Name</label>
                <input type="text" id="inp-owner" class="form-control" placeholder="e.g. State Land Development Authority">
              </div>
            </div>

            <!-- TAB 2: Infrastructure Links -->
            <div class="tab-pane" id="tab-infrastructure" style="display: none;">
              <h4 style="font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 8px;">Road Network</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Connecting Road Name</label>
                  <input type="text" id="inp-road-name" class="form-control" placeholder="e.g. North Central Avenue">
                </div>
                <div class="form-group">
                  <label class="form-label">Road Type</label>
                  <select id="inp-road-type" class="form-control">
                    <option value="Arterial Road">Arterial Road</option>
                    <option value="Collector Road">Collector Road</option>
                    <option value="Access Road">Access Road</option>
                  </select>
                </div>
              </div>

              <h4 style="font-size: 12.5px; font-weight: 700; color: #0284c7; margin: 12px 0 8px 0;">Drainage Connection</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Drainage Channel Type</label>
                  <select id="inp-drain-type" class="form-control">
                    <option value="Closed Box Culvert">Closed Box Culvert</option>
                    <option value="Open Concrete Swale">Open Concrete Swale</option>
                    <option value="Underground Storm Pipe">Underground Storm Pipe</option>
                    <option value="Open Natural Channel">Open Natural Channel</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Drainage Distance (m)</label>
                  <input type="number" id="inp-drain-dist" class="form-control" placeholder="5.0" step="0.5">
                </div>
              </div>

              <h4 style="font-size: 12.5px; font-weight: 700; color: #d97706; margin: 12px 0 8px 0;">Electrical Grid & Light Poles</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nearest Electricity Pole ID</label>
                  <input type="text" id="inp-pole-id" class="form-control" placeholder="e.g. EP-440-107">
                </div>
                <div class="form-group">
                  <label class="form-label">Line Voltage</label>
                  <select id="inp-pole-volt" class="form-control">
                    <option value="440V LT">440V LT (Standard)</option>
                    <option value="11kV HT">11kV HT (High Tension)</option>
                    <option value="33kV Transmission">33kV Transmission</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nearest Light Pole ID</label>
                  <input type="text" id="inp-light-id" class="form-control" placeholder="e.g. LP-LED-07">
                </div>
                <div class="form-group">
                  <label class="form-label">Luminaire Lamp Type</label>
                  <select id="inp-light-type" class="form-control">
                    <option value="LED Smart Luminaire">LED Smart Luminaire</option>
                    <option value="Solar PV Powered LED">Solar PV Powered LED</option>
                    <option value="High-Mast Floodlight">High-Mast Floodlight</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- TAB 3: Flood Hazard -->
            <div class="tab-pane" id="tab-flood" style="display: none;">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Flood Vulnerability Classification *</label>
                  <select id="inp-flood-risk" class="form-control">
                    <option value="Low Risk">Low Risk (Zone C - Minimal Flood Risk)</option>
                    <option value="Moderate Risk">Moderate Risk (Zone B - 500-Year Floodway)</option>
                    <option value="High Risk">High Risk (Zone A - 100-Year Inundation Area)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Est. Peak Inundation Depth (m)</label>
                  <input type="number" id="inp-flood-depth" class="form-control" placeholder="0.0" step="0.1">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Hydrological Advisory / Building Code Notes</label>
                <textarea id="inp-flood-notes" class="form-control" rows="3" placeholder="Specify any mandatory ground floor elevation requirements or drainage pumping stations..."></textarea>
              </div>
            </div>

            <!-- TAB 4: Spatial Coordinates -->
            <div class="tab-pane" id="tab-coords" style="display: none;">
              <p style="font-size: 12.5px; color: #64748b; margin-bottom: 10px;">
                Polygon boundary coordinates [latitude, longitude]. When drawn from the interactive map, these are populated automatically.
              </p>
              <div class="form-group">
                <textarea id="inp-coords-json" class="form-control" rows="6" style="font-family: monospace; font-size: 12px;"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="plot-modal-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="plot-modal-save-btn">Save Land Plot</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const overlay = this.container.querySelector("#add-plot-overlay");
    const closeBtn = this.container.querySelector("#plot-modal-close-btn");
    const cancelBtn = this.container.querySelector("#plot-modal-cancel-btn");
    const saveBtn = this.container.querySelector("#plot-modal-save-btn");
    const tabs = this.container.querySelectorAll(".modal-tab");

    const close = () => {
      overlay.classList.remove("open");
      this.editingPlotId = null;
      this.drawnCoordinates = null;
    };

    closeBtn.addEventListener("click", close);
    cancelBtn.addEventListener("click", close);

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const targetId = tab.dataset.tab;
        this.container.querySelectorAll(".tab-pane").forEach(p => {
          p.style.display = p.id === targetId ? "block" : "none";
        });
      });
    });

    // Auto-calculate Area on Length / Width change
    const lenInput = this.container.querySelector("#inp-length");
    const widthInput = this.container.querySelector("#inp-width");
    const areaInput = this.container.querySelector("#inp-area");
    const acresInput = this.container.querySelector("#inp-acres");

    const updateArea = () => {
      const l = parseFloat(lenInput.value) || 0;
      const w = parseFloat(widthInput.value) || 0;
      const area = Math.round(l * w * 10) / 10;
      areaInput.value = area;
      acresInput.value = `${(area / 4046.86).toFixed(2)} Acres (${Math.round(area * 10.7639).toLocaleString()} sq.ft)`;
    };

    lenInput.addEventListener("input", updateArea);
    widthInput.addEventListener("input", updateArea);

    saveBtn.addEventListener("click", () => this.handleSave());
  }

  open(plotToEdit = null) {
    const overlay = this.container.querySelector("#add-plot-overlay");
    const heading = this.container.querySelector("#plot-modal-heading");
    this.editingPlotId = plotToEdit ? plotToEdit.id : null;

    if (plotToEdit) {
      heading.textContent = `Edit Plot: ${plotToEdit.plotNumber}`;
      this.container.querySelector("#inp-plot-num").value = plotToEdit.plotNumber || "";
      this.container.querySelector("#inp-survey-num").value = plotToEdit.surveyNumber || "";
      this.container.querySelector("#inp-zone").value = plotToEdit.zone || "Residential";
      this.container.querySelector("#inp-status").value = plotToEdit.status || "Available";
      this.container.querySelector("#inp-length").value = plotToEdit.length || "";
      this.container.querySelector("#inp-width").value = plotToEdit.width || "";
      this.container.querySelector("#inp-area").value = plotToEdit.area || "";
      this.container.querySelector("#inp-acres").value = `${((plotToEdit.area || 0) / 4046.86).toFixed(2)} Acres`;
      this.container.querySelector("#inp-owner").value = plotToEdit.owner || "";

      // Road
      this.container.querySelector("#inp-road-name").value = plotToEdit.roadAccess?.roadName || "";
      this.container.querySelector("#inp-road-type").value = plotToEdit.roadAccess?.roadType || "Arterial Road";

      // Drain
      this.container.querySelector("#inp-drain-type").value = plotToEdit.drainage?.type || "Closed Box Culvert";
      this.container.querySelector("#inp-drain-dist").value = plotToEdit.drainage?.distanceMeters || "";

      // Electricity
      this.container.querySelector("#inp-pole-id").value = plotToEdit.electricityPole?.poleId || "";
      this.container.querySelector("#inp-pole-volt").value = plotToEdit.electricityPole?.voltage || "440V LT";

      // Light
      this.container.querySelector("#inp-light-id").value = plotToEdit.lightPole?.poleId || "";
      this.container.querySelector("#inp-light-type").value = plotToEdit.lightPole?.type || "LED Smart Luminaire";

      // Flood
      this.container.querySelector("#inp-flood-risk").value = plotToEdit.floodRegion?.zoneCategory || "Low Risk";
      this.container.querySelector("#inp-flood-depth").value = plotToEdit.floodRegion?.inundationDepthMeters || 0;
      this.container.querySelector("#inp-flood-notes").value = plotToEdit.floodRegion?.status || "";

      this.container.querySelector("#inp-coords-json").value = JSON.stringify(plotToEdit.coordinates || [], null, 2);
    } else {
      heading.textContent = "Register New Land Plot";
      this.resetForm();
    }

    // Reset to tab 1
    const tabs = this.container.querySelectorAll(".modal-tab");
    tabs[0].click();

    overlay.classList.add("open");
  }

  openWithDrawnCoords(coords) {
    this.open(null);
    this.drawnCoordinates = coords;
    const dims = estimatePlotDimensions(coords);
    this.container.querySelector("#inp-length").value = dims.length;
    this.container.querySelector("#inp-width").value = dims.width;
    this.container.querySelector("#inp-area").value = dims.area;
    this.container.querySelector("#inp-acres").value = `${(dims.area / 4046.86).toFixed(2)} Acres`;
    this.container.querySelector("#inp-coords-json").value = JSON.stringify(coords, null, 2);
  }

  resetForm() {
    this.container.querySelector("#inp-plot-num").value = `Plot #${Math.floor(100 + Math.random() * 900)}`;
    this.container.querySelector("#inp-survey-num").value = `SY-${Math.floor(200 + Math.random() * 100)}/1`;
    this.container.querySelector("#inp-zone").value = "Residential";
    this.container.querySelector("#inp-status").value = "Available";
    this.container.querySelector("#inp-length").value = "100";
    this.container.querySelector("#inp-width").value = "120";
    this.container.querySelector("#inp-area").value = "12000";
    this.container.querySelector("#inp-acres").value = "2.97 Acres";
    this.container.querySelector("#inp-owner").value = "";
    this.container.querySelector("#inp-road-name").value = "";
    this.container.querySelector("#inp-drain-type").value = "Closed Box Culvert";
    this.container.querySelector("#inp-drain-dist").value = "5";
    this.container.querySelector("#inp-pole-id").value = "";
    this.container.querySelector("#inp-pole-volt").value = "440V LT";
    this.container.querySelector("#inp-light-id").value = "";
    this.container.querySelector("#inp-light-type").value = "LED Smart Luminaire";
    this.container.querySelector("#inp-flood-risk").value = "Low Risk";
    this.container.querySelector("#inp-flood-depth").value = "0.0";
    this.container.querySelector("#inp-flood-notes").value = "Safe zone with adequate drainage runoff.";
    this.container.querySelector("#inp-coords-json").value = "[]";
  }

  handleSave() {
    const plotNumber = this.container.querySelector("#inp-plot-num").value.trim();
    if (!plotNumber) {
      toast.error("Plot Number is required.");
      return;
    }

    const length = parseFloat(this.container.querySelector("#inp-length").value) || 0;
    const width = parseFloat(this.container.querySelector("#inp-width").value) || 0;
    const area = parseFloat(this.container.querySelector("#inp-area").value) || (length * width);

    let coords = [];
    try {
      coords = JSON.parse(this.container.querySelector("#inp-coords-json").value || "[]");
    } catch (e) {
      coords = [];
    }

    // Generate fallback rectangle around dataset center if no coords
    if (!coords || coords.length < 3) {
      const center = store.getActiveDataset().center;
      const latOffset = (length / 111000) / 2;
      const lngOffset = (width / (111000 * Math.cos(center[0] * Math.PI / 180))) / 2;
      coords = [
        [center[0] + latOffset, center[1] - lngOffset],
        [center[0] + latOffset, center[1] + lngOffset],
        [center[0] - latOffset, center[1] + lngOffset],
        [center[0] - latOffset, center[1] - lngOffset]
      ];
    }

    const floodRisk = this.container.querySelector("#inp-flood-risk").value;
    const floodCode = floodRisk === "High Risk" ? "Zone A" : floodRisk === "Moderate Risk" ? "Zone B" : "Zone C";

    const plotData = {
      plotNumber,
      surveyNumber: this.container.querySelector("#inp-survey-num").value.trim(),
      zone: this.container.querySelector("#inp-zone").value,
      status: this.container.querySelector("#inp-status").value,
      length,
      width,
      area,
      perimeter: Math.round((2 * (length + width)) * 10) / 10,
      owner: this.container.querySelector("#inp-owner").value.trim() || "Unregistered",
      coordinates: coords,
      roadAccess: {
        roadName: this.container.querySelector("#inp-road-name").value.trim() || "North Central Avenue",
        roadType: this.container.querySelector("#inp-road-type").value,
        distanceMeters: 5.0,
        frontageWidth: width,
        status: "Direct Frontage"
      },
      drainage: {
        drainId: "DRN-MAIN",
        type: this.container.querySelector("#inp-drain-type").value,
        distanceMeters: parseFloat(this.container.querySelector("#inp-drain-dist").value) || 6.0,
        status: "Connected"
      },
      electricityPole: {
        poleId: this.container.querySelector("#inp-pole-id").value.trim() || "EP-AUTO",
        voltage: this.container.querySelector("#inp-pole-volt").value,
        distanceMeters: 8.0,
        clearanceCompliant: true
      },
      lightPole: {
        poleId: this.container.querySelector("#inp-light-id").value.trim() || "LP-AUTO",
        type: this.container.querySelector("#inp-light-type").value,
        distanceMeters: 12.0,
        illuminated: true
      },
      floodRegion: {
        zoneCategory: floodRisk,
        zoneCode: floodCode,
        inundationDepthMeters: parseFloat(this.container.querySelector("#inp-flood-depth").value) || 0.0,
        status: this.container.querySelector("#inp-flood-notes").value.trim() || "Normal"
      }
    };

    if (this.editingPlotId) {
      store.updatePlot(this.editingPlotId, plotData);
      toast.success(`Plot ${plotNumber} updated successfully.`);
    } else {
      store.addPlot(plotData);
      toast.success(`Plot ${plotNumber} registered successfully.`);
    }

    this.container.querySelector("#add-plot-overlay").classList.remove("open");
  }
}
