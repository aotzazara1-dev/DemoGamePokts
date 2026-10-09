// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatController } from '../src/ui/ChatController.js';
import type { ChatMessagePayload } from '@poktsonline/shared';

describe('ChatController', () => {
  let mockContainer: HTMLElement;
  let mockMessagesContainer: HTMLElement;
  let mockInput: HTMLInputElement;
  let mockForm: HTMLFormElement;
  let mockTabAllBtn: HTMLButtonElement;
  let mockTabSystemBtn: HTMLButtonElement;
  let onSendMessageSpy: any;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    mockMessagesContainer = document.createElement('div');
    mockInput = document.createElement('input');
    mockForm = document.createElement('form');
    mockTabAllBtn = document.createElement('button');
    mockTabSystemBtn = document.createElement('button');
    onSendMessageSpy = vi.fn();
  });

  it('adds messages and stores them up to maximum limit', () => {
    const controller = new ChatController({
      containerEl: mockContainer,
      messagesContainerEl: mockMessagesContainer,
      inputEl: mockInput,
      formEl: mockForm,
      tabAllBtn: mockTabAllBtn,
      tabSystemBtn: mockTabSystemBtn,
      onSendMessage: onSendMessageSpy
    });

    const msg: ChatMessagePayload = {
      id: 'msg_1',
      senderId: 'client_1',
      senderName: 'LiXiaoLong',
      channel: 'map',
      text: 'Greetings Jianghu warriors!',
      timestamp: Date.now()
    };

    controller.addMessage(msg);
    expect(controller.getMessages().length).toBe(1);
    expect(mockMessagesContainer.children.length).toBe(1);

    // Verify FIFO limit (100)
    for (let i = 0; i < 110; i++) {
      controller.addMessage({
        id: `msg_${i}`,
        senderId: 'client_1',
        senderName: 'LiXiaoLong',
        channel: 'map',
        text: `Message ${i}`,
        timestamp: Date.now()
      });
    }

    expect(controller.getMessages().length).toBe(100);
  });

  it('filters messages between [All] and [System] tabs', () => {
    const controller = new ChatController({
      containerEl: mockContainer,
      messagesContainerEl: mockMessagesContainer,
      inputEl: mockInput,
      tabAllBtn: mockTabAllBtn,
      tabSystemBtn: mockTabSystemBtn
    });

    controller.addMessage({
      id: 'msg_1',
      senderId: 'p1',
      senderName: 'Player1',
      channel: 'map',
      text: 'Chat from player',
      timestamp: Date.now()
    });

    controller.addMessage({
      id: 'msg_2',
      senderId: 'SYSTEM',
      senderName: 'System',
      channel: 'system',
      text: 'You received 100 Gold!',
      timestamp: Date.now()
    });

    // All tab shows both messages
    expect(mockMessagesContainer.children.length).toBe(2);

    // Switch to System tab
    controller.setTab('system');
    expect(controller.getActiveTab()).toBe('system');
    expect(mockMessagesContainer.children.length).toBe(1);
    expect(mockMessagesContainer.textContent).toContain('You received 100 Gold!');

    // Switch back to All tab
    controller.setTab('all');
    expect(mockMessagesContainer.children.length).toBe(2);
  });

  it('escapes HTML tags to prevent XSS injection', () => {
    const controller = new ChatController({
      messagesContainerEl: mockMessagesContainer,
      inputEl: mockInput
    });

    const escaped = controller.escapeHtml('<script>alert("hacked")</script>');
    expect(escaped).toBe('&lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;');

    controller.addMessage({
      id: 'xss_msg',
      senderId: 'bad_user',
      senderName: '<b onclick="hack()">Hacker</b>',
      channel: 'map',
      text: '<img src="x" onerror="alert(1)">',
      timestamp: Date.now()
    });

    // Ensure raw script/img tag was not injected into DOM as HTML element
    expect(mockMessagesContainer.querySelector('script')).toBeNull();
    expect(mockMessagesContainer.querySelector('img')).toBeNull();
  });

  it('submits input and invokes onSendMessage callback', () => {
    const controller = new ChatController({
      messagesContainerEl: mockMessagesContainer,
      inputEl: mockInput,
      onSendMessage: onSendMessageSpy
    });

    mockInput.value = '   Hello World!   ';
    controller.submitCurrentInput();

    expect(onSendMessageSpy).toHaveBeenCalledWith('Hello World!', 'map');
    expect(mockInput.value).toBe('');
  });

  it('toggles visibility of container element', () => {
    const controller = new ChatController({
      containerEl: mockContainer,
      messagesContainerEl: mockMessagesContainer,
      inputEl: mockInput
    });

    controller.setVisible(false);
    expect(mockContainer.style.display).toBe('none');

    controller.setVisible(true);
    expect(mockContainer.style.display).toBe('flex');
  });
});
