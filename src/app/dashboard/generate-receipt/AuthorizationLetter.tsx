"use client";

import { useMemo, type RefObject } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { useChallanFormat } from "@/hooks";
import { injectTemplateData } from "./challanTemplate";

export interface AuthorizationLetterData {
  date: string | Date | null | undefined;
  jurisdiction?: string;

  carrierName: string;
  sentDate: string | Date | null | undefined;
  destination: string;

  goldWeight?: string | number | null;
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
  printRef: RefObject<HTMLIFrameElement | null>;
}

const AUTH_FORM_TEMPLATE_ID = "AUTHFORM";

export default function AuthorizationLetter({
  data,
  printRef,
}: AuthorizationLetterProps) {
  const { data: format, isLoading, isError } = useChallanFormat(AUTH_FORM_TEMPLATE_ID);

  const srcDoc = useMemo(() => {
    if (!format?.content) return null;
    return injectTemplateData(format.content, data, {
      varName: "data",
      logoClass: "letter-logo",
    });
  }, [format?.content, data]);

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
        Couldn&apos;t load the authorization letter template.
      </Text>
    );
  }

  return (
    <iframe
      ref={printRef}
      title="Authorization Letter"
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
