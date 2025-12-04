import * as XLSX from "xlsx";
import type { Transaction } from "@/lib/types";

export type ExportFormat = "excel" | "csv" | "json";

interface ExportRow {
  Invoice: string;
  Tanggal: string;
  Pelanggan: string;
  Produk: string;
  Quantity: number;
  "Harga Satuan": number;
  Subtotal: number;
  "Total Transaksi": number;
  Dibayar: number;
  Status: string;
  Catatan: string;
}

export function useExportTransactions() {
  const formatCurrency = (amount: number | string): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatInvoiceNumber = (id: number): string => {
    const idString = String(id);
    const padding = Math.max(4, idString.length);
    return `INV-${idString.padStart(padding, "0")}`;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      paid: "Lunas",
      partial: "Sebagian",
      unpaid: "Belum Bayar",
    };
    return labels[status] || status;
  };

  const fetchAllTransactions = async (): Promise<Transaction[]> => {
    const response = await fetch("/api/transactions?type=sale&limit=10000");
    if (!response.ok) {
      throw new Error("Gagal mengambil data transaksi");
    }
    const data = await response.json();
    return data.data || [];
  };

  const transformToExportRows = (transactions: Transaction[]): ExportRow[] => {
    const rows: ExportRow[] = [];

    transactions.forEach((transaction) => {
      const invoiceNumber = formatInvoiceNumber(transaction.id);
      const tanggal = formatDate(transaction.transactionDate);
      const pelanggan = transaction.customer?.name || "-";
      const totalTransaksi = Number(transaction.totalAmount);
      const dibayar = Number(transaction.paidAmount);
      const status = getStatusLabel(transaction.paymentStatus);
      const catatan = transaction.notes || "-";

      if (
        transaction.transactionItems &&
        transaction.transactionItems.length > 0
      ) {
        transaction.transactionItems.forEach((item, index) => {
          rows.push({
            Invoice: index === 0 ? invoiceNumber : "",
            Tanggal: index === 0 ? tanggal : "",
            Pelanggan: index === 0 ? pelanggan : "",
            Produk: item.product?.name || "-",
            Quantity: item.quantity,
            "Harga Satuan": Number(item.price),
            Subtotal: Number(item.subtotal),
            "Total Transaksi": index === 0 ? totalTransaksi : 0,
            Dibayar: index === 0 ? dibayar : 0,
            Status: index === 0 ? status : "",
            Catatan: index === 0 ? catatan : "",
          });
        });
      } else {
        // Jika tidak ada items, tetap buat baris untuk transaksi
        rows.push({
          Invoice: invoiceNumber,
          Tanggal: tanggal,
          Pelanggan: pelanggan,
          Produk: "-",
          Quantity: 0,
          "Harga Satuan": 0,
          Subtotal: 0,
          "Total Transaksi": totalTransaksi,
          Dibayar: dibayar,
          Status: status,
          Catatan: catatan,
        });
      }
    });

    return rows;
  };

  const exportToExcel = async () => {
    try {
      const transactions = await fetchAllTransactions();
      const rows = transformToExportRows(transactions);

      // Buat worksheet
      const ws = XLSX.utils.json_to_sheet(rows);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Invoice
        { wch: 20 }, // Tanggal
        { wch: 20 }, // Pelanggan
        { wch: 25 }, // Produk
        { wch: 10 }, // Quantity
        { wch: 15 }, // Harga Satuan
        { wch: 15 }, // Subtotal
        { wch: 15 }, // Total Transaksi
        { wch: 15 }, // Dibayar
        { wch: 12 }, // Status
        { wch: 30 }, // Catatan
      ];
      ws["!cols"] = colWidths;

      // Buat workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

      // Generate filename
      const date = new Date().toISOString().split("T")[0];
      const filename = `laporan-penjualan-${date}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw error;
    }
  };

  const exportToCSV = async () => {
    try {
      const transactions = await fetchAllTransactions();
      const rows = transformToExportRows(transactions);

      // Buat worksheet
      const ws = XLSX.utils.json_to_sheet(rows);

      // Convert ke CSV
      const csv = XLSX.utils.sheet_to_csv(ws);

      // Generate filename
      const date = new Date().toISOString().split("T")[0];
      const filename = `laporan-penjualan-${date}.csv`;

      // Download
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw error;
    }
  };

  const exportToJSON = async () => {
    try {
      const transactions = await fetchAllTransactions();
      const rows = transformToExportRows(transactions);

      // Generate filename
      const date = new Date().toISOString().split("T")[0];
      const filename = `laporan-penjualan-${date}.json`;

      // Download
      const json = JSON.stringify(rows, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to JSON:", error);
      throw error;
    }
  };

  const exportTransactions = async (format: ExportFormat) => {
    switch (format) {
      case "excel":
        await exportToExcel();
        break;
      case "csv":
        await exportToCSV();
        break;
      case "json":
        await exportToJSON();
        break;
      default:
        throw new Error(`Format ${format} tidak didukung`);
    }
  };

  return {
    exportTransactions,
  };
}
