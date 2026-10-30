"use client";

import { useState } from "react";

export default function CodeCopyButton({ code }: { code: string }) {
  const [message, setMessage] = useState("Copiar código");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Código copiado");
    } catch {
      setMessage("No se pudo copiar el código");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-100 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={copy}
        type="button"
      >
        Copiar
      </button>
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  );
}
