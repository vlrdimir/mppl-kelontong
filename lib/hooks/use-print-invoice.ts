import { useCallback } from "react";
import type { Transaction } from "@/lib/types";

export function usePrintInvoice() {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatInvoiceNumber = (id: number) => {
    const idString = String(id);
    const padding = Math.max(4, idString.length);
    return `INV-${idString.padStart(padding, "0")}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "Lunas",
      partial: "Sebagian",
      unpaid: "Belum Bayar",
    };
    return labels[status] || status;
  };

  const printInvoice = useCallback((transaction: Transaction) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Calculate remaining amount
    const totalAmount = Number(transaction.totalAmount);
    const paidAmount = Number(transaction.paidAmount || 0);
    const remainingAmount = totalAmount - paidAmount;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${formatInvoiceNumber(transaction.id)}</title>
          <style>
            @page {
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #000;
            }
            .invoice-header {
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }
            .invoice-info-item {
              flex: 1;
            }
            .invoice-info-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .invoice-table th,
            .invoice-table td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            .invoice-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .invoice-table td.text-right {
              text-align: right;
            }
            .invoice-total {
              margin-top: 20px;
              text-align: right;
            }
            .invoice-total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
            }
            .invoice-total-label {
              font-weight: bold;
              width: 150px;
              text-align: right;
              padding-right: 20px;
            }
            .invoice-total-value {
              width: 150px;
              text-align: right;
              font-weight: bold;
            }
            .invoice-footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .invoice-notes {
              margin-top: 20px;
              font-style: italic;
            }
            .invoice-warning {
              margin-top: 20px;
              padding: 15px;
              background-color: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 5px;
              color: #856404;
              font-weight: bold;
              text-align: center;
            }
            .invoice-payment-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-top: 10px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-info">
              <div class="invoice-info-item">
                <div class="invoice-info-label">Nomor Invoice:</div>
                <div>${formatInvoiceNumber(transaction.id)}</div>
              </div>
              <div class="invoice-info-item">
                <div class="invoice-info-label">Tanggal:</div>
                <div>${formatDate(transaction.transactionDate)}</div>
              </div>
            </div>
            ${
              transaction.customer && transaction.paymentStatus !== "paid"
                ? `
            <div class="invoice-info" style="margin-top: 15px;">
              <div class="invoice-info-item">
                <div class="invoice-info-label">Pelanggan:</div>
                <div>${transaction.customer.name}</div>
                ${transaction.customer.phone ? `<div style="font-size: 0.9em; color: #666;">${transaction.customer.phone}</div>` : ""}
                ${transaction.customer.address ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">${transaction.customer.address}</div>` : ""}
              </div>
            </div>
            `
                : ""
            }
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Produk</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${
                transaction.transactionItems
                  ?.map(
                    (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product?.name || "Produk tidak ditemukan"}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.price)}</td>
                  <td class="text-right">${formatCurrency(item.subtotal)}</td>
                </tr>
              `
                  )
                  .join("") || ""
              }
            </tbody>
          </table>

          <div class="invoice-total">
            <div class="invoice-total-row">
              <div class="invoice-total-label">Total:</div>
              <div class="invoice-total-value">
                ${formatCurrency(transaction.totalAmount)}
              </div>
            </div>
            <div class="invoice-total-row">
              <div class="invoice-total-label">Status Pembayaran:</div>
              <div class="invoice-total-value">
                ${getStatusLabel(transaction.paymentStatus)}
              </div>
            </div>
            <div class="invoice-total-row">
              <div class="invoice-total-label">Jumlah Dibayar:</div>
              <div class="invoice-total-value">
                ${formatCurrency(paidAmount)}
              </div>
            </div>
            ${
              transaction.paymentStatus !== "paid"
                ? `
            <div class="invoice-total-row">
              <div class="invoice-total-label">Sisa Belum Dibayar:</div>
              <div class="invoice-total-value" style="color: #dc3545;">
                ${formatCurrency(remainingAmount)}
              </div>
            </div>
            `
                : ""
            }
          </div>

          ${
            transaction.paymentStatus !== "paid"
              ? `
            <div class="invoice-warning">
              ⚠️ PERHATIAN: Dokumen ini bukan bukti pembayaran penuh. 
              Status pembayaran: ${getStatusLabel(transaction.paymentStatus)}
            </div>
          `
              : ""
          }

          ${
            transaction.notes
              ? `
            <div class="invoice-footer">
              <div class="invoice-info-label">Catatan:</div>
              <div class="invoice-notes">${transaction.notes}</div>
            </div>
          `
              : ""
          }
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }, []);

  return { printInvoice };
}
