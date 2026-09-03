"use client";

import type { RefObject } from "react";
import "./Authorization.css";

export interface AuthorizationLetterData {
  date: string | Date | null | undefined;
  jurisdiction?: string;

  carrierName: string;
  sentDate: string | Date | null | undefined;
  destination: string;

  ornamentsWeight?: string | number | null;
  cashAmount?: string | number | null;
  amountInWordsText?: string | null;

  invoiceNo: string;
  invoiceDate: string | Date | null | undefined;

  company: {
    companyName?: string | null;
    subtitle?: string | null;

    email?: string | null;
    website?: string | null;
    cin?: string | null;

    gstNo?: string | null;
    panNo?: string | null;

    branchAddress?: string | null;
    branchPhone?: string | null;

    regdAddress?: string | null;
    centreNo?: string | null;
  };
}

interface AuthorizationLetterProps {
  data: AuthorizationLetterData;
  printRef: RefObject<HTMLDivElement | null>;
}

const dateFormat = (
  date: string | Date | null | undefined
) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function AuthorizationLetter({
  data,
  printRef,
}: AuthorizationLetterProps) {
  const c = data.company;

  return (
    <div
      id="auth-letter-printable"
      ref={printRef}
      className="letter-page"
    >
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="letter-header">

        {/* CENTER COMPANY BRAND */}

        <div className="company-brand">

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt=""
            className="letter-logo"
          />

          <div className="brand-text">
            <div className="company-name">
              {c.companyName || "LAXMI JEWELLERY"}
            </div>

            <div className="company-subtitle">
              {c.subtitle ||
                "MANUFACTURER • WHOLESALER • EXPORTER"}
            </div>
          </div>

        </div>


        {/* TOP LEFT */}

        <div className="header-left-info">

          {c.email && (
            <div>
              <span>Email :</span>
              <strong>{c.email}</strong>
            </div>
          )}

          {c.website && (
            <div>
              <span>Web :</span>
              <strong>{c.website}</strong>
            </div>
          )}

          {c.cin && (
            <div>
              <span>CIN :</span>
              <strong>{c.cin}</strong>
            </div>
          )}

        </div>


        {/* TOP RIGHT */}

        <div className="header-right-info">

          {c.gstNo && (
            <div>
              <span>GSTIN :</span>
              <strong>{c.gstNo}</strong>
            </div>
          )}

          {c.panNo && (
            <div>
              <span>PAN :</span>
              <strong>{c.panNo}</strong>
            </div>
          )}

          <div>
            <span>Date :</span>
            <strong>{dateFormat(data.date)}</strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          SUBJECT
      ===================================================== */}

      <div className="subject-line">
        Subject to {data.jurisdiction || "Chennai"} Jurisdiction
      </div>


      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="authorization-title">
        Authorization for Transportation of Goods
      </div>


      <div className="to-whom">
        TO WHOM SO EVER IT MAY CONCERN
      </div>


      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="letter-content">

        <p>
          This is to certify that Sri/Smt/M/s{" "}
          <span className="fill-line">
            {data.carrierName || "________________________"}
          </span>{" "}
          is our Authorized Employee / Logistics /
          Representative / Director / Customer and the Gold /
          Gold Ornaments detailed below is sent with him on
          dated{" "}
          <span className="fill-line">
            {dateFormat(data.sentDate)}
          </span>{" "}
          To{" "}
          <span className="fill-line">
            {data.destination || "________________________"}
          </span>{" "}
          for Sample / Approval / Exchange / Manufacture /
          Repair / Sell / Hallmarking / Bank / Marketing.
        </p>


        <p>
          He carries Ornaments / Fine Gold / Cash as delivered
          by us / our customer / Gold smith against Order /
          Job work / Sales / Purchases.
        </p>


        <p>
          Once the goods are selected and approved, Sales
          Invoice / Purchase Invoice / Job work Invoice will
          be issued. This details of Gold / Ornaments / Cash
          are given below.
        </p>


        {/* =================================================
            WEIGHT / CASH
        ================================================= */}

        <div className="details-block">

          <div className="detail-row">

            <div className="detail-item">
              <span>Ornaments Weight :</span>
              <strong>
                {data.ornamentsWeight ?? "—"} gm
              </strong>
            </div>

            <div className="detail-item">
              <span>Cash :</span>
              <strong>
                {data.cashAmount ?? "—"}
              </strong>
            </div>

          </div>


          <div className="words-row">
            <span>In (Words) :</span>

            <strong>
              {data.amountInWordsText || "—"}
            </strong>

            <span>Respectively.</span>
          </div>


          <div className="invoice-row">
            <span>
              Tax Invoice / Delivery Challan No :
            </span>

            <strong>
              {data.invoiceNo || "—"}
            </strong>

            <span>, Dated :</span>

            <strong>
              {dateFormat(data.invoiceDate)}
            </strong>

            <span>Respectively.</span>
          </div>

        </div>


        {/* =================================================
            SIGNATURE AREA
        ================================================= */}

        <div className="signature-section">

          <div className="carrier-signature">

            <div>
              We attested here with the carrier&apos;s
              signature.
            </div>

            <div className="carrier-line" />

          </div>


          <div className="company-signature">

            <div className="for-company">
              For {c.companyName || "LAXMI JEWELLERY"}
            </div>

            <div className="stamp-area">
              {/* Optional stamp can be placed here */}
            </div>

            <div className="director-line">
              Director / Authorised signatory
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="letter-footer">

        <strong>
          {c.companyName || "LAXMI JEWELLERY CHENNAI PVT. LTD."}
        </strong>

        {c.branchAddress && (
          <div>
            Branch Off. : {c.branchAddress}
            {c.branchPhone && (
              <>
                {" , Phone : "}
                {c.branchPhone}
              </>
            )}
          </div>
        )}

        {c.regdAddress && (
          <div>
            Regd. Off. : {c.regdAddress}
          </div>
        )}

        <div>
          {c.centreNo && (
            <>
              Centre No. : {c.centreNo}
              &nbsp;&nbsp;
            </>
          )}

          {c.email && (
            <>
              email : {c.email}
              &nbsp;&nbsp;
            </>
          )}

          {c.website && (
            <>
              website : {c.website}
            </>
          )}
        </div>

      </div>

    </div>
  );
}