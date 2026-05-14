"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-slate-400 mb-2">
            حدث خطأ غير متوقع
          </h2>
          <p className="text-slate-500 mb-4 text-sm">
            {this.state.error?.message || "يرجى المحاولة مرة أخرى"}
          </p>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            onClick={() => this.setState({ hasError: false })}
          >
            إعادة المحاولة
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}