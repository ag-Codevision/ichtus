"use client";

import React from "react";
import { M3PageTransition } from "@/components/ui/m3-motion";

export default function PortalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <M3PageTransition>{children}</M3PageTransition>;
}
