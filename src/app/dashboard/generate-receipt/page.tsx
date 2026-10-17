"use client";

import { useMemo, useRef, useState } from "react";
import {
  Box,
  Combobox,
  Center,
  HStack,
  IconButton,
  Image,
  Portal,
  NativeSelect,
  Spinner,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import { LuDownload, LuPrinter } from "react-icons/lu";
import { useTranWt, useTranWts } from "@/hooks";
import { amountInWords } from "@/lib/numberToWords";
import DeliveryChallan from "./DeliveryChallan";
import AuthorizationLetter from "./AuthorizationLetter";
import { useCopyLabels } from "@/hooks/useCopyLabels";

type DocumentType = "delivery-challan" | "authorization-letter";

export default function GenerateReceiptPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");


  const [documentType, setDocumentType] = useState<DocumentType>("delivery-challan");
  const [isDownloading, setIsDownloading] = useState(false);
  const [outputError, setOutputError] = useState("");
  const { labels } = useCopyLabels();
  const copyLabels = labels.slice(0, 2);
  
  const printRef = useRef<HTMLIFrameElement>(null);
  const printRefAuth = useRef<HTMLIFrameElement>(null);
  const secondPrintRef = useRef<HTMLIFrameElement>(null);
  const secondPrintRefAuth = useRef<HTMLIFrameElement>(null);
  
  const { data: tranWts, isLoading: isListLoading, error: listError } = useTranWts(search.trim() || undefined);
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
      carrierAddress: [to?.address1, to?.address2, to?.address3, to?.address4]
        .filter(Boolean)
        .join(", "),
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
        subtitle: tranWt.header1 ?? null,
        email: from?.email ?? null,
        website: null,
        cin: from?.cinNo ?? null,
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

  const downloadCopiesPdf = async (nodes: HTMLElement[], filename: string) => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    for (const [index, node] of nodes.entries()) {
    await node.ownerDocument.fonts.ready;
    await Promise.all(Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)));
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
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(node.id || 'receipt-printable');
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
        }

        // html2canvas draws the .fill-line-bold border-bottom through the
        // middle of the text instead of underneath it — a known html2canvas
        // font-metrics quirk that only shows up here because these spans
        // (in the authorization letter template) sit inline in flowing
        // paragraph text and can wrap across lines. Print/screen render the
        // real border correctly; only the rasterized clone needs the swap
        // to a native text-decoration underline. The delivery challan
        // template has no .fill-line-bold elements, so this is a no-op there.
        //
        // .value-underline (Gold/Ornaments weight, Cash, Words, Invoice No)
        // is deliberately NOT touched here — those sit in a single-line flex
        // row that never wraps, so their border-bottom never had this bug,
        // and text-decoration would just shrink their padded box-underline
        // look down to hug the bare text instead of matching print.
        //
        // Only swap elements that actually hold text — an *empty* blank
        // has nothing for text-decoration to underline, so it would render
        // with no line at all; its border-bottom never collided with any
        // glyphs in the first place, so it's left alone.
        clonedElement?.querySelectorAll<HTMLElement>(".fill-line-bold").forEach((el) => {
          if (!el.textContent || !el.textContent.trim()) return;
          el.style.borderBottom = "none";
          el.style.textDecoration = "underline";
          el.style.textUnderlineOffset = "3px";
        });
      }
    });

    const imageData = canvas.toDataURL("image/png");

    if (index > 0) pdf.addPage();
    const scale = Math.min(210 / canvas.width, 297 / canvas.height);
    pdf.addImage(imageData, "PNG", 0, 0, canvas.width * scale, canvas.height * scale);
    }
    pdf.save(filename);
  };

  const getCopyNodes = () => {
    const refs = documentType === "delivery-challan" ? [printRef, secondPrintRef] : [printRefAuth, secondPrintRefAuth];
    const nodeId = documentType === "delivery-challan" ? "receipt-printable" : "auth-letter-printable";
    return copyLabels.map((_, index) => {
      const frame = refs[index].current;
      const node = frame?.contentDocument?.getElementById(nodeId);
      if (!node || frame?.contentDocument?.readyState !== "complete") throw new Error("Copies are still loading. Please try again.");
      return node;
    });
  };

  const handlePrint = () => {
    if (!tranWt || !copyLabels.length) return;
    setOutputError("");
    try {
      const nodes = getCopyNodes();
      const frame = document.createElement("iframe");
      frame.style.cssText = "position:fixed;left:-10000px;width:210mm;height:297mm;border:0";
      frame.onload = async () => {
        const doc = frame.contentDocument;
        const win = frame.contentWindow;
        if (!doc || !win) { frame.remove(); return; }
        try {
          await doc.fonts.ready;
          await Promise.all(Array.from(doc.images).map((img) => img.decode().catch(() => undefined)));
          win.addEventListener("afterprint", () => frame.remove(), { once: true });
          win.focus();
          win.print();
        } catch { frame.remove(); setOutputError("Could not print the copies."); }
      };
      const styles = Array.from(nodes[0].ownerDocument.querySelectorAll('style, link[rel="stylesheet"]')).map((style) => style.outerHTML).join("");
      frame.srcdoc = `<!DOCTYPE html><html><head>${styles}<style>
        @page{size:A4;margin:0}
        html,body{margin:0!important;padding:0!important;background:white!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
        .receipt-copy{position:relative!important;display:block!important;width:210mm;height:297mm;break-inside:avoid;page-break-inside:avoid;break-after:page;page-break-after:always;visibility:visible!important}
        .receipt-copy:last-child{break-after:auto;page-break-after:auto}
        .receipt-copy *{visibility:visible!important}
        .receipt-copy > #receipt-printable,.receipt-copy > #auth-letter-printable{position:relative!important;left:auto!important;top:auto!important;margin:0!important}
      </style></head><body>${nodes.map((node) => `<section class="receipt-copy">${node.outerHTML}</section>`).join("")}</body></html>`;
      document.body.appendChild(frame);
    } catch (error) { setOutputError(error instanceof Error ? error.message : "Could not print copies."); }
  };

  const handleDownloadPdf = async () => {
    if (!tranWt || !copyLabels.length) return;

    setIsDownloading(true);
    setOutputError("");

    try {
      const nodes = getCopyNodes();

      const filename = documentType === "delivery-challan"
        ? `Delivery-Challan-${tranWt.id}.pdf`
        : `Authorization-Letter-${tranWt.id}.pdf`;

      await downloadCopiesPdf(nodes, filename);
    } catch (error) {
      console.error("Download error:", error);
      setOutputError(error instanceof Error ? error.message : "Could not download copies.");
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
          <Text fontSize="sm" color="fg.muted">
            Generate Delivery Challan or Authorization Letter
          </Text>
        </HStack>
      </HStack>

      <Stack gap={5}>

        <HStack gap={3} align="flex-end" flexWrap="wrap" className="no-print">
          <Box flex="1" minW="240px">
            <Combobox.Root
              collection={createListCollection({ items: options })}
              value={selectedId ? [selectedId] : []}
              onInputValueChange={(details) => {
                if (details.reason === "input-change" || details.reason === "clear-trigger") {
                  setSearch(details.inputValue);
                  setSelectedId("");
                }
              }}
              onValueChange={(details) => setSelectedId(details.value[0] ?? "")}
              openOnClick
            >
              <Combobox.Label fontSize="sm" fontWeight="medium">Search and select transaction</Combobox.Label>
              <Combobox.Control>
                <Combobox.Input placeholder="Transaction number or company name" />
                <Combobox.IndicatorGroup>
                  <Combobox.ClearTrigger />
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>
              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content maxH="280px" overflowY="auto">
                    {isListLoading ? <Text p={3}>Loading transactions...</Text> : listError ? (
                      <Text p={3} color="red.600" role="alert">Could not load transactions.</Text>
                    ) : options.length ? options.map((option) => (
                      <Combobox.Item key={option.value} item={option}>
                        <Combobox.ItemText>{option.label}</Combobox.ItemText>
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    )) : <Text p={3}>No transactions found.</Text>}
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
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
                disabled={!tranWt || !copyLabels.length || isDownloading}
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
                disabled={!tranWt || !copyLabels.length || isDownloading}
                loading={isDownloading}
                variant="ghost"
                color="gray.800"
                _dark={{ color: "gray.100" }}
              >
                <LuDownload size={20} />
              </IconButton>
            </HStack>
          </HStack>

        <Text className="no-print" fontSize="sm" color="fg.muted">{copyLabels.length ? `Print and PDF include: ${copyLabels.map((label) => label.name).join(" / ")}` : "Add copy labels in Copy Labels to print or download."}</Text>
        {outputError && <Text role="alert" color="red.600" className="no-print">{outputError}</Text>}
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
            {copyLabels.map((label, index) => (
            <Box key={label.id}>
            <Text className="no-print" fontWeight="semibold" mb={2}>{label.name}</Text>
            <div style={{ display: documentType === "delivery-challan" ? "block" : "none" }}>
              <DeliveryChallan
                tranWt={tranWt}
                printRef={index === 0 ? printRef : secondPrintRef}
                headerRight={label.name}
                fontSize="large"
              />
            </div>

            {tranWt && authorizationData && (
              <div style={{ display: documentType === "authorization-letter" ? "block" : "none" }}>
                <AuthorizationLetter
                  data={{ ...authorizationData, headerRight: label.name }}
                  printRef={index === 0 ? printRefAuth : secondPrintRefAuth}
                />
              </div>
            )}
            </Box>
            ))}
          </>
        )}

      </Stack>
    </>
  );
}
