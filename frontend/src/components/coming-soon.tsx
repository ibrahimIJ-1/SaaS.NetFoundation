import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComingSoonPage() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <Card className="bg-slate-900 border-slate-800 text-center max-w-md p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-50">Coming Soon</CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            This module is currently under development in the next phase of the TeethDen Platform.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
