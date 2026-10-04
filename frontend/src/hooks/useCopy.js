import { useState } from "react";
import toast from "react-hot-toast";

export default function useCopy() {
  const [copied, setCopied] = useState(null);

  const copy = async (text, label = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Could not copy. Please copy it manually.");
    }
  };

  return { copied, copy };
}
