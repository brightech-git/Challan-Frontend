"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  NativeSelect,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuDownload, LuPrinter } from "react-icons/lu";
import { useTranWt, useTranWts } from "@/hooks";
import { TranWt } from "@/types";
import { amountInWords } from "@/lib/numberToWords";
import DeliveryChallan from "./DeliveryChallan"

/**
 * Generate Receipt page — renders a saved transaction (TranWt) as a
 * printable "Delivery Challan for Goods sent on Approval", matching the
 * real Laxmi Jewellery challan layout: Dispatch To / Dispatch From company
 * blocks, an item line (description, HSN, net weight, rate, value, total),
 * a GST breakdown, and the total amount in words.
 *
 * Dispatch From is the transaction's fromCompanyDetails and Dispatch To is
 * toCompanyDetails — the same From/To pairing already used throughout the
 * Transactions page — rather than a hardcoded company, since TranWt
 * doesn't distinguish "our company" from "the other party": whichever
 * side of the transaction you're printing for is Dispatch From.
 *
 * Two output options are offered:
 *  - "Print" opens the browser's native print dialog (window.print()) with
 *    print-only CSS that hides the picker/toolbar chrome; "Save as PDF" is
 *    available from that dialog like any other print target.
 *  - "Download PDF" renders the same #receipt-printable box straight to a
 *    PDF file with html2canvas + jsPDF and triggers a save, with no print
 *    dialog involved — useful when the browser's print-to-PDF isn't
 *    convenient (e.g. scripted/kiosk use, or browsers that mangle the
 *    print layout).
 */

