"use client";

import type { RefObject } from "react";
import type { TranWt } from "@/types";
import { amountInWords } from "@/lib/numberToWords";
import "./DeliveryChallan.css";

interface DeliveryChallanProps {
  tranWt: TranWt;
  printRef: RefObject<HTMLDivElement | null>;
  fontSize?: ChallanFontSize;
}

const money = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CHALLAN_FONT_SIZES = {
  small: {
    base: "9px",
    company: "8.5px",
    info: "8.5px",
    table: "8px",
    tableHeader: "8px",
    description: "8px",
    descriptionSub: "7.5px",
    weight: "7.5px",
    amount: "8px",
    words: "8px",
    declaration: "7px",
    signature: "8px",
    footer: "7px",
    stamp: "6px",
    title: "10px",
    logo: "20px",
    logoSubtitle: "7px",
  },

  medium: {
    base: "10px",
    company: "10px",
    info: "10px",
    table: "9.5px",
    tableHeader: "9.5px",
    description: "9.5px",
    descriptionSub: "9px",
    weight: "8.5px",
    amount: "9.5px",
    words: "9.5px",
    declaration: "8px",
    signature: "9px",
    footer: "8px",
    stamp: "7px",
    title: "11px",
    logo: "21px",
    logoSubtitle: "8px",
  },

  large: {
    base: "14px",
    company: "13px",
    info: "13px",
    table: "13px",
    tableHeader: "13px",
    description: "13px",
    descriptionSub: "12px",
    weight: "12px",
    amount: "13px",
    words: "13px",
    declaration: "11px",
    signature: "12px",
    footer: "11px",
    stamp: "10px",
    title: "14px",
    logo: "25px",
    logoSubtitle: "11px",
  },
} as const;

type ChallanFontSize = keyof typeof CHALLAN_FONT_SIZES;

const weight = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

