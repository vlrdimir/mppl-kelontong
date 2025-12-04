"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportTransactions } from "@/lib/hooks/use-export-transactions";
import { useToast } from "@/hooks/use-toast";

export function ExportTransactionsButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { exportTransactions } = useExportTransactions();
  const { toast } = useToast();

  const handleExport = async (format: "excel" | "csv" | "json") => {
    setIsExporting(true);
    try {
      await exportTransactions(format);
      const formatNames = {
        excel: "Excel",
        csv: "CSV",
        json: "JSON",
      };
      toast({
        title: "Berhasil",
        description: `Laporan berhasil diekspor ke format ${formatNames[format]}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Gagal mengekspor laporan. Silakan coba lagi.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengekspor...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Ekspor Laporan
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          disabled={isExporting}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Export Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>Export CSV (.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isExporting}
        >
          <FileJson className="mr-2 h-4 w-4" />
          <span>Export JSON (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
