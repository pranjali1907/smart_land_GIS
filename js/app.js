/**
 * Smart Land GIS - Application Entrypoint & Orchestrator
 */
import { store } from "./store.js";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.js";
import { PlotDetailDrawer } from "./components/PlotDetailDrawer.js";
import { AddPlotModal } from "./components/AddPlotModal.js";

import { DashboardView } from "./views/DashboardView.js";
import { MapView } from "./views/MapView.js";
import { LandRegistryView } from "./views/LandRegistryView.js";
import { DatasetsView } from "./views/DatasetsView.js";
import { AuditLogView } from "./views/AuditLogView.js";
import { TrashView } from "./views/TrashView.js";
import { UserManagementView } from "./views/UserManagementView.js";

class Application {
  constructor() {
    this.sidebar = null;
    this.topbar = null;
    this.deleteModal = null;
    this.detailDrawer = null;
    this.addPlotModal = null;

    this.views = {};
  }

  start() {
    console.log("Initializing Smart Land GIS Portal...");

    // 1. Initialize Shared Modals & Components
    this.deleteModal = new DeleteConfirmModal();
    this.detailDrawer = new PlotDetailDrawer();
    this.addPlotModal = new AddPlotModal();

    this.sidebar = new Sidebar("app-sidebar");
    this.topbar = new Topbar("app-topbar");

    // 2. Initialize Views
    this.views.dashboard = new DashboardView("view-dashboard");
    this.views.map = new MapView("view-map");
    this.views.registry = new LandRegistryView("view-registry");
    this.views.datasets = new DatasetsView("view-datasets");
    this.views.history = new AuditLogView("view-history");
    this.views.trash = new TrashView("view-trash", this.deleteModal);
    this.views.users = new UserManagementView("view-users");

    // 3. View Switcher Routing
    store.subscribe("view:change", (viewName) => {
      this.switchView(viewName);
    });

    // Hash change router support
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && this.views[hash]) {
        store.setView(hash);
      }
    });

    // Check initial hash or default to dashboard
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash && this.views[initialHash]) {
      store.setView(initialHash);
    } else {
      this.switchView("dashboard");
    }

    // Expose global bridge for Leaflet popup actions
    window.SmartLandApp = {
      store,
      selectPlot: (plotId) => store.selectPlot(plotId),
      setView: (viewName) => store.setView(viewName)
    };

    console.log("Smart Land GIS Portal initialized successfully.");
  }

  switchView(viewName) {
    const contentArea = document.getElementById("main-content-area");
    const containers = document.querySelectorAll(".view-container");

    containers.forEach(c => {
      c.classList.remove("active");
    });

    const targetContainer = document.getElementById(`view-${viewName}`);
    if (targetContainer) {
      targetContainer.classList.add("active");
    }

    if (viewName === "map") {
      contentArea.classList.add("map-active");
    } else {
      contentArea.classList.remove("map-active");
    }

    if (window.location.hash !== `#${viewName}`) {
      window.location.hash = `#${viewName}`;
    }
  }
}

// Auto-boot when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new Application();
  app.start();
});
