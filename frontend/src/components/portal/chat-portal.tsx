'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useChatHistory, useSendMessage, useChatRealtime } from '@/hooks/use-chat';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Scale, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChatPortalProps {
  otherUserId: string;
  otherUserName?: string;
  caseId?: string;
}

export function ChatPortal({ otherUserId, otherUserName = 'المستشار القانوني', caseId }: ChatPortalProps) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useChatHistory(otherUserId, caseId);
  const sendMessage = useSendMessage();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useChatRealtime(otherUserId, caseId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    
    sendMessage.mutate({
      receiverId: otherUserId,
      content: input.trim(),
      legalCaseId: caseId
    }, {
      onSuccess: () => setInput('')
    });
  };

  return (
    <GlassCard className="flex flex-col h-[600px] overflow-hidden border-slate-800 shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-legal-gold/20 flex items-center justify-center border border-legal-gold/30">
            <Scale className="w-5 h-5 text-legal-gold" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{otherUserName}</h3>
            <div className="flex items-center gap-1 text-[10px] text-legal-gold font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>اتصال مشفر وآمن</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40 scrollbar-thin scrollbar-thumb-slate-800" 
        dir="rtl"
      >
        {isLoading ? (
          <div className="flex justify-center py-20 text-slate-500 text-sm">جاري تحميل المحادثة...</div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Send className="w-12 h-12 mb-3 text-slate-500" />
            <p className="text-sm text-slate-400">ابدأ المحادثة مع فريقك القانوني الآن</p>
          </div>
        ) : (
          messages?.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] space-y-1",
                  isMe ? "mr-auto items-start" : "ml-auto items-end"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm shadow-md transition-all",
                    isMe
                      ? "bg-legal-gold text-legal-primary rounded-tl-none font-bold"
                      : "bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700"
                  )}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate-500 px-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {format(new Date(msg.createdOn), 'HH:mm', { locale: ar })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <Input
          placeholder="اكتب رسالتك هنا..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="bg-slate-950 border-slate-800 text-slate-100 focus:ring-legal-gold/50 placeholder:text-slate-600"
        />
        <Button 
          onClick={handleSend} 
          disabled={!input.trim() || sendMessage.isPending}
          className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold shadow-lg shadow-legal-gold/20"
        >
          {sendMessage.isPending ? (
            <div className="w-4 h-4 border-2 border-legal-primary/30 border-t-legal-primary rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </GlassCard>
  );
}
