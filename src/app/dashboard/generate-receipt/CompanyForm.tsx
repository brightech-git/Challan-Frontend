"use client";

import { useMemo, type RefObject } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";
import type { TranWt } from "@/types";
import { useChallanFormat } from "@/hooks";
import { injectTemplateData } from "./challanTemplate";

interface CompanyFormProps {
  tranWt: TranWt;
  printRef: RefObject<HTMLIFrameElement | null>;
}

export default function CompanyForm({ tranWt, printRef }: CompanyFormProps) {
  const { data: format, isLoading, isError } = useChallanFormat("COMPANYFORM");
  const content = format?.content;
  const srcDoc = useMemo(() => content
    ? injectTemplateData(content, tranWt, { varName: "tranWt" })
    : null, [content, tranWt]);

  if (isLoading) return <Center py={12} className="no-print"><Spinner size="lg" /></Center>;
  if (isError || !srcDoc) return <Text color="fg.error" className="no-print">
    Couldn&apos;t load the COMPANYFORM template. Upload its HTML in Challan Formats with ID COMPANYFORM.
  </Text>;

  return <iframe ref={printRef} title="Company Form" srcDoc={srcDoc}
    style={{ width: "210mm", height: "calc(297mm + 40px)", border: "none", display: "block", margin: "0 auto", background: "#fff" }} />;
}
