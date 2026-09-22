"use client";

import { useMemo, type RefObject } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";
import type { TranWt } from "@/types";
import { useChallanFormat } from "@/hooks";
import { injectTemplateData } from "./challanTemplate";

type ChallanFontSize = "small" | "medium" | "large";

interface DeliveryChallanProps {
  tranWt: TranWt;
  printRef: RefObject<HTMLIFrameElement | null>;
  fontSize?: ChallanFontSize;
}

const DELIVERY_FORM_TEMPLATE_ID = "DELIVERYFORM";

export default function DeliveryChallan({
  tranWt,
  printRef,
  fontSize = "large",
}: DeliveryChallanProps) {
  const { data: format, isLoading, isError } = useChallanFormat(
    DELIVERY_FORM_TEMPLATE_ID
  );

  const srcDoc = useMemo(() => {
    if (!format?.content) return null;
    return injectTemplateData(
      format.content,
      { ...tranWt, fontSize },
      { varName: "tranWt", logoClass: "logo-symbol" }
    );
  }, [format?.content, tranWt, fontSize]);

  if (isLoading) {
    return (
      <Center py={12} className="no-print">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (isError || !srcDoc) {
    return (
      <Text color="fg.error" className="no-print">
        Couldn&apos;t load the delivery challan template.
      </Text>
    );
  }

  return (
    <iframe
      ref={printRef}
      title="Delivery Challan"
      srcDoc={srcDoc}
      style={{
        width: "210mm",
        height: "calc(297mm + 40px)",
        border: "none",
        display: "block",
        margin: "0 auto",
        background: "#fff",
      }}
    />
  );
}
