'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/use-ai';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Scale, 
  Zap, 
  BookOpen,
  MessageSquare,
  History,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AILabPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'مرحباً بك في مختبر الذكاء الاصطناعي القانوني (Qanuni AI). أنا مساعدك الذكي المتخصص في القانون. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const chatMutation = useAIChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    chatMutation.mutate({ prompt: input }, {
      onSuccess: (data) => {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.response, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, assistantMessage]);
      },
      onError: () => {
        const errorMessage: Message = { 
          role: 'assistant', 
          content: 'عذراً، حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي. يرجى التحقق من الإعدادات.', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            <Bot className="w-8 h-8 text-legal-gold animate-pulse" />
            مختبر الذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground mt-1">المساعد الذكي للأبحاث القانونية وتلخيص المستندات.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMessages([messages[0]])}>
            <Trash2 className="w-4 h-4 ml-2" />
            مسح المحادثة
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Chat Main Area */}
        <GlassCard className="flex-1 flex flex-col overflow-hidden relative border-legal-gold/20">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-legal-gold to-transparent opacity-30" />
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                  msg.role === 'user' ? "bg-secondary border-border" : "bg-legal-gold/10 border-legal-gold/20 text-legal-gold"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-legal-gold text-legal-primary font-medium" 
                    : "bg-secondary/40 text-foreground border border-border shadow-sm"
                )}>
                  {msg.content}
                  <div className={cn(
                    "text-[10px] mt-2 opacity-50",
                    msg.role === 'user' ? "text-left" : "text-right"
                  )}>
                    {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-4 ml-auto max-w-[85%] animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-legal-gold/10 border border-legal-gold/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-legal-gold animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-muted-foreground italic text-xs">
                  جاري التفكير وتحليل البيانات...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-secondary/20">
            <div className="relative flex gap-2">
              <Input 
                placeholder="اسأل أي سؤال قانوني أو اطلب تلخيصاً لملف..."
                className="bg-background border-border h-12 pr-4 pl-12"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                className="bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold h-12 px-6"
                onClick={handleSend}
                disabled={chatMutation.isPending}
              >
                {chatMutation.isPending ? '...' : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              مدعوم بواسطة Gemini AI 1.5 Pro. الذكاء الاصطناعي قد يرتكب أخطاء، يرجى مراجعة المعلومات القانونية.
            </p>
          </div>
        </GlassCard>

        {/* Sidebar: Quick Actions & Context */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-1">
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-foreground font-heading mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-legal-gold" />
              أوامر سريعة
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="secondary" className="justify-start h-auto py-3 text-right text-xs" onClick={() => setInput('لخص لي أحدث التعديلات في نظام المحاكم التجارية السعودي.')}>
                <BookOpen className="w-4 h-4 ml-2 text-legal-gold" />
                تعديلات نظام المحاكم التجارية
              </Button>
              <Button variant="secondary" className="justify-start h-auto py-3 text-right text-xs" onClick={() => setInput('كيف يمكنني صياغة مذكرة دعوى مطالبة مالية؟')}>
                <Scale className="w-4 h-4 ml-2 text-legal-gold" />
                صياغة مذكرة دعوى
              </Button>
              <Button variant="secondary" className="justify-start h-auto py-3 text-right text-xs" onClick={() => setInput('ماهي شروط فسخ عقد الإيجار الموحد؟')}>
                <MessageSquare className="w-4 h-4 ml-2 text-legal-gold" />
                شروط فسخ عقد الإيجار
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex-1 border-dashed border-2 border-border/50">
            <h3 className="text-sm font-bold text-muted-foreground font-heading mb-4 flex items-center gap-2">
              <History className="w-4 h-4" />
              المحفوظات
            </h3>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="p-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-transparent hover:border-border">
                  <p className="truncate">بحث: نظام العمل السعودي...</p>
                  <p className="text-[10px] mt-1 opacity-50">منذ يومين</p>
                </div>
              ))}
              <p className="text-[10px] text-center italic mt-4 opacity-50">لا توجد محادثات قديمة أخرى.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
