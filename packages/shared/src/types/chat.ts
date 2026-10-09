export type ChatChannel = 'map' | 'system';

export interface ChatMessagePayload {
  id: string;
  senderId: string;
  senderName: string;
  channel: ChatChannel;
  text: string;
  timestamp: number;
}

export interface SendChatMessagePayload {
  text: string;
  channel?: ChatChannel;
}
