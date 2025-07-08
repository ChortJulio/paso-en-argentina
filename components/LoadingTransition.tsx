"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Flag } from "lucide-react";

interface LoadingTransitionProps {
  mensaje?: string;
}

export function LoadingTransition({
  mensaje = "Cargando siguiente pregunta...",
}: LoadingTransitionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
        <CardContent className="text-center p-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Flag className="h-8 w-8 text-sky-600 animate-pulse" />
            <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
            <Flag className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-sky-900 mb-2">{mensaje}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
