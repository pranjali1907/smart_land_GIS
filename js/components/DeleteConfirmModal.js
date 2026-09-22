/**
 * Smart Land GIS - Deletion Confirmation Modal
 */

export class DeleteConfirmModal {
  constructor(containerId = "delete-modal-root") {
    this.container = document.getElementById(containerId);
    this.onConfirmCallback = null;
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "delete-modal-root";
      document.body.appendChild(this.container);
    }
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="delete-modal-overlay">
        <div class="modal" style="max-width: 440px;">
          <div class="modal-header" style="background: #fee2e2;">
            <div class="modal-title-group">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              <h3 class="modal-title" style="color: #b91c1c;" id="delete-modal-title">Confirm Deletion</h3>
            </div>
            <button class="modal-close-btn" id="delete-modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="gap: 14px;">
            <p id="delete-modal-desc" style="font-size: 13.5px; color: #475569;"></p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
                To prevent accidental loss, type <strong style="color: #0f172a;">DELETE</strong> below:
              </p>
              <input type="text" id="delete-confirm-input" class="form-control" placeholder="Type DELETE here..." autocomplete="off">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="delete-modal-cancel-btn">Cancel</button>
            <button class="btn btn-danger" id="delete-modal-action-btn" disabled>Permanently Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const overlay = this.container.querySelector("#delete-modal-overlay");
    const closeBtn = this.container.querySelector("#delete-modal-close-btn");
    const cancelBtn = this.container.querySelector("#delete-modal-cancel-btn");
    const actionBtn = this.container.querySelector("#delete-modal-action-btn");
    const input = this.container.querySelector("#delete-confirm-input");

    const close = () => {
      overlay.classList.remove("open");
      input.value = "";
      actionBtn.disabled = true;
    };

    closeBtn.addEventListener("click", close);
    cancelBtn.addEventListener("click", close);

    input.addEventListener("input", (e) => {
      actionBtn.disabled = e.target.value.trim().toUpperCase() !== "DELETE";
    });

    actionBtn.addEventListener("click", () => {
      if (this.onConfirmCallback) {
        this.onConfirmCallback();
      }
      close();
    });
  }

  open({ title, description, onConfirm }) {
    this.onConfirmCallback = onConfirm;
    const overlay = this.container.querySelector("#delete-modal-overlay");
    const titleEl = this.container.querySelector("#delete-modal-title");
    const descEl = this.container.querySelector("#delete-modal-desc");
    const input = this.container.querySelector("#delete-confirm-input");
    const actionBtn = this.container.querySelector("#delete-modal-action-btn");

    titleEl.textContent = title || "Confirm Permanent Deletion";
    descEl.textContent = description || "This action cannot be undone and will permanently remove this record.";
    input.value = "";
    actionBtn.disabled = true;

    overlay.classList.add("open");
    setTimeout(() => input.focus(), 100);
  }
}
