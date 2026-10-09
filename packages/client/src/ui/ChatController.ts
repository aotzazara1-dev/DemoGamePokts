import type { ChatMessagePayload, ChatChannel } from '@poktsonline/shared';

export interface ChatControllerOptions {
  containerEl?: HTMLElement | null;
  messagesContainerEl: HTMLElement;
  inputEl: HTMLInputElement;
  formEl?: HTMLFormElement | null;
  tabAllBtn?: HTMLButtonElement | null;
  tabSystemBtn?: HTMLButtonElement | null;
  currentHeroName?: string;
  onSendMessage?: (text: string, channel: ChatChannel) => void;
  isGameModalOpen?: () => boolean;
}

export class ChatController {
  private containerEl?: HTMLElement | null;
  private messagesContainerEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private formEl?: HTMLFormElement | null;
  private tabAllBtn?: HTMLButtonElement | null;
  private tabSystemBtn?: HTMLButtonElement | null;
  private currentHeroName: string;
  private onSendMessage?: (text: string, channel: ChatChannel) => void;
  private isGameModalOpen?: () => boolean;

  private activeTab: 'all' | 'system' = 'all';
  private messages: ChatMessagePayload[] = [];
  private readonly maxMessages = 100;

  constructor(options: ChatControllerOptions) {
    this.containerEl = options.containerEl;
    this.messagesContainerEl = options.messagesContainerEl;
    this.inputEl = options.inputEl;
    this.formEl = options.formEl;
    this.tabAllBtn = options.tabAllBtn;
    this.tabSystemBtn = options.tabSystemBtn;
    this.currentHeroName = options.currentHeroName || '';
    this.onSendMessage = options.onSendMessage;
    this.isGameModalOpen = options.isGameModalOpen;

    this.setupListeners();
  }

  private setupListeners(): void {
    // Tab switching
    if (this.tabAllBtn) {
      this.tabAllBtn.addEventListener('click', () => this.setTab('all'));
    }
    if (this.tabSystemBtn) {
      this.tabSystemBtn.addEventListener('click', () => this.setTab('system'));
    }

    // Form submission
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        this.submitCurrentInput();
      });
    }

    // Global Key Handling for Enter & Escape
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!this.isChatInputFocused()) {
          // Check if other modal overlays (auth, character select, dialogue) are open
          if (this.isGameModalOpen && this.isGameModalOpen()) {
            return;
          }
          e.preventDefault();
          this.focusInput();
        }
      } else if (e.key === 'Escape') {
        if (this.isChatInputFocused()) {
          e.preventDefault();
          this.blurInput();
        }
      }
    });

    // Stop keyboard propagation while typing in chat so game hotkeys don't trigger
    this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitCurrentInput();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.blurInput();
      }
    });
  }

  public submitCurrentInput(): void {
    const rawText = this.inputEl.value;
    const trimmed = rawText.trim();
    if (trimmed.length > 0 && this.onSendMessage) {
      this.onSendMessage(trimmed, 'map');
    }
    this.inputEl.value = '';
    this.blurInput();
  }

  public isChatInputFocused(): boolean {
    return typeof document !== 'undefined' && document.activeElement === this.inputEl;
  }

  public focusInput(): void {
    this.inputEl.focus();
  }

  public blurInput(): void {
    this.inputEl.blur();
  }

  public setCurrentHeroName(name: string): void {
    this.currentHeroName = name;
  }

  public setTab(tab: 'all' | 'system'): void {
    this.activeTab = tab;
    if (this.tabAllBtn) {
      this.tabAllBtn.classList.toggle('active', tab === 'all');
    }
    if (this.tabSystemBtn) {
      this.tabSystemBtn.classList.toggle('active', tab === 'system');
    }
    this.renderMessages();
  }

  public getActiveTab(): 'all' | 'system' {
    return this.activeTab;
  }

  public getMessages(): ChatMessagePayload[] {
    return [...this.messages];
  }

  public addMessage(msg: ChatMessagePayload): void {
    this.messages.push(msg);
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    if (this.shouldDisplayMessage(msg)) {
      this.appendMessageRow(msg);
    }
  }

  public setVisible(visible: boolean): void {
    if (this.containerEl) {
      this.containerEl.style.display = visible ? 'flex' : 'none';
    }
  }

  public shouldDisplayMessage(msg: ChatMessagePayload): boolean {
    if (this.activeTab === 'all') return true;
    if (this.activeTab === 'system') return msg.channel === 'system';
    return true;
  }

  private renderMessages(): void {
    this.messagesContainerEl.innerHTML = '';
    const filtered = this.messages.filter(m => this.shouldDisplayMessage(m));
    for (const msg of filtered) {
      this.appendMessageRow(msg, false);
    }
    this.scrollToBottom();
  }

  private appendMessageRow(msg: ChatMessagePayload, scroll: boolean = true): void {
    const row = document.createElement('div');
    row.className = `chat-msg-row ${msg.channel}`;

    const time = new Date(msg.timestamp);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

    const isSelf = this.currentHeroName && msg.senderName === this.currentHeroName;
    const senderClass = isSelf ? 'chat-msg-sender self' : 'chat-msg-sender';

    const safeSender = this.escapeHtml(msg.senderName);
    const safeText = this.escapeHtml(msg.text);

    row.innerHTML = `
      <span class="chat-msg-time">${timeStr}</span>
      <span class="${senderClass}">[${safeSender}]:</span>
      <span class="chat-msg-text">${safeText}</span>
    `;

    this.messagesContainerEl.appendChild(row);

    if (scroll) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    this.messagesContainerEl.scrollTop = this.messagesContainerEl.scrollHeight;
  }

  public escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
