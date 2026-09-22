/**
 * Smart Land GIS - Trash & Recovery View Component
 */
import { store } from "../store.js";
import { toast } from "../components/Toast.js";
import { formatArea } from "../spatial-utils.js";

export class TrashView {
  constructor(containerId = "view-trash", deleteModal = null) {
    this.container = document.getElementById(containerId);
    this.deleteModal = deleteModal;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    store.subscribe("trash:change", () => this.render());
  }

  render() {
    const trash = store.trash;

    this.container.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px; max-width: 1100px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Cadastral Trash Bin
            </h1>
            <p style="font-size: 13px; color: #64748b;">
              Deleted land parcels are safely preserved here and can be restored at any time.
            </p>
          </div>
          ${trash.length > 0 ? `
            <button class="btn btn-danger-outline btn-sm" id="btn-empty-trash">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Empty Trash (${trash.length})
            </button>
          ` : ''}
        </div>

        <!-- Trash Table Card -->
        <div class="table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Plot Number</th>
                  <th>Survey Number</th>
                  <th>Zoning</th>
                  <th>Dimensions (L &times; W)</th>
                  <th>Area</th>
                  <th>Deleted At</th>
                  <th style="text-align: right;">Recovery Actions</th>
                </tr>
              </thead>
              <tbody>
                ${trash.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 60px 20px;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </div>
                      <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Trash is Empty</h3>
                      <p style="font-size: 13px; color: #64748b;">No land plots currently reside in the trash bin.</p>
                    </td>
                  </tr>
                ` : trash.map(plot => {
                  const areaFmt = formatArea(plot.area);
                  const deletedDate = plot.deletedAt ? new Date(plot.deletedAt).toLocaleString() : "Recently";

                  return `
                    <tr data-plot-id="${plot.id}">
                      <td>
                        <strong style="color: #0f172a;">${plot.plotNumber}</strong><br>
                        <span style="font-size: 11px; color: #64748b;">${plot.id}</span>
                      </td>
                      <td>${plot.surveyNumber || 'N/A'}</td>
                      <td><span class="badge badge-secondary">${plot.zone}</span></td>
                      <td>${plot.length}m &times; ${plot.width}m</td>
                      <td>
                        <strong>${areaFmt.sqMeters}</strong><br>
                        <span style="font-size: 11px; color: #64748b;">${areaFmt.acres}</span>
                      </td>
                      <td style="font-size: 12px; color: #64748b;">${deletedDate}</td>
                      <td style="text-align: right;">
                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                          <button class="btn btn-outline btn-sm action-restore" data-id="${plot.id}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                            Restore
                          </button>
                          <button class="btn btn-danger-outline btn-sm action-perm-delete" data-id="${plot.id}">
                            Permanently Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const restoreBtn = e.target.closest(".action-restore");
      const permDeleteBtn = e.target.closest(".action-perm-delete");
      const emptyTrashBtn = e.target.closest("#btn-empty-trash");

      if (restoreBtn) {
        const plotId = restoreBtn.dataset.id;
        store.restorePlot(plotId);
        toast.success("Parcel restored back to master plan.");
      } else if (permDeleteBtn) {
        const plotId = permDeleteBtn.dataset.id;
        const plot = store.trash.find(p => p.id === plotId);
        if (this.deleteModal) {
          this.deleteModal.open({
            title: `Permanently Delete ${plot?.plotNumber || 'Plot'}?`,
            description: `You are about to permanently remove ${plot?.plotNumber || 'this record'} from the database. This action CANNOT be reversed.`,
            onConfirm: () => {
              store.permanentlyDeletePlot(plotId);
              toast.error("Plot record permanently destroyed.");
            }
          });
        }
      } else if (emptyTrashBtn) {
        if (this.deleteModal) {
          this.deleteModal.open({
            title: "Empty Entire Trash Bin?",
            description: `This will permanently destroy all ${store.trash.length} parcels in the trash bin. This action CANNOT be reversed.`,
            onConfirm: () => {
              store.emptyTrash();
              toast.error("Trash bin cleared.");
            }
          });
        }
      }
    });
  }
}