const money = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const weight = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function ReceiptTable({
  tranWt,
  printRef,
}: {
  tranWt: TranWt;
  printRef: RefObject<HTMLDivElement | null>;
}) {
  const from = tranWt.fromCompanyDetails;
  const to = tranWt.toCompanyDetails;
  const totalValue = tranWt.total ?? 0;

  return (
    <Box
      id="receipt-printable"
      ref={printRef}
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      bg="white"
      color="black"
    >
      <Box bg="bg.muted" py={2} textAlign="center" borderBottomWidth="1px">
        <Text fontWeight="bold">Delivery Challan for Goods sent on Approval</Text>
      </Box>

      <Grid templateColumns="1fr 1fr">
        <GridItem borderRightWidth="1px" p={4}>
          <Text fontWeight="bold" mb={2} textAlign="center">
            Dispatch To
          </Text>
          <Stack gap={1} fontSize="sm">
            <Text>
              <Text as="span" fontWeight="semibold">
                Company:
              </Text>{" "}
              {to?.companyName ?? tranWt.toCompanyId}
            </Text>
            <Text>
              <Text as="span" fontWeight="semibold">
                Address:
              </Text>{" "}
              {[to?.address1, to?.address2].filter(Boolean).join(", ") || "—"}
            </Text>
            <Text>
              <Text as="span" fontWeight="semibold">
                GST No:
              </Text>{" "}
              {to?.gstNo ?? "—"}
            </Text>
            <Text>
              <Text as="span" fontWeight="semibold">
                PAN No:
              </Text>{" "}
              {to?.panNo ?? "—"}
            </Text>
          </Stack>
        </GridItem>

        <GridItem p={4}>
          <Text fontWeight="bold" mb={2} textAlign="center">
            Dispatch From
          </Text>
          <Stack gap={1} fontSize="sm">
            <Text>
              <Text as="span" fontWeight="semibold">
                Company:
              </Text>{" "}
              {from?.companyName ?? tranWt.fromCompanyId}
            </Text>
            <Text>
              <Text as="span" fontWeight="semibold">
                Address:
              </Text>{" "}
              {[from?.address1, from?.address2].filter(Boolean).join(", ") || "—"}
            </Text>
            <Text>
              <Text as="span" fontWeight="semibold">
                GST No:
              </Text>{" "}
              {from?.gstNo ?? "—"}
            </Text>
            <Text>
              <Text as="span" fontWeight="semibold">
                PAN No:
              </Text>{" "}
              {from?.panNo ?? "—"}
            </Text>
          </Stack>
        </GridItem>
      </Grid>

      <Grid templateColumns="1fr 1fr" borderTopWidth="1px" p={4} fontSize="sm">
        <GridItem>
          <Text>
            <Text as="span" fontWeight="semibold">
              State / Code:
            </Text>{" "}
            {from?.stateId ?? "—"}
          </Text>
        </GridItem>
        <GridItem>
          <Text>
            <Text as="span" fontWeight="semibold">
              Delivery Challan No:
            </Text>{" "}
            {tranWt.id}
          </Text>
          <Text>
            <Text as="span" fontWeight="semibold">
              Date:
            </Text>{" "}
            {tranWt.tranDate ? new Date(tranWt.tranDate).toLocaleDateString("en-IN") : "—"}
          </Text>
        </GridItem>
      </Grid>

      <Table.Root size="sm" borderTopWidth="1px">
        <Table.Header>
          <Table.Row bg="bg.muted">
            <Table.ColumnHeader>S.No</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader>HSN</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Net Wt</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Rate</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Value</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Total</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>1</Table.Cell>
            <Table.Cell>
              {tranWt.metalName ?? tranWt.metalId} Ornament
              {tranWt.description ? ` — ${tranWt.description}` : ""}
              <Text fontSize="xs" color="fg.muted">
                GRSWT {weight(tranWt.grsWt)} STNWT {weight(tranWt.stnWt)} Net Wt {weight(tranWt.netWt)}
              </Text>
            </Table.Cell>
            <Table.Cell>{tranWt.hsnCode ?? "—"}</Table.Cell>
            <Table.Cell textAlign="right">{weight(tranWt.netWt)}</Table.Cell>
            <Table.Cell textAlign="right">{money(tranWt.rate)}</Table.Cell>
            <Table.Cell textAlign="right">{money(tranWt.value)}</Table.Cell>
            <Table.Cell textAlign="right">{money(totalValue)}</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row fontWeight="bold" bg="bg.muted">
            <Table.Cell colSpan={5} textAlign="right">
              Total
            </Table.Cell>
            <Table.Cell textAlign="right">{money(tranWt.value)}</Table.Cell>
            <Table.Cell textAlign="right">{money(totalValue)}</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>

      <Grid templateColumns="1.4fr 1fr" borderTopWidth="1px">
        <GridItem borderRightWidth="1px" p={4}>
          <Text fontWeight="semibold" fontSize="sm" mb={1}>
            Total Invoice amount in words
          </Text>
          <Text fontSize="sm">{amountInWords(totalValue)}</Text>
        </GridItem>
        <GridItem p={4}>
          <Stack gap={1} fontSize="sm">
            <HStack justify="space-between">
              <Text>Total Amount</Text>
              <Text>{money(tranWt.value)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>CGST {tranWt.cgstPer ?? 0}%</Text>
              <Text>{money(tranWt.csstAmt)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>SGST {tranWt.sgstPer ?? 0}%</Text>
              <Text>{money(tranWt.sgstAmt)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>IGST {tranWt.igstPer ?? 0}%</Text>
              <Text>{money(tranWt.igstAmt)}</Text>
            </HStack>
            <HStack justify="space-between" pt={1} borderTopWidth="1px" fontWeight="bold">
              <Text>Total Value</Text>
              <Text>{money(totalValue)}</Text>
            </HStack>
          </Stack>
        </GridItem>
      </Grid>

      <Box borderTopWidth="1px" p={4} fontSize="xs" color="fg.muted">
        <Text>
          Items listed in this delivery challan are solely for commercial transactions. There is no
          political affiliation or intension to support any political entity or campaign associated
          with the movement of these goods.
        </Text>
        <Text mt={1}>
          Goods (Jewellery) sent on approval basis as per circular 10/10/2017-GST vide Rule 55 sub
          rule (1) Clause (C) and sub rule (4) of the CGST Act 2017.
        </Text>
      </Box>

      <Grid templateColumns="1fr 1fr" borderTopWidth="1px" p={4} fontSize="sm">
        <GridItem>
          <Text fontWeight="semibold">Received By</Text>
          <Text mt={8}>Name: {to?.companyName ?? tranWt.toCompanyId}</Text>
          <Text mt={6}>Signed Signature: ____________________</Text>
        </GridItem>
        <GridItem textAlign="right">
          <Text fontWeight="semibold">For {from?.companyName ?? tranWt.fromCompanyId}</Text>
          <Text mt={12}>Director / Authorised Signatory</Text>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default function GenerateReceiptPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const node = printRef.current;

    if (!node || !tranWt) return;

    setIsDownloading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] =
        await Promise.all([
          import("html2canvas"),
          import("jspdf"),
        ]);

      const canvas = await html2canvas(node, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Without these, html2canvas captures the element's full scrollHeight
        // — ignoring .challan-page's own `overflow: hidden` clip — any time
        // real content (a longer address, a wrapped label, etc.) pushes the
        // layout past the fixed 297mm page height. The browser preview still
        // looks right because it actually clips that overflow, but the PDF
        // then squeezed that taller, unclipped capture into a fixed 297mm
        // image (below), visually compressing everything and shoving the
        // footer up into the content above it. Pinning width/height to the
        // node's own rendered box makes html2canvas capture exactly what's
        // visible on screen, nothing more.
        width: node.offsetWidth,
        height: node.offsetHeight,
        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Size the image from the canvas's own aspect ratio rather than forcing
      // a hardcoded 210x297 — now that the capture is properly clipped this
      // should already be ~A4, but deriving it avoids ever re-introducing a
      // stretch/squeeze if that capture is ever slightly off again.
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
      );

      pdf.save(
        `delivery-challan-${tranWt.id}.pdf`
      );
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
            <Heading size="lg">Challan</Heading>
            <Text fontSize="sm" color="fg.muted">
              Generate Receipt — Challan management
            </Text>
          </Box>
        </HStack>
      </HStack>

      <Stack gap={5}>

        <HStack
          gap={4}
          align="flex-end"
          flexWrap="wrap"
          className="no-print"
        >

          <Box minW="360px">
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

        {!selectedId && (
          <Text
            color="fg.muted"
            className="no-print"
          >
            Pick a transaction above to preview
            its delivery challan.
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
          <DeliveryChallan
            tranWt={tranWt}
            printRef={printRef}
            fontSize="large"
          />
        )}

      </Stack>
    </>
  );
}