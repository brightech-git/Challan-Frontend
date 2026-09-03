"use client";

import { useMemo, useRef, useState } from "react";
import {
  Box,
  Center,
  Heading,
  HStack,
  IconButton,
  Image,
  NativeSelect,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuDownload, LuPrinter } from "react-icons/lu";
import { useTranWt, useTranWts } from "@/hooks";
import { amountInWords } from "@/lib/numberToWords";
import DeliveryChallan from "./DeliveryChallan";
import AuthorizationLetter from "../gen/AuthorizationLetter";

type DocumentType = "delivery-challan" | "authorization-letter";

export default function GenerateReceiptPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [documentType, setDocumentType] = useState<DocumentType>("delivery-challan");
  const [isDownloading, setIsDownloading] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);
  const printRefAuth = useRef<HTMLDivElement>(null);
  
  const { data: tranWts, isLoading: isListLoading } = useTranWts();
  const { data: tranWt, isLoading: isDetailLoading } = useTranWt(
    selectedId ? Number(selectedId) : null
  );

  const options = useMemo(
    () =>
      (tranWts ?? []).map((t) => ({
        value: String(t.id),
        label: `#${t.id} — ${t.fromCompanyDetails?.companyName ?? t.fromCompanyId} → ${
          t.toCompanyDetails?.companyName ?? t.toCompanyId
        } (${t.tranDate ? new Date(t.tranDate).toLocaleDateString("en-IN") : "no date"})`,
      })),
    [tranWts]
  );

  const authorizationData = useMemo(() => {
    if (!tranWt) return null;

    const from = tranWt.fromCompanyDetails;
    const to = tranWt.toCompanyDetails;

    return {
      date: tranWt.tranDate,
      jurisdiction: "Chennai",
      carrierName: to?.companyName ?? tranWt.toCompanyId ?? "—",
      sentDate: tranWt.tranDate,
      destination: [to?.address1, to?.address2, to?.address3, to?.address4]
        .filter(Boolean)
        .join(", ") || "—",
      goldWeight: tranWt.netWt ?? null,
      ornamentsWeight: tranWt.netWt ?? null,
      cashAmount: tranWt.total ?? null,
      amountInWordsText: amountInWords(tranWt.total ?? 0),
      invoiceNo: String(tranWt.id),
      invoiceDate: tranWt.tranDate,
      company: {
        companyName: from?.companyName ?? "Laxmi Jewellery",
        subtitle: "MANUFACTURERS • WHOLESALERS • EXPORTERS",
        email: from?.email ?? null,
        website: null,
        cin: null,
        gstNo: from?.gstNo ?? null,
        panNo: from?.panNo ?? null,
        branchAddress: [from?.address1, from?.address2].filter(Boolean).join(", ") || null,
        branchPhone: from?.phone ?? null,
        regdAddress: [from?.address1, from?.address2, from?.address3, from?.address4]
          .filter(Boolean)
          .join(", ") || null,
        centreNo: null,
      },
    };
  }, [tranWt]);

  const downloadSinglePdf = async (node: HTMLDivElement, filename: string) => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    node.style.display = 'block';
    node.style.visibility = 'visible';
    node.style.opacity = '1';

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: node.scrollWidth,
      height: node.scrollHeight,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
      onclone: (document) => {
        const clonedElement = document.getElementById(node.id || 'receipt-printable');
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
        }
      }
    });

    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  };

  const handlePrint = () => {
    if (!tranWt) return;

    // DeliveryChallan.css / Authorization.css already define an
    // @media print block that hides everything except the visible
    // #receipt-printable / #auth-letter-printable element, so printing
    // the current window directly (no extra popup window) picks up
    // whichever document is currently selected.
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!tranWt) return;

    setIsDownloading(true);

    try {
      const node = documentType === "delivery-challan" 
        ? printRef.current 
        : printRefAuth.current;
      
      const filename = documentType === "delivery-challan"
        ? `delivery-challan-${tranWt.id}.pdf`
        : `authorization-letter-${tranWt.id}.pdf`;

      if (node) {
        await downloadSinglePdf(node, filename);
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <HStack
        justify="space-between"
        mb={6}
        className="no-print"
      >
        <HStack gap={3}>
          <Image src="/icon.png" alt="Challan logo" boxSize="44px" borderRadius="md" />
          <Box>
            <Heading size="lg">Generate Document</Heading>
            <Text fontSize="sm" color="fg.muted">
              Generate Delivery Challan or Authorization Letter
            </Text>
          </Box>
        </HStack>
      </HStack>

      <Stack gap={5}>

        <VStack
          gap={4}
          align="flex-start"
          className="no-print"
        >
          <HStack
            gap={4}
            align="flex-end"
            flexWrap="wrap"
            w="full"
          >
            <Box minW="280px">
              <Text
                fontSize="sm"
                fontWeight="medium"
                mb={1}
              >
                Select transaction
              </Text>

              <NativeSelect.Root>
                <NativeSelect.Field
                  value={selectedId}
                  onChange={(e) =>
                    setSelectedId(e.target.value)
                  }
                  placeholder={
                    isListLoading
                      ? "Loading transactions..."
                      : "Select a transaction"
                  }
                >
                  {options.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </NativeSelect.Field>

                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Box>

            <Box minW="200px">
              <Text
                fontSize="sm"
                fontWeight="medium"
                mb={1}
              >
                Document Type
              </Text>

              <NativeSelect.Root>
                <NativeSelect.Field
                  value={documentType}
                  onChange={(e) =>
                    setDocumentType(e.target.value as DocumentType)
                  }
                >
                  <option value="delivery-challan">Delivery Challan</option>
                  <option value="authorization-letter">Authorization Letter</option>
                </NativeSelect.Field>

                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Box>

            <HStack gap={2}>
              <IconButton
                aria-label="Print"
                title="Print"
                onClick={handlePrint}
                disabled={!tranWt}
                variant="ghost"
                color="gray.800"
                _dark={{ color: "gray.100" }}
              >
                <LuPrinter size={20} />
              </IconButton>

              <IconButton
                aria-label="Download PDF"
                title="Download PDF"
                onClick={handleDownloadPdf}
                disabled={!tranWt || isDownloading}
                loading={isDownloading}
                variant="ghost"
                color="gray.800"
                _dark={{ color: "gray.100" }}
              >
                <LuDownload size={20} />
              </IconButton>
            </HStack>
          </HStack>
        </VStack>

        {!selectedId && (
          <Text
            color="fg.muted"
            className="no-print"
          >
            Pick a transaction above to preview
            its document.
          </Text>
        )}

        {selectedId && isDetailLoading && (
          <Center
            py={12}
            className="no-print"
          >
            <Spinner size="lg" />
          </Center>
        )}

        {tranWt && (
          <>
            <div style={{ display: documentType === "delivery-challan" ? "block" : "none" }}>
              <DeliveryChallan
                tranWt={tranWt}
                printRef={printRef}
                fontSize="large"
              />
            </div>

            {tranWt && authorizationData && (
              <div style={{ display: documentType === "authorization-letter" ? "block" : "none" }}>
                <AuthorizationLetter
                  data={authorizationData}
                  printRef={printRefAuth}
                />
              </div>
            )}
          </>
        )}

      </Stack>
    </>
  );
}