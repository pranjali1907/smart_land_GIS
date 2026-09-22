/**
 * Smart Land GIS - Topbar Header Component
 */
import { store } from "../store.js";

export class Topbar {
  constructor(elementId = "app-topbar") {
    this.topbar = document.getElementById(elementId);
    this.isDropdownOpen = false;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("dataset:change", () => this.updateDatasetPicker());
    store.subscribe("plots:change", () => this.updateDatasetPicker());
  }

  render() {
    const activeDataset = store.getActiveDataset();
    const plotsCount = store.getPlots().length;

    this.topbar.innerHTML = `
      <div class="topbar-left">
        <div class="topbar-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="topbar-search-input" class="topbar-search-input" placeholder="Search land plots, survey numbers, owners, roads...">
        </div>
      </div>

      <div class="topbar-right">
        <!-- Dataset Picker Dropdown -->
        <div class="dataset-picker" id="topbar-dataset-picker">
          <button class="dataset-picker-btn" id="dataset-picker-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span id="topbar-active-dataset-label">${activeDataset.name}</span>
            <span class="badge badge-primary" id="topbar-plots-badge">${plotsCount} Plots</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <div class="dataset-picker-dropdown" id="dataset-dropdown-menu">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- Quick Add Plot Action -->
        <button class="btn btn-primary btn-sm" id="topbar-add-plot-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Plot
        </button>
      </div>
    `;

    this.updateDropdownMenu();
  }

  bindEvents() {
    const pickerBtn = this.topbar.querySelector("#dataset-picker-btn");
    const dropdown = this.topbar.querySelector("#dataset-dropdown-menu");
    const searchInput = this.topbar.querySelector("#topbar-search-input");
    const addPlotBtn = this.topbar.querySelector("#topbar-add-plot-btn");

    pickerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.isDropdownOpen = !this.isDropdownOpen;
      dropdown.classList.toggle("open", this.isDropdownOpen);
    });

    document.addEventListener("click", () => {
      if (this.isDropdownOpen) {
        this.isDropdownOpen = false;
        dropdown.classList.remove("open");
      }
    });

    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.trim();
      store.emit("search:query", keyword);
      // Auto switch to registry if user is typing a query
      if (keyword.length > 1 && store.activeView !== "registry" && store.activeView !== "map") {
        store.setView("registry");
      }
    });

    addPlotBtn.addEventListener("click", () => {
      store.emit("plot:edit", null);
    });
  }

  updateDatasetPicker() {
    const activeDataset = store.getActiveDataset();
    const plotsCount = store.getPlots().length;
    const label = this.topbar.querySelector("#topbar-active-dataset-label");
    const badge = this.topbar.querySelector("#topbar-plots-badge");

    if (label) label.textContent = activeDataset.name;
    if (badge) badge.textContent = `${plotsCount} Plots`;

    this.updateDropdownMenu();
  }

  updateDropdownMenu() {
    const dropdown = this.topbar.querySelector("#dataset-dropdown-menu");
    if (!dropdown) return;

    dropdown.innerHTML = `
      <div style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
        Switch Land Master Plan
      </div>
    ` + store.datasets.map(d => `
      <div class="dataset-item ${d.id === store.activeDatasetId ? 'active' : ''}" data-ds-id="${d.id}">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 12.5px; font-weight: 600;">${d.name}</span>
          <span style="font-size: 11px; color: #64748b;">${(d.plots || []).length} registered plots</span>
        </div>
        ${d.id === store.activeDatasetId ? '<span class="badge badge-primary">Active</span>' : ''}
      </div>
    `).join("") + `
      <div style="border-top: 1px solid #e2e8f0; margin-top: 4px; padding-top: 4px;">
        <div class="dataset-item" id="dropdown-manage-datasets-btn" style="color: #2563eb; font-weight: 600; font-size: 12px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
          Manage / Upload Datasets
        </div>
      </div>
    `;

    dropdown.querySelectorAll(".dataset-item[data-ds-id]").forEach(item => {
      item.addEventListener("click", () => {
        store.setActiveDataset(item.dataset.dsId);
      });
    });

    const manageBtn = dropdown.querySelector("#dropdown-manage-datasets-btn");
    if (manageBtn) {
      manageBtn.addEventListener("click", () => store.setView("datasets"));
    }
  }
}
