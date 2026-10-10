"use client";

import { useEffect } from "react";
import { capturarOrigemDaUrl } from "@/lib/compartilhar";

/** Sem visual: lê a origem (`utm_source`) do link de entrada, uma vez por carregamento. */
export default function CapturaOrigem() {
  useEffect(() => {
    capturarOrigemDaUrl();
  }, []);
  return null;
}
