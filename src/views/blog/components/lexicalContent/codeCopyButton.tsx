"use client";

import { useState } from "react";

type Labels = { codeCopied: string; copyCode: string; copyFailed: string };

export default function CodeCopyButton({ code, labels }: { code: string; labels: Labels }) {
  const [message, setMessage] = useState(labels.copyCode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(labels.codeCopied);
    } catch {
      setMessage(labels.copyFailed);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-100 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={copy}
        type="button"
      >
        {labels.copyCode}
      </button>
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  );
}
