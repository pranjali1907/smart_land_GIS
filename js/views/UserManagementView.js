/**
 * Smart Land GIS - User Management & RBAC View
 */
import { store } from "../store.js";
import { toast } from "../components/Toast.js";

export class UserManagementView {
  constructor(containerId = "view-users") {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("user:change", () => this.render());
  }

  render() {
    const currentRole = store.currentUser.role;

    const roles = [
      {
        id: "superadmin",
        title: "Super Administrator",
        badge: "Full System Access",
        color: "#dc2626",
        bg: "#fee2e2",
        permissions: [
          "Create, Edit, Delete Land Plots",
          "Manage GIS Master Plans & Upload GeoJSON",
          "Permanent Deletion & Trash Bin Access",
          "Role Management & Cadastral Audit Log"
        ]
      },
      {
        id: "admin",
        title: "Cadastral Planning Officer",
        badge: "Editor Access",
        color: "#7c3aed",
        bg: "#ede9fe",
        permissions: [
          "Create & Edit Land Parcels",
          "Interactive Map Spatial Drawing",
          "Access Land Registry & Export Data",
          "No Permanent Deletion Rights"
        ]
      },
      {
        id: "viewer",
        title: "Field Surveyor / Public Viewer",
        badge: "Read-Only Access",
        color: "#0891b2",
        bg: "#cffafe",
        permissions: [
          "Interactive GIS Map Navigation",
          "Inspect Plot Dimensions & Infrastructure",
          "View Analytical Dashboard",
          "Read-Only Protection Mode"
        ]
      }
    ];

    this.container.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 24px; max-width: 1100px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Role-Based Access Control (RBAC)
          </h1>
          <p style="font-size: 13px; color: #64748b;">
            Switch active operational role to simulate different municipal and surveyor permission levels.
          </p>
        </div>

        <!-- Role Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          ${roles.map(r => {
            const isSelected = r.id === currentRole;
            return `
              <div class="analytics-card" style="border: 2px solid ${isSelected ? r.color : '#e2e8f0'};">
                <div class="analytics-card-header" style="background: ${isSelected ? r.bg : '#ffffff'};">
                  <div>
                    <h3 style="font-size: 15px; font-weight: 700; color: #0f172a;">${r.title}</h3>
                    <span style="font-size: 11px; font-weight: 600; color: ${r.color};">${r.badge}</span>
                  </div>
                  ${isSelected ? `
                    <span class="badge" style="background: ${r.color}; color: #ffffff;">Active Role</span>
                  ` : ''}
                </div>

                <div class="analytics-card-body" style="gap: 14px;">
                  <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: #64748b;">Assigned Privileges:</span>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: #334155;">
                    ${r.permissions.map(p => `
                      <li style="display: flex; align-items: center; gap: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${r.color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        ${p}
                      </li>
                    `).join("")}
                  </ul>

                  <div style="margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                    ${isSelected ? `
                      <button class="btn btn-secondary btn-sm" disabled style="width: 100%;">Currently Active Role</button>
                    ` : `
                      <button class="btn btn-outline btn-sm btn-switch-role" data-role="${r.id}" style="width: 100%; border-color: ${r.color}; color: ${r.color};">
                        Switch to ${r.title}
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
      const switchBtn = e.target.closest(".btn-switch-role");
      if (switchBtn) {
        const role = switchBtn.dataset.role;
        store.setUserRole(role);
        toast.info(`Switched active operational role to: ${role.toUpperCase()}`);
      }
    });
  }
}
