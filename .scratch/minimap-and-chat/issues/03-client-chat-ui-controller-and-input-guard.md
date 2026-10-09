# Ticket 03: Client Chat UI Controller and Input Guard

Status: ready-for-agent
Triage: ready-for-agent
Blocks: .scratch/minimap-and-chat/issues/04-overworld-speech-bubbles-and-e2e-verification.md
Blocked-by: .scratch/minimap-and-chat/issues/01-shared-chat-types-and-server-broadcast.md

## Context
Players need an interactive, accessible chat overlay at the bottom-left of the screen to send/receive messages, view combat/system logs, and switch between channels without accidentally triggering game hotkeys.

## Requirements
1. **DOM Markup & CSS (`packages/client/index.html` & `styles/index.css`)**:
   - Container `#chat-overlay` placed at bottom-left over the canvas:
     - Channel Tabs: `<button id="chat-tab-all">All</button>`, `<button id="chat-tab-system">System</button>`.
     - Message Box `#chat-messages`: scrollable list, max-height ~140px, semi-transparent dark background, stylized timestamps and player names.
     - Input Row `#chat-input-bar`: `<input id="chat-input" placeholder="Press Enter to chat..." />`, send button.
2. **Chat Controller (`packages/client/src/ui/ChatController.ts`)**:
   - Manages state: active tab (`'all' | 'system'`), message list (up to 100 entries).
   - `addMessage(msg: ChatMessagePayload)`: adds message, renders into DOM, triggers auto-scroll to bottom.
   - `setTab(tab: 'all' | 'system')`: filters displayed messages.
   - Input Handling:
     - Listen for `Enter` on window:
       - If input not focused: focus input, set `isFocused = true`, prevent default.
       - If input focused: if input has text, dispatch `onSend(text)`, clear input. Blur input, set `isFocused = false`.
     - Listen for `Escape`:
       - If input focused: blur input, clear or preserve, set `isFocused = false`.
   - `isChatInputFocused(): boolean`: returns whether input is active.
3. **Hotkey Suppression**:
   - In `OverworldScene.ts` and UI hotkey listeners (`B`, `C`, `I`, arrows, etc.): if `chatController.isChatInputFocused()`, ignore keyboard shortcuts and prevent movement.
4. **Network Integration (`packages/client/src/network/OverworldNetwork.ts`)**:
   - Expose `sendChatMessage(text: string)`.
   - Expose `onChatMessage(cb: (msg: ChatMessagePayload) => void)`.
5. **Unit Tests (`packages/client/test/chat-controller.test.ts`)**:
   - Verify tab filtering (`all` vs `system`).
   - Verify maximum message retention (FIFO buffer).
   - Verify message formatting and escaping to prevent XSS.