const dateFormat = (date: string | Date | null | undefined) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function DeliveryChallan({
  tranWt,
  printRef,
  fontSize = "large",
}: DeliveryChallanProps) {
  const from = tranWt.fromCompanyDetails;
  const to = tranWt.toCompanyDetails;

  const totalValue = tranWt.total ?? 0;
  const fonts = CHALLAN_FONT_SIZES[fontSize];

  return (
    <div
      id="receipt-printable"
      ref={printRef}
      className="challan-page"
      style={
        {
          "--challan-base": fonts.base,
          "--challan-company": fonts.company,
          "--challan-info": fonts.info,
          "--challan-table": fonts.table,
          "--challan-table-header": fonts.tableHeader,
          "--challan-description": fonts.description,
          "--challan-description-sub": fonts.descriptionSub,
          "--challan-weight": fonts.weight,
          "--challan-amount": fonts.amount,
          "--challan-words": fonts.words,
          "--challan-declaration": fonts.declaration,
          "--challan-signature": fonts.signature,
          "--challan-footer": fonts.footer,
          "--challan-stamp": fonts.stamp,
          "--challan-title": fonts.title,
          "--challan-logo": fonts.logo,
          "--challan-logo-subtitle": fonts.logoSubtitle,
        } as React.CSSProperties
      }
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="challan-header">
        <div className="challan-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="logo-symbol" />

          <div>
            <div className="logo-name">
              {from?.companyName ?? tranWt.fromCompanyId ?? "LAXMI JEWELLERY"}
            </div>

            <div className="logo-subtitle">
              MANUFACTURER • WHOLESALER • EXPORTER
            </div>
          </div>
        </div>

        {/* No fixed height on this box — see .challan-title in the CSS.
            Equal top/bottom padding centers the text and lets the box
            grow to fit it, so html2canvas can never clip it against a
            border, unlike a fixed-height box combined with line-height
            or table-cell centering. */}
        <div className="challan-title" style={{ fontSize: fonts.title }}>
          Delivery Challan for Goods sent on Approval
        </div>
      </div>

      {/* =========================================================
          DISPATCH TO / DISPATCH FROM
      ========================================================= */}

      <div className="company-grid">
        {/* DISPATCH TO */}

        <div className="company-box">
          <div className="company-heading" style={{ fontSize: fonts.title }}>
            Dispatch To
          </div>

          <div className="company-details">
            <div>
              <span className="label">
                <span className="label-text">Company</span>
                <span className="label-colon">:</span>
              </span>
              <span>{to?.companyName ?? tranWt.toCompanyId ?? "—"}</span>
            </div>

            <div>
              <span className="label">
                <span className="label-text">Address</span>
                <span className="label-colon">:</span>
              </span>
              <span>
                {[to?.address1, to?.address2].filter(Boolean).join(", ") || "—"}
              </span>
            </div>

            <div>
              <span className="label">
                <span className="label-text">GST No</span>
                <span className="label-colon">:</span>
              </span>
              <span>{to?.gstNo ?? "—"}</span>
            </div>

            <div>
              <span className="label">
                <span className="label-text">PAN No</span>
                <span className="label-colon">:</span>
              </span>
              <span>{to?.panNo ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* DISPATCH FROM */}

        <div className="company-box">
          <div className="company-heading" style={{ fontSize: fonts.title }}>
            Dispatch From
          </div>

          <div className="company-details">
            <div>
              <span className="label">
                <span className="label-text">Company</span>
                <span className="label-colon">:</span>
              </span>
              <span>{from?.companyName ?? tranWt.fromCompanyId ?? "—"}</span>
            </div>

            <div>
              <span className="label">
                <span className="label-text">Address</span>
                <span className="label-colon">:</span>
              </span>
              <span>
                {[from?.address1, from?.address2].filter(Boolean).join(", ") ||
                  "—"}
              </span>
            </div>

            <div>
              <span className="label">
                <span className="label-text">GST No</span>
                <span className="label-colon">:</span>
              </span>
              <span>{from?.gstNo ?? "—"}</span>
            </div>

            <div>
              <span className="label">
                <span className="label-text">PAN No</span>
                <span className="label-colon">:</span>
              </span>
              <span>{from?.panNo ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FROM COMPANY ADDITIONAL INFORMATION
      ========================================================= */}

      <div className="info-grid">
        {/* FROM COMPANY - LEFT */}

        <div className="info-cell from-company-info">
          <div className="info-row">
            <span className="label">
              <span className="label-text">PAN No</span>
              <span className="label-colon">:</span>
            </span>

            <span>{from?.panNo ?? "—"}</span>
          </div>

          <div className="info-row">
            <span className="label">
              <span className="label-text">State / Code</span>
              <span className="label-colon">:</span>
            </span>

            <span>{from?.stateId ?? "—"}</span>
          </div>
        </div>

        {/* FROM COMPANY - MIDDLE */}

        <div className="info-cell from-company-info">
          <div className="info-row">
            <span className="label">
              <span className="label-text">GST No</span>
              <span className="label-colon">:</span>
            </span>

            <span>{from?.gstNo ?? "—"}</span>
          </div>

          <div className="info-row">
            <span className="label">
              <span className="label-text">Email Id</span>
              <span className="label-colon">:</span>
            </span>

            <span>{from?.email ?? "—"}</span>
          </div>
        </div>

        {/* DELIVERY CHALLAN - RIGHT */}

        <div className="info-cell challan-info">
          <div className="info-row">
            <span className="label">
              <span className="label-text">Challan No</span>
              <span className="label-colon">:</span>
            </span>

            <span>{tranWt.id ?? "—"}</span>
          </div>

          <div className="info-row">
            <span className="label">
              <span className="label-text">Date</span>
              <span className="label-colon">:</span>
            </span>

            <span>{dateFormat(tranWt.tranDate)}</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          ITEM TABLE
      ========================================================= */}

      <table className="items-table">
        <colgroup>
          <col className="col-sno" />
          <col className="col-description" />
          <col className="col-hsn" />
          <col className="col-netwt" />
          <col className="col-rate" />
          <col className="col-value" />
          <col className="col-total" />
        </colgroup>

        <thead>
          <tr>
            <th>S.No</th>
            <th>DESCRIPTION</th>
            <th>HSN</th>
            <th>NETWT</th>
            <th>RATE</th>
            <th>VALUE</th>
            <th>TOTAL</th>
          </tr>
        </thead>

        <tbody>
          <tr className="item-row">
            <td className="center">1</td>

            <td>
              <div className="description-main">
                {tranWt.metalName ?? tranWt.metalId ?? "GOLD"} ORNAMENT
              </div>

              {tranWt.description && (
                <div className="description-sub">{tranWt.description}</div>
              )}

              <table className="weight-table">
                <thead>
                  <tr>
                    <th>Grs Wt</th>
                    <th>Stn Wt</th>
                    <th>Net Wt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{weight(tranWt.grsWt)}</td>
                    <td>{weight(tranWt.stnWt)}</td>
                    <td>{weight(tranWt.netWt)}</td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td className="center">{tranWt.hsnCode ?? "—"}</td>

            <td className="right">{weight(tranWt.netWt)}</td>

            <td className="right">{money(tranWt.rate)}</td>

            <td className="right">{money(tranWt.value)}</td>

            <td className="right">{money(totalValue)}</td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={5} className="total-label">
              Total
            </td>

            <td className="right">{money(tranWt.value)}</td>

            <td className="right">{money(totalValue)}</td>
          </tr>
        </tfoot>
      </table>

      {/* =========================================================
          TOTAL AMOUNT + GST
      ========================================================= */}

      <div className="amount-grid">
        <div className="amount-words">
          <div className="section-label">Total Invoice amount in words</div>

          <div className="words">{amountInWords(totalValue)}</div>
        </div>

        <div className="amount-summary">
          <div className="amount-line">
            <span>Total Amount</span>
            <span>{money(tranWt.value)}</span>
          </div>

          <div className="amount-line">
            <span>CGST {tranWt.cgstPer ?? 0}%</span>

            <span>{money(tranWt.csstAmt)}</span>
          </div>

          <div className="amount-line">
            <span>SGST {tranWt.sgstPer ?? 0}%</span>

            <span>{money(tranWt.sgstAmt)}</span>
          </div>

          <div className="amount-line">
            <span>IGST {tranWt.igstPer ?? 0}%</span>

            <span>{money(tranWt.igstAmt)}</span>
          </div>

          <div className="amount-line">
            <span>ROUND OFF</span>

            <span>{money(0)}</span>
          </div>

          <div className="amount-line final-total">
            <span>Total Value</span>

            <span>{money(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          DECLARATION
      ========================================================= */}

      <div className="declaration">
        <p>
          Items listed in this invoice / delivery challan are solely for
          commercial transactions. There is no political affiliation or
          intension to support any political entity or campaign associated with
          the movement of these goods.
        </p>

        <p>
          Goods (Jewellery) sent on approval basis as per circular
          10/10/2017-GST vide Rule 55 sub rule (1) Clause (C) and sub rule (4)
          of the CGST Act 2017.
        </p>

        <p>
          No. of E-way bill is required to be generated as the Goods covered
          under this document are sent on approval basis.
        </p>

        <p>E. &amp; O.E. • Terms &amp; Conditions Signature</p>

        <p>• THIS GOODS ARE SEND FOR APPROVAL</p>
      </div>

      {/* =========================================================
          SIGNATURE SECTION
      ========================================================= */}

      <div className="signature-grid">
        <div className="signature-box">
          <div className="signature-title">Received By</div>

          <div className="signature-space">
            Name : {to?.companyName ?? tranWt.toCompanyId ?? "—"}
          </div>

          <div className="signature-line">Signed Signature</div>
        </div>

        <div className="signature-box right-signature">
          <div className="signature-title">
            For {from?.companyName ?? tranWt.fromCompanyId ?? "—"}
          </div>

          <div className="signature-space">
            <br />
            <br />
          </div>

          <div className="authorised">Director / Authorised Signatory</div>
        </div>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <div className="challan-footer">
        <div className="footer-company">
          <strong>
            {from?.companyName ?? tranWt.fromCompanyId ?? "Company Name"}
          </strong>

          <div>
            Address :{" "}
            {[from?.address1, from?.address2, from?.address3, from?.address4]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>

          <div>
            Phone : {from?.phone ?? "—"} &nbsp;&nbsp; GSTIN :{" "}
            {from?.gstNo ?? "—"}
          </div>
        </div>

        {/* <div className="footer-stamp">
          <div className="stamp-circle">COMPANY</div>
        </div> */}
      </div>
    </div>
  );
}