# Ticket 01: Shared Chat Types and Server Overworld Room Broadcast

Status: ready-for-agent
Triage: ready-for-agent
Blocks: .scratch/minimap-and-chat/issues/03-client-chat-ui-controller-and-input-guard.md, .scratch/minimap-and-chat/issues/04-overworld-speech-bubbles-and-e2e-verification.md
Blocked-by: none

## Context
Players in the same Overworld map currently have no messaging channel to communicate or receive server event notifications.

## Requirements
1. **Shared Types (`packages/shared/src/types/chat.ts`)**:
   - `ChatChannel`: `'map' | 'system'`
   - `ChatMessagePayload`:
     - `id: string`
     - `senderId: string`
     - `senderName: string`
     - `channel: ChatChannel`
     - `text: string`
     - `timestamp: number`
   - `SendChatMessagePayload`:
     - `text: string`
     - `channel?: ChatChannel`
   - Export types and index in `packages/shared/src/index.ts`.
2. **Server Message Handling (`packages/server/src/rooms/OverworldRoom.ts`)**:
   - Register listener on room message `sendChatMessage`:
     - Validate input: string type, trimmed length between 1 and 120 chars.
     - Rate-limit per client (e.g. at most 1 message per 400ms).
     - Extract sender hero name from active hero state in `clientHeroMap`. Fallback to `"Traveler"`.
     - Construct `ChatMessagePayload` with unique ID (`Date.now() + Math.random()`) and current timestamp.
     - Broadcast `chatMessage` payload to all connected clients in the room.
   - Provide helper method `broadcastSystemMessage(text: string)` to send system alerts to room clients.
3. **Unit Tests (`packages/server/test/chat-room.test.ts`)**:
   - Verify valid `sendChatMessage` broadcasts to room clients.
   - Verify rate limiting and length truncation / rejection.
   - Verify `broadcastSystemMessage` sends correctly tagged messages.
