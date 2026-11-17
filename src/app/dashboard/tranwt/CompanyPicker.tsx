"use client";

import { useMemo, useState } from "react";
import { Combobox, Text, createListCollection } from "@chakra-ui/react";
import type { Company } from "@/types";

interface CompanyPickerProps {
  companies: Company[];
  value: string;
  selectedCompany?: Company | null;
  onChange: (companyId: string) => void;
  label: string;
  disabled?: boolean;
}

export default function CompanyPicker({ companies, value, selectedCompany, onChange, label, disabled }: CompanyPickerProps) {
  const [query, setQuery] = useState<string | null>(null);
  const options = useMemo(() => selectedCompany && !companies.some((company) => company.companyId === selectedCompany.companyId)
    ? [selectedCompany, ...companies] : companies, [companies, selectedCompany]);
  const selected = options.find((company) => company.companyId === value);
  const collection = useMemo(() => {
    const search = (query ?? "").trim().toLowerCase();
    return createListCollection({
      items: options.filter((company) => !search || [company.companyName, company.companyId, company.area, company.city]
        .some((field) => field?.toLowerCase().includes(search))),
      itemToString: (company) => company.companyName,
      itemToValue: (company) => company.companyId,
    });
  }, [options, query]);

  return (
    <Combobox.Root collection={collection} value={value ? [value] : []} disabled={disabled}
      inputValue={query ?? selected?.companyName ?? value}
      openOnClick positioning={{ strategy: "fixed", hideWhenDetached: true }}
      onInputValueChange={({ inputValue, reason }) => {
        if (reason === "input-change") setQuery(inputValue);
        else if (reason === "clear-trigger") { setQuery(""); onChange(""); }
      }}
      onOpenChange={({ open }) => { if (!open) setQuery(null); }}
      onValueChange={({ value: next }) => { onChange(next[0] ?? ""); setQuery(null); }}
      onKeyDown={(event) => { if (event.key === "Enter") event.stopPropagation(); }}>
      <Combobox.Control>
        <Combobox.Input aria-label={label} placeholder={`Search ${label.toLowerCase()}...`} autoComplete="off" />
        <Combobox.IndicatorGroup>
          {!disabled && <Combobox.ClearTrigger />}
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content maxH="260px" overflowY="auto" minW="280px">
          {collection.items.length ? collection.items.map((company) => (
            <Combobox.Item key={company.companyId} item={company}>
              <Combobox.ItemText>{company.companyName}</Combobox.ItemText>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          )) : <Text px={3} py={2} fontSize="sm" color="fg.muted">No companies found.</Text>}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}
