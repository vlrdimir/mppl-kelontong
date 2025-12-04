import { useCallback } from "react";
import type { Debt } from "@/lib/types";

export function usePrintDebtInvoice() {
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

  const printDebtInvoice = useCallback((debt: Debt) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Bukti Pelunasan Piutang ${formatInvoiceNumber(
            debt.transactionId
          )}</title>
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
            .invoice-customer {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .invoice-customer-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
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
              width: 200px;
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
            .invoice-success {
              margin-top: 20px;
              padding: 15px;
              background-color: #d4edda;
              border: 2px solid #28a745;
              border-radius: 5px;
              color: #155724;
              font-weight: bold;
              text-align: center;
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
            <div class="invoice-title">BUKTI PELUNASAN PIUTANG</div>
            <div class="invoice-info">
              <div class="invoice-info-item">
                <div class="invoice-info-label">Nomor Invoice:</div>
                <div>${formatInvoiceNumber(debt.transactionId)}</div>
              </div>
              <div class="invoice-info-item">
                <div class="invoice-info-label">Tanggal Pelunasan:</div>
                <div>${formatDate(debt.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div class="invoice-customer">
            <div class="invoice-customer-title">Informasi Pelanggan</div>
            <div style="margin-bottom: 5px;">
              <strong>Nama:</strong> ${debt.customer?.name || "-"}
            </div>
            ${
              debt.customer?.phone
                ? `<div style="margin-bottom: 5px;"><strong>Telepon:</strong> ${debt.customer.phone}</div>`
                : ""
            }
            ${
              debt.customer?.address
                ? `<div style="margin-bottom: 5px;"><strong>Alamat:</strong> ${debt.customer.address}</div>`
                : ""
            }
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Keterangan</th>
                <th class="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Piutang</td>
                <td class="text-right">${formatCurrency(debt.totalDebt)}</td>
              </tr>
              <tr>
                <td>Total Dibayar</td>
                <td class="text-right" style="color: #28a745;">${formatCurrency(
                  debt.paidAmount
                )}</td>
              </tr>
              <tr>
                <td>Sisa Piutang</td>
                <td class="text-right" style="color: #dc3545; font-weight: bold;">${formatCurrency(
                  debt.remainingDebt
                )}</td>
              </tr>
            </tbody>
          </table>

          ${
            debt.debtPayments && debt.debtPayments.length > 0
              ? `
          <div style="margin-top: 30px;">
            <div class="invoice-info-label" style="margin-bottom: 10px;">Riwayat Pembayaran:</div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th class="text-right">Jumlah</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                ${debt.debtPayments
                  .map(
                    (payment, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(payment.paymentDate)}</td>
                    <td class="text-right">${formatCurrency(
                      payment.amount
                    )}</td>
                    <td>${payment.notes || "-"}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          <div class="invoice-total">
            <div class="invoice-total-row">
              <div class="invoice-total-label">Status:</div>
              <div class="invoice-total-value" style="color: #28a745;">
                LUNAS
              </div>
            </div>
          </div>

          <div class="invoice-success">
            ✓ Piutang telah dilunasi sepenuhnya
          </div>

          <div class="invoice-footer">
            <div style="text-align: center; margin-top: 30px;">
              <div style="margin-bottom: 50px;">
                <div>Terima kasih atas pembayarannya</div>
              </div>
            </div>
          </div>
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

  return { printDebtInvoice };
}
