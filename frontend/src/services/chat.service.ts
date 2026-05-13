import { apiClient } from './api-client';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdOn: string;
  isRead: boolean;
  legalCaseId?: string;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  legalCaseId?: string;
}

export const chatService = {
  getHistory: async (otherUserId: string, caseId?: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat/history/${otherUserId}`, {
      params: { caseId }
    });
    return response.data;
  },

  sendMessage: async (request: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post('/chat/send', request);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.post(`/chat/read/${messageId}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/chat/unread-count');
    return response.data;
  }
};
