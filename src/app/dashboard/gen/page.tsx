"use client";

import { useRef, useState } from "react";

import {
  Box,
  Button,
  HStack,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

import { LuDownload, LuPrinter } from "react-icons/lu";

import {
  useTranWt,
  useTranWts,
} from "@/hooks";

import { amountInWords } from "@/lib/numberToWords";

import AuthorizationLetter, {
  type AuthorizationLetterData,
} from "./AuthorizationLetter";

export default function GenerateAuthorizationPage() {
  const printRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     SELECTED TRANSACTION ID

     Keep this as NUMBER because useTranWt()
     expects a number.
  ===================================================== */

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [isDownloading, setIsDownloading] =
    useState(false);

  /* =====================================================
     GET ALL TRANSACTIONS
  ===================================================== */

  const {
    data: tranWts,
    isLoading: isLoadingList,
    isError: isListError,
  } = useTranWts();

  /* =====================================================
     GET SELECTED TRANSACTION

     No second "const selectedId" here.
  ===================================================== */

  const {
    data: tranWt,
    isLoading: isLoadingTransaction,
  } = useTranWt(selectedId ?? 0);

  /* =====================================================
     DOWNLOAD PDF
  ===================================================== */

  const handleDownloadPdf = async () => {
    const node = printRef.current;

    if (!node) return;

    setIsDownloading(true);

    try {
      const [
        { default: html2canvas },
        { default: jsPDF },
      ] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,

        width: node.offsetWidth,
        height: node.offsetHeight,

        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
      });

      const imageData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight
      );

      pdf.save(
        `authorization-letter-${tranWt?.id ?? "draft"}.pdf`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /* =====================================================
     PRINT
  ===================================================== */

  const handlePrint = () => {
    window.print();
  };

  /* =====================================================
     CREATE LETTER DATA FROM TRANSACTION
  ===================================================== */

  let letterData: AuthorizationLetterData | null =
    null;

  if (tranWt) {
    const from = tranWt.fromCompanyDetails;
    const to = tranWt.toCompanyDetails;

    /* -----------------------------------------------
       FROM COMPANY
    ------------------------------------------------ */

    const companyName =
      from?.companyName ??
      tranWt.fromCompanyId ??
      "LAXMI JEWELLERY CHENNAI PVT. LTD.";

    const companyAddress = [
      from?.address1,
      from?.address2,
      from?.address3,
      from?.address4,
    ]
      .filter(Boolean)
      .join(", ");

    /* -----------------------------------------------
       TO COMPANY
       → Carrier Name
    ------------------------------------------------ */

    const carrierName =
      to?.companyName ??
      tranWt.toCompanyId ??
      "—";

    /* -----------------------------------------------
       TO COMPANY ADDRESS
       → Destination
    ------------------------------------------------ */

    const destination = [
      to?.address1,
      to?.address2,
      to?.address3,
      to?.address4,
    ]
      .filter(Boolean)
      .join(", ");

    /* -----------------------------------------------
       TOTAL
       → CASH
    ------------------------------------------------ */

    const totalValue =
      tranWt.total ?? 0;

    /* -----------------------------------------------
       LETTER DATA
    ------------------------------------------------ */

    letterData = {
      date: tranWt.tranDate,

      jurisdiction: "Chennai",

      carrierName,

      sentDate: tranWt.tranDate,

      destination:
        destination || "—",

      /*
       * Gold Weight
       * intentionally NOT shown.
       */

      /*
       * NET WEIGHT
       * ↓
       * ORNAMENTS WEIGHT
       */

      ornamentsWeight:
        tranWt.netWt ?? 0,

      /*
       * TOTAL VALUE
       * ↓
       * CASH
       */

      cashAmount:
        totalValue,

      /*
       * TOTAL VALUE
       * ↓
       * AMOUNT IN WORDS
       */

      amountInWordsText:
        amountInWords(totalValue),

      /*
       * TRANSACTION ID
       * ↓
       * INVOICE / CHALLAN NO
       */

      invoiceNo:
        String(tranWt.id ?? "—"),

      invoiceDate:
        tranWt.tranDate,

      /* -------------------------------------------
         COMPANY DETAILS
      -------------------------------------------- */

      company: {
        companyName,

        subtitle:
          "MANUFACTURER • WHOLESALER • EXPORTER",

        email:
          from?.email ?? "",

        website:
          "https://jaigurujewellers.com/",

        cin:
          "",

        gstNo:
          from?.gstNo ?? "",

        panNo:
          from?.panNo ?? "",

        branchAddress:
          companyAddress,

        branchPhone:
          from?.phone ?? "",

        regdAddress:
          companyAddress,

        centreNo:
          "",
      },
    };
  }

  /* =====================================================
     LIST LOADING
  ===================================================== */

  if (isLoadingList) {
    return (
      <Box
        p={10}
        textAlign="center"
      >
        <Spinner size="lg" />

        <Text mt={3}>
          Loading transactions...
        </Text>
      </Box>
    );
  }

  /* =====================================================
     LIST ERROR
  ===================================================== */

  if (isListError) {
    return (
      <Box
        p={10}
        textAlign="center"
      >
        <Text color="red.500">
          Unable to load transactions.
        </Text>
      </Box>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <HStack
        justify="space-between"
        mb={5}
        className="no-print"
      >
        <HStack gap={3}>
          <Image
            src="/icon.png"
            alt="Letter logo"
            boxSize="44px"
            borderRadius="md"
          />

          <Box>
            <Heading size="lg">
              Authorization Letter
            </Heading>

            <Text
              fontSize="sm"
              color="fg.muted"
            >
              Transportation of goods
            </Text>
          </Box>
        </HStack>
      </HStack>

      {/* =================================================
          TRANSACTION SELECT
      ================================================= */}

      <Box
        className="no-print"
        borderWidth="1px"
        borderRadius="md"
        p={4}
        mb={5}
      >
        <Text
          fontWeight="medium"
          mb={2}
        >
          Select Transaction
        </Text>

        <select
          value={selectedId ?? ""}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedId(
              value ? Number(value) : null
            );
          }}
          style={{
            width: "100%",
            height: "40px",
            border: "1px solid #CBD5E0",
            borderRadius: "6px",
            padding: "0 12px",
            background: "white",
            fontSize: "14px",
          }}
        >
          <option value="">
            Select transaction...
          </option>

          {Array.isArray(tranWts) &&
            tranWts.map((item) => (
              <option
                key={item.id}
                value={String(item.id)}
              >
                {item.id}
                {" - "}
                {item.tranDate
                  ? new Date(
                      item.tranDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : ""}
                {" - "}
                {item.toCompanyDetails
                  ?.companyName ??
                  item.toCompanyId ??
                  ""}
              </option>
            ))}
        </select>

        {/* =================================================
            LOADING SELECTED TRANSACTION
        ================================================= */}

        {selectedId !== null &&
          isLoadingTransaction && (
            <HStack mt={3}>
              <Spinner size="sm" />

              <Text fontSize="sm">
                Loading transaction...
              </Text>
            </HStack>
          )}

        {/* =================================================
            SELECTED TRANSACTION INFO
        ================================================= */}

        {selectedId !== null &&
          tranWt && (
            <Box
              mt={4}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
            >
              <Text
                fontWeight="bold"
                mb={2}
              >
                Selected Transaction
              </Text>

              <Stack
                gap={1}
                fontSize="sm"
              >
                <Text>
                  <b>Challan No :</b>{" "}
                  {tranWt.id}
                </Text>

                <Text>
                  <b>Date :</b>{" "}
                  {tranWt.tranDate
                    ? new Date(
                        tranWt.tranDate
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "—"}
                </Text>

                <Text>
                  <b>From :</b>{" "}
                  {tranWt.fromCompanyDetails
                    ?.companyName ??
                    tranWt.fromCompanyId ??
                    "—"}
                </Text>

                <Text>
                  <b>To :</b>{" "}
                  {tranWt.toCompanyDetails
                    ?.companyName ??
                    tranWt.toCompanyId ??
                    "—"}
                </Text>

                <Text>
                  <b>Net Weight :</b>{" "}
                  {tranWt.netWt ?? 0} gm
                </Text>

                <Text>
                  <b>Total :</b>{" "}
                  {tranWt.total ?? 0}
                </Text>
              </Stack>
            </Box>
          )}
      </Box>

      {/* =================================================
          ACTION BUTTONS
      ================================================= */}

      <HStack
        gap={3}
        mb={5}
        className="no-print"
      >
        <Button
          onClick={handlePrint}
          disabled={!tranWt}
        >
          <LuPrinter />
          Print
        </Button>

        <Button
          onClick={handleDownloadPdf}
          disabled={!tranWt}
          loading={isDownloading}
          variant="outline"
        >
          <LuDownload />
          Download PDF
        </Button>
      </HStack>

      {/* =================================================
          AUTHORIZATION LETTER
      ================================================= */}

      {letterData ? (
        <AuthorizationLetter
          data={letterData}
          printRef={printRef}
       
        />
      ) : (
        <Box
          className="no-print"
          py={20}
          textAlign="center"
        >
          <Text color="gray.500">
            Select a transaction to preview
            the authorization letter.
          </Text>
        </Box>
      )}
    </>
  );
}