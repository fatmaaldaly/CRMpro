"use client";
import { Button } from "@/components/ui/button";


export default function ExportButton() {
  return (
        <Button 
        className="h-10 rounded-xl px-4 shadow-sm"
        onClick={() => window.location.href = "/api/leads/export"}
        >Export Leads</Button>
  );
}