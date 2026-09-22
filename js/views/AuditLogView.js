/**
 * Smart Land GIS - Audit Log & History View
 */
import { store } from "../store.js";

export class AuditLogView {
  constructor(containerId = "view-history") {
    this.container = document.getElementById(containerId);
    this.searchQuery = "";
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("history:change", () => this.render());
  }

  render() {
    const history = store.history;
    const filtered = history.filter(item => {
      if (!this.searchQuery) return true;
      const str = `${item.action} ${item.target} ${item.user} ${item.details}`.toLowerCase();
      return str.includes(this.searchQuery);
    });

    this.container.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px; max-width: 1100px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a;">Cadastral Audit Log & Edit History</h1>
            <p style="font-size: 13px; color: #64748b;">
              Immutable audit trail tracking all land parcel creations, boundary adjustments, utility linkages, and removals.
            </p>
          </div>
          <div class="table-search-box" style="min-width: 260px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="audit-search-input" class="table-search-input" placeholder="Search audit history..." value="${this.searchQuery}">
          </div>
        </div>

        <!-- History Timeline Card -->
        <div class="table-card">
          <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
            <span>Total recorded audit entries: <strong>${filtered.length}</strong></span>
            <span>Auditing standard: ISO-19152 LADM Compliant</span>
          </div>

          <div style="padding: 20px;">
            ${filtered.length === 0 ? `
              <div style="text-align: center; padding: 40px; color: #94a3b8;">
                No audit events found matching your search.
              </div>
            ` : `
              <div class="activity-feed">
                ${filtered.map(item => {
                  let badgeClass = "badge-primary";
                  if (item.action.includes("Trash") || item.action.includes("Delete")) badgeClass = "badge-danger";
                  else if (item.action.includes("Restore")) badgeClass = "badge-success";
                  else if (item.action.includes("Hazard") || item.action.includes("Flood")) badgeClass = "badge-warning";

                  const timeStr = new Date(item.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return `
                    <div class="activity-item" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
                      <div class="activity-dot" style="background: ${badgeClass === 'badge-danger' ? '#ef4444' : badgeClass === 'badge-success' ? '#10b981' : '#2563eb'};"></div>
                      <div class="activity-info">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span class="badge ${badgeClass}" style="font-size: 10px;">${item.action}</span>
                          <strong style="font-size: 13.5px; color: #0f172a;">${item.target}</strong>
                          <span style="font-size: 11.5px; color: #64748b;">by ${item.user}</span>
                        </div>
                        <span class="activity-text" style="color: #475569; font-size: 12.5px; margin-top: 2px;">
                          ${item.details}
                        </span>
                        <span class="activity-time">${timeStr}</span>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener("input", (e) => {
      if (e.target.id === "audit-search-input") {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      }
    });
  }
}
