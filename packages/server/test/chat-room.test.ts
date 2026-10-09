import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OverworldRoom } from '../src/rooms/OverworldRoom.js';
import type { ChatMessagePayload } from '@poktsonline/shared';

describe('OverworldRoom Chat Broadcasting', () => {
  let room: OverworldRoom;

  const createMockClient = (sessionId: string) => {
    const messages: { type: string; payload: any }[] = [];
    return {
      sessionId,
      send: (type: string, payload: any) => {
        messages.push({ type, payload });
      },
      getSentMessages: () => messages
    };
  };

  beforeEach(() => {
    room = new OverworldRoom();
    room.onCreate();
  });

  afterEach(() => {
    room.onDispose();
  });

  it('broadcasts valid chat messages to all clients in the room', () => {
    const broadcasts: { type: string; payload: ChatMessagePayload }[] = [];
    room.broadcast = vi.fn((type: string, payload: any) => {
      broadcasts.push({ type, payload });
      return true;
    }) as any;

    const client = createMockClient('client_1');
    room.onJoin(client as any, { name: 'WuxiaMaster' });

    // Simulate sending chat message
    (room as any).onMessageHandlers['sendChatMessage'](client, { text: 'Hello Jianghu!' });

    expect(broadcasts.length).toBe(1);
    expect(broadcasts[0].type).toBe('chatMessage');
    expect(broadcasts[0].payload.senderName).toBe('WuxiaMaster');
    expect(broadcasts[0].payload.senderId).toBe('client_1');
    expect(broadcasts[0].payload.text).toBe('Hello Jianghu!');
    expect(broadcasts[0].payload.channel).toBe('map');
  });

  it('rejects empty, whitespace-only, or overly long chat messages', () => {
    const broadcasts: any[] = [];
    room.broadcast = vi.fn((type: string, payload: any) => {
      broadcasts.push({ type, payload });
      return true;
    }) as any;

    const client = createMockClient('client_2');
    room.onJoin(client as any);

    // Empty text
    (room as any).onMessageHandlers['sendChatMessage'](client, { text: '' });
    expect(broadcasts.length).toBe(0);

    // Whitespace only
    (room as any).onMessageHandlers['sendChatMessage'](client, { text: '    ' });
    expect(broadcasts.length).toBe(0);

    // Exceeds 120 chars
    const longText = 'A'.repeat(121);
    (room as any).onMessageHandlers['sendChatMessage'](client, { text: longText });
    expect(broadcasts.length).toBe(0);
  });

  it('enforces rate-limiting for spam messages', () => {
    const broadcasts: any[] = [];
    room.broadcast = vi.fn((type: string, payload: any) => {
      broadcasts.push({ type, payload });
      return true;
    }) as any;

    const client = createMockClient('client_3');
    room.onJoin(client as any);

    // First message succeeds
    (room as any).onMessageHandlers['sendChatMessage'](client, { text: 'Message 1' });
    expect(broadcasts.length).toBe(1);

    // Immediate second message gets throttled
    (room as any).onMessageHandlers['sendChatMessage'](client, { text: 'Message 2' });
    expect(broadcasts.length).toBe(1);
  });

  it('broadcasts system messages with system channel', () => {
    const broadcasts: { type: string; payload: ChatMessagePayload }[] = [];
    room.broadcast = vi.fn((type: string, payload: any) => {
      broadcasts.push({ type, payload });
      return true;
    }) as any;

    room.broadcastSystemMessage('Player obtained 50 Gold!');

    expect(broadcasts.length).toBe(1);
    expect(broadcasts[0].type).toBe('chatMessage');
    expect(broadcasts[0].payload.channel).toBe('system');
    expect(broadcasts[0].payload.senderName).toBe('System');
    expect(broadcasts[0].payload.text).toBe('Player obtained 50 Gold!');
  });
});
