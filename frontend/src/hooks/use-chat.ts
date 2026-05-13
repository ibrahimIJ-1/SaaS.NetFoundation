import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import { chatService, ChatMessage, SendMessageRequest } from '@/services/chat.service';
import { useAuth } from '@/providers/auth-provider';

export function useChatHistory(otherUserId: string, caseId?: string) {
  return useQuery({
    queryKey: ['chat', otherUserId, caseId],
    queryFn: () => chatService.getHistory(otherUserId, caseId),
    enabled: !!otherUserId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SendMessageRequest) => chatService.sendMessage(request),
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ['chat', newMessage.receiverId, newMessage.legalCaseId],
        (old) => [...(old || []), newMessage]
      );
    }
  });
}

export function useChatRealtime(otherUserId: string, caseId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (senderId: string, content: string, msgCaseId?: string) => {
      if (senderId === otherUserId && (msgCaseId === caseId)) {
        queryClient.invalidateQueries({ queryKey: ['chat', otherUserId, caseId] });
      }
    });

    connection.start().catch(err => console.error('SignalR Connection Error: ', err));

    return () => {
      connection.stop();
    };
  }, [user?.id, otherUserId, caseId, queryClient]);
}
