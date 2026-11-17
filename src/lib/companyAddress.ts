import type { Company, TranWt } from "@/types";

type CompanyAddress = Pick<Company, "address1" | "address2" | "address3" | "address4" | "area" | "city">;

const clean = (value: string | null | undefined) => value?.trim() ?? "";
const normalized = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function missingLocation(company: CompanyAddress) {
  let existing = normalized([company.address1, company.address2, company.address3, company.address4].filter(Boolean).join(" "));
  return [company.area, company.city].map(clean).filter((part) => {
    const location = normalized(part);
    if (!location || (` ${existing} `).includes(` ${location} `)) return false;
    existing += ` ${location}`;
    return true;
  });
}

export function formatCompanyAddress(company?: CompanyAddress | null): string {
  if (!company) return "";
  return [company.address1, company.address2, company.address3, company.address4, ...missingLocation(company)]
    .map(clean).filter(Boolean).join(", ");
}

function receiptCompany(company?: Company | null) {
  if (!company) return company;
  // Existing API templates read address1/address2. Include the new location
  // there while also retaining the separate area/city fields for new templates.
  return { ...company, address2: [clean(company.address2), ...missingLocation(company)].filter(Boolean).join(", ") || null };
}

export function receiptTransaction(transaction: TranWt): TranWt {
  return { ...transaction,
    fromCompanyDetails: receiptCompany(transaction.fromCompanyDetails),
    toCompanyDetails: receiptCompany(transaction.toCompanyDetails),
  };
}
