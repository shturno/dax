"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center text-red-600 bg-red-100 border border-red-400 p-4 rounded-md">
      <p>Ocorreu um erro: {error.message}</p>
      <Button onClick={() => reset()} variant="destructive" size="sm" className="mt-2">
        Tentar Novamente
      </Button>
    </div>
  );
}
