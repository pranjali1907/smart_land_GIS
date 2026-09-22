/**
 * Smart Land GIS - Sidebar Navigation Component
 */
import { store } from "../store.js";

export class Sidebar {
  constructor(elementId = "app-sidebar") {
    this.sidebar = document.getElementById(elementId);
    this.isCollapsed = false;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("view:change", (view) => this.setActiveNav(view));
    store.subscribe("dataset:change", (ds) => this.updateDatasetBadge(ds));
    store.subscribe("trash:change", (trash) => this.updateTrashBadge(trash));
    store.subscribe("user:change", (user) => this.updateUserPill(user));
  }

  render() {
    const activeDataset = store.getActiveDataset();
    const user = store.currentUser;
    const trashCount = store.trash.length;

    this.sidebar.innerHTML = `
      <!-- Brand Header -->
      <div class="sidebar-header">
        <a href="#" class="brand" id="brand-link">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">Smart Land GIS</span>
            <span class="brand-sub">Cadastral & Utility Portal</span>
          </div>
        </a>
        <button class="sidebar-collapse-btn" id="sidebar-toggle-btn" title="Toggle Sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Active Dataset Indicator -->
      <div class="sidebar-dataset-box" id="sidebar-dataset-click" title="Switch Dataset">
        <span class="sidebar-dataset-label">Active Master Plan</span>
        <div class="sidebar-dataset-name">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span id="sidebar-dataset-title">${activeDataset.name}</span>
        </div>
      </div>

      <!-- Navigation Sections -->
      <div class="sidebar-nav">
        <!-- Main Section -->
        <div class="nav-section">
          <span class="nav-section-title">Core Views</span>
          
          <a href="#dashboard" class="nav-item active" data-view="dashboard">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
              </svg>
            </div>
            <span class="nav-item-label">Dashboard</span>
          </a>

          <a href="#map" class="nav-item" data-view="map">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
            </div>
            <span class="nav-item-label">Map View</span>
          </a>

          <a href="#registry" class="nav-item" data-view="registry">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span class="nav-item-label">Land Registry</span>
          </a>

          <a href="#history" class="nav-item" data-view="history">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 14"/>
              </svg>
            </div>
            <span class="nav-item-label">Audit Log</span>
          </a>
        </div>

        <!-- Manage Section -->
        <div class="nav-section">
          <span class="nav-section-title">Management</span>

          <a href="#datasets" class="nav-item" data-view="datasets">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <span class="nav-item-label">GIS Datasets</span>
          </a>

          <a href="#trash" class="nav-item" data-view="trash">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <span class="nav-item-label">Trash</span>
            <span class="nav-item-badge" id="sidebar-trash-badge" style="${trashCount > 0 ? '' : 'display:none;'}">${trashCount}</span>
          </a>

          <a href="#users" class="nav-item" data-view="users">
            <div class="nav-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="nav-item-label">User Access</span>
          </a>
        </div>
      </div>

      <!-- Footer User Profile -->
      <div class="sidebar-footer">
        <div class="user-avatar" id="sidebar-user-avatar">
          ${user.name ? user.name.charAt(0) : "A"}
        </div>
        <div class="user-info">
          <span class="user-name" id="sidebar-user-name">${user.name}</span>
          <span class="user-role-tag" id="sidebar-user-role">${user.role}</span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const toggleBtn = this.sidebar.querySelector("#sidebar-toggle-btn");
    const brandLink = this.sidebar.querySelector("#brand-link");
    const datasetBox = this.sidebar.querySelector("#sidebar-dataset-click");
    const navItems = this.sidebar.querySelectorAll(".nav-item");

    toggleBtn.addEventListener("click", () => {
      this.isCollapsed = !this.isCollapsed;
      this.sidebar.classList.toggle("collapsed", this.isCollapsed);
    });

    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      store.setView("dashboard");
    });

    datasetBox.addEventListener("click", () => {
      store.setView("datasets");
    });

    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        store.setView(view);
      });
    });
  }

  setActiveNav(viewName) {
    const navItems = this.sidebar.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.classList.toggle("active", item.dataset.view === viewName);
    });
  }

  updateDatasetBadge(dataset) {
    const titleEl = this.sidebar.querySelector("#sidebar-dataset-title");
    if (titleEl) titleEl.textContent = dataset.name;
  }

  updateTrashBadge(trash) {
    const badge = this.sidebar.querySelector("#sidebar-trash-badge");
    if (badge) {
      badge.textContent = trash.length;
      badge.style.display = trash.length > 0 ? "inline-block" : "none";
    }
  }

  updateUserPill(user) {
    const nameEl = this.sidebar.querySelector("#sidebar-user-name");
    const roleEl = this.sidebar.querySelector("#sidebar-user-role");
    const avatarEl = this.sidebar.querySelector("#sidebar-user-avatar");
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (avatarEl) avatarEl.textContent = user.name ? user.name.charAt(0) : "U";
  }
}
