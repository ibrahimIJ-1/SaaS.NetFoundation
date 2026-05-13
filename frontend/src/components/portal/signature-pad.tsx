'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { ShieldCheck, Eraser, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSignDocument } from '@/hooks/use-documents';

interface SignaturePadProps {
  documentId: string;
  onSigned?: () => void;
  onCancel?: () => void;
}

export function SignaturePad({ documentId, onSigned, onCancel }: SignaturePadProps) {
  const sigPad = useRef<SignatureCanvas>(null);
  const signDocument = useSignDocument();

  const clear = () => sigPad.current?.clear();

  const save = async () => {
    if (sigPad.current?.isEmpty()) {
      toast.error('يرجى التوقيع أولاً');
      return;
    }

    try {
      const signatureDataUrl = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
      
      await signDocument.mutateAsync({
        documentId,
        signatureImage: signatureDataUrl || "",
        signerName: 'موكل نظام قانوني',
      });

      toast.success('تم توقيع المستند بنجاح');
      onSigned?.();
    } catch (error) {
      toast.error('فشل حفظ التوقيع الرقمي');
    }
  };

  return (
    <GlassCard className="p-6 border-legal-gold/20 flex flex-col gap-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 border-b border-legal-gold/10 pb-4">
        <div className="p-2 bg-legal-gold/10 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-legal-gold" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100">التوقيع الإلكتروني الآمن</h3>
          <p className="text-xs text-slate-500">سيتم ربط هذا التوقيع بالمستند بشكل نهائي</p>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden border-2 border-slate-200">
        <SignatureCanvas
          ref={sigPad}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 200,
            className: 'signature-canvas cursor-crosshair'
          }}
        />
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={clear} 
          className="flex-1 gap-2 border-slate-700 text-slate-400 hover:text-slate-100"
        >
          <Eraser className="w-4 h-4" />
          مسح
        </Button>
        <Button 
          onClick={save} 
          disabled={signDocument.isPending}
          className="flex-1 gap-2 bg-legal-gold hover:bg-legal-gold-light text-legal-primary font-bold"
        >
          <Check className="w-4 h-4" />
          اعتماد التوقيع
        </Button>
      </div>

      {onCancel && (
        <Button variant="ghost" onClick={onCancel} className="text-slate-500">
          إلغاء
        </Button>
      )}
    </GlassCard>
  );
}
