"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/** Снимает UTM-метки первого захода. Ничего не рендерит. */
export default function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
