import { NPCDefinition, NPCDialogueOption } from "@poktsonline/shared";

export interface DialogueModalCallbacks {
  onOpenShop: (npc: NPCDefinition) => void;
  onHeal: (npc: NPCDefinition) => void;
  onOpenWarehouse?: (npc: NPCDefinition) => void;
  onOpenInnStorage?: (npc: NPCDefinition) => void;
  onClose?: () => void;
}

/**
 * Deep UI Controller for TS Online Classic NPC Dialogue Window.
 */
export class DialogueModalController {
  private currentNPC: NPCDefinition | null = null;
  private callbacks: DialogueModalCallbacks;

  constructor(callbacks: DialogueModalCallbacks) {
    this.callbacks = callbacks;
    this.setupDOM();
  }

  private setupDOM(): void {
    const btnClose = document.getElementById("dialogue-btn-close");
    if (btnClose) {
      btnClose.onclick = () => this.close();
    }
  }

  public open(npc: NPCDefinition): void {
    this.currentNPC = npc;
    const modal = document.getElementById("dialogue-modal");
    if (!modal) return;

    const avatarEl = document.getElementById("dialogue-avatar");
    const nameEl = document.getElementById("dialogue-speaker-name");
    const titleEl = document.getElementById("dialogue-speaker-title");
    const textEl = document.getElementById("dialogue-text");
    const optionsGrid = document.getElementById("dialogue-options-grid");

    if (avatarEl) avatarEl.textContent = npc.avatarIcon || "💬";
    if (nameEl) nameEl.textContent = npc.name;
    if (titleEl) titleEl.textContent = npc.title;
    if (textEl) textEl.textContent = npc.greeting;

    if (optionsGrid) {
      optionsGrid.innerHTML = "";
      npc.options.forEach((opt: NPCDialogueOption) => {
        const btn = document.createElement("button");
        const isPrimary =
          opt.action === "shop" ||
          opt.action === "warehouse" ||
          opt.action === "inn_beasts";
        btn.className = `dialogue-opt-btn ${isPrimary ? "btn-action-primary" : opt.action === "heal" ? "btn-action-heal" : ""}`;
        btn.textContent = opt.label;

        btn.onclick = () => {
          if (opt.action === "shop") {
            this.close();
            this.callbacks.onOpenShop(npc);
          } else if (opt.action === "warehouse") {
            this.close();
            this.callbacks.onOpenWarehouse?.(npc);
          } else if (opt.action === "inn_beasts") {
            this.close();
            this.callbacks.onOpenInnStorage?.(npc);
          } else if (opt.action === "heal") {
            this.callbacks.onHeal(npc);
            if (opt.response && textEl) {
              textEl.textContent = opt.response;
            }
          } else if (opt.action === "advice") {
            if (opt.response && textEl) {
              textEl.textContent = opt.response;
            }
          } else {
            this.close();
          }
        };

        optionsGrid.appendChild(btn);
      });
    }

    modal.classList.add("open");
  }

  public close(): void {
    const modal = document.getElementById("dialogue-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    this.currentNPC = null;
    this.callbacks.onClose?.();
  }

  public isOpen(): boolean {
    const modal = document.getElementById("dialogue-modal");
    return modal ? modal.classList.contains("open") : false;
  }
}
