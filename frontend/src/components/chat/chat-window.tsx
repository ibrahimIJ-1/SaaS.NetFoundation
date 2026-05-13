'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatHistory, useSendMessage, useChatRealtime } from '@/hooks/use-chat';
import { useAuth } from '@/providers/auth-provider';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChatWindowProps {
  otherUserId: string;
  otherUserName: string;
  caseId?: string;
  className?: string;
}

export function ChatWindow({ otherUserId, otherUserName, caseId, className }: ChatWindowProps) {
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
    <GlassCard className={cn("flex flex-col h-[500px] overflow-hidden border-border", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-legal-gold/10 flex items-center justify-center text-legal-gold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-none">{otherUserName}</h3>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              اتصال آمن ومشفر
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-dot-pattern"
      >
        {isLoading ? (
          <div className="flex justify-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Send className="w-10 h-10 mb-2" />
            <p className="text-sm">ابدأ المحادثة الآن</p>
          </div>
        ) : (
          messages?.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "mr-auto items-start" : "ml-auto items-end"
                )}
              >
                <div 
                  className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    isMe 
                      ? "bg-legal-gold text-legal-primary rounded-tl-none font-medium" 
                      : "bg-secondary text-foreground rounded-tr-none"
                  )}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {format(new Date(msg.createdOn), 'HH:mm', { locale: ar })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-secondary/10">
        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك هنا..."
            className="bg-background border-border"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
