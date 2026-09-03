import { TranWt } from "@/types";



export const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const weight = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function escapeHtml(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + (ones ? ` ${ONES[ones]}` : "");
}

function threeDigitWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const hundredsPart = hundreds ? `${ONES[hundreds]} Hundred` : "";
  const restPart = rest ? twoDigitWords(rest) : "";
  return [hundredsPart, restPart].filter(Boolean).join(" ");
}

function intToWords(n: number): string {
  if (n === 0) return "Zero";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  return [
    crore ? `${threeDigitWords(crore)} Crore` : "",
    lakh ? `${threeDigitWords(lakh)} Lakh` : "",
    thousand ? `${threeDigitWords(thousand)} Thousand` : "",
    hundred ? threeDigitWords(hundred) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** e.g. 6184424.42 -> "Rupees Sixty One Lakh ... and Forty Two Paise Only" */
export function amountInWords(amount: number): string {
  const abs = Math.abs(amount);
  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);

  let words = `Rupees ${intToWords(rupees)}`;
  if (paise) words += ` and ${intToWords(paise)} Paise`;
  return `${words} Only`;
}

const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString() : "—");

export function buildTableReceiptHtml(row: TranWt): string {
  const from = row.fromCompanyDetails;
  const to = row.toCompanyDetails;

  const fromAddress = [from?.address1, from?.address2, from?.address3, from?.address4]
    .filter(Boolean)
    .join(", ");
  const toAddress = [to?.address1, to?.address2, to?.address3, to?.address4]
    .filter(Boolean)
    .join(", ");

  const netWt = row.netWt ?? (row.grsWt ?? 0) - (row.stnWt ?? 0);
  const total = row.total ?? 0;

  return `
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; }
  .challan { width: 210mm; min-height: 297mm; padding: 7mm; }
  .header { text-align: center; position: relative; min-height: 20mm; }
  .company-name { font-size: 22px; font-weight: bold; }
  .tagline { font-size: 8px; letter-spacing: 2px; }
  .title { text-align: center; border: 1px solid #000; padding: 5px; font-size: 13px; font-weight: bold; margin-top: 4mm; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border: 1px solid #000; padding: 4px; vertical-align: top; }
  .label { font-weight: bold; }
  .center { text-align: center; }
  .right { text-align: right; }
  .section-title { text-align: center; font-weight: bold; background: #eee; padding: 4px; }
  .items th { background: #eee; text-align: center; }
  .notes { border: 1px solid #000; padding: 6px; margin-top: 5px; line-height: 1.5; font-size: 9px; }
  .signature { margin-top: 15mm; }
  .signature td { border: none; height: 60px; }
  .footer { text-align: center; margin-top: 10mm; border-top: 1px solid #000; padding-top: 4px; font-size: 9px; }
  .words-row td { font-style: italic; }
</style>

<div class="challan">
  <div class="header">
    <div class="company-name">${escapeHtml(from?.companyName) || "—"}</div>
    <div class="tagline">MANUFACTURER &bull; WHOLESALER &bull; EXPORTER</div>
  </div>

  <div class="title">DELIVERY CHALLAN</div>

  <br>

  <table>
    <tr>
      <td width="50%">
        <div class="section-title">DISPATCH FROM</div>
        <b>Company:</b> ${escapeHtml(from?.companyName)}<br><br>
        <b>Address:</b> ${escapeHtml(fromAddress)}<br><br>
        <b>Phone:</b> ${escapeHtml(from?.phone)}<br><br>
        <b>Email:</b> ${escapeHtml(from?.email)}<br><br>
        <b>GST No:</b> ${escapeHtml(from?.gstNo)}<br><br>
        <b>PAN No:</b> ${escapeHtml(from?.panNo)}
      </td>
      <td width="50%">
        <div class="section-title">DISPATCH TO</div>
        <b>Company:</b> ${escapeHtml(to?.companyName)}<br><br>
        <b>Address:</b> ${escapeHtml(toAddress)}<br><br>
        <b>Phone:</b> ${escapeHtml(to?.phone)}<br><br>
        <b>Email:</b> ${escapeHtml(to?.email)}<br><br>
        <b>GST No:</b> ${escapeHtml(to?.gstNo)}<br><br>
        <b>PAN No:</b> ${escapeHtml(to?.panNo)}
      </td>
    </tr>
  </table>

  <br>

  <table>
    <tr>
      <td><b>Challan No</b><br>${escapeHtml(row.id)}</td>
      <td><b>Transaction Date</b><br>${fmtDate(row.tranDate)}</td>
      <td><b>Metal</b><br>${escapeHtml(row.metalName ?? row.metalId) || "—"}</td>
      <td><b>HSN Code</b><br>${escapeHtml(row.hsnCode) || "—"}</td>
    </tr>
  </table>

  <br>

  <table class="items">
    <thead>
      <tr>
        <th>S.No</th>
        <th>Description</th>
        <th>HSN</th>
        <th>Gross Wt</th>
        <th>Stone Wt</th>
        <th>Net Wt</th>
        <th>Rate</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>${escapeHtml(row.description) || "—"}</td>
        <td class="center">${escapeHtml(row.hsnCode) || "—"}</td>
        <td class="right">${row.grsWt != null ? weight(row.grsWt) : "—"}</td>
        <td class="right">${row.stnWt != null ? weight(row.stnWt) : "—"}</td>
        <td class="right">${weight(netWt)}</td>
        <td class="right">${row.rate != null ? money(row.rate) : "—"}</td>
        <td class="right">${row.value != null ? money(row.value) : "—"}</td>
      </tr>
      <tr>
        <td colspan="7" class="right"><b>TOTAL</b></td>
        <td class="right"><b>${row.value != null ? money(row.value) : "—"}</b></td>
      </tr>
    </tbody>
  </table>

  <br>

  <table>
    <tr>
      <td width="60%" rowspan="5">
        <b>Transaction Description</b><br><br>
        ${escapeHtml(row.description) || "—"}
      </td>
      <td>Total Amount</td>
      <td class="right">${row.value != null ? money(row.value) : "—"}</td>
    </tr>
    <tr>
      <td>CGST ${row.cgstPer != null ? row.cgstPer : 0}%</td>
      <td class="right">${row.csstAmt != null ? money(row.csstAmt) : "0.00"}</td>
    </tr>
    <tr>
      <td>SGST ${row.sgstPer != null ? row.sgstPer : 0}%</td>
      <td class="right">${row.sgstAmt != null ? money(row.sgstAmt) : "0.00"}</td>
    </tr>
    <tr>
      <td>IGST ${row.igstPer != null ? row.igstPer : 0}%</td>
      <td class="right">${row.igstAmt != null ? money(row.igstAmt) : "0.00"}</td>
    </tr>
    <tr>
      <td><b>TOTAL VALUE</b></td>
      <td class="right"><b>${money(total)}</b></td>
    </tr>
    <tr class="words-row">
      <td colspan="2">Amount in words: ${escapeHtml(amountInWords(total))}</td>
    </tr>
  </table>

  <div class="notes">
    <b>Terms &amp; Conditions</b><br><br>
    Goods listed in this delivery challan are sent for commercial transaction purposes.<br>
    Goods are sent on approval basis.<br>
    The recipient shall verify the quantity, weight and description of the goods at the time of receipt.<br>
    Any discrepancy should be reported immediately.<br><br>
    <b>E. &amp; O.E.</b>
  </div>

  <table class="signature">
    <tr>
      <td width="50%">
        <b>Received By</b><br><br><br>
        Name: ___________________________<br><br>
        Signature: _______________________
      </td>
      <td width="50%" class="center">
        <b>For ${escapeHtml(from?.companyName) || "—"}</b><br><br><br><br>
        <b>Director / Authorised Signatory</b>
      </td>
    </tr>
  </table>

  <div class="footer">
    <b>${escapeHtml(from?.companyName) || "—"}</b><br>
    ${escapeHtml(fromAddress)}<br>
    Phone: ${escapeHtml(from?.phone)} &nbsp;|&nbsp; Email: ${escapeHtml(from?.email)}<br>
    GSTIN: ${escapeHtml(from?.gstNo)} &nbsp;|&nbsp; PAN: ${escapeHtml(from?.panNo)}
  </div>
</div>
`;
}
