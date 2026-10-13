"use client";

import { useState } from "react";
import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { useCopyLabels } from "@/hooks/useCopyLabels";

export default function CopyLabelsPage() {
  const { labels, saveLabels } = useCopyLabels();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Enter a copy label."); return; }
    if (labels.some((label) => label.id !== editingId && label.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("This copy label already exists."); return;
    }
    try {
      saveLabels(editingId ? labels.map((label) => label.id === editingId ? { ...label, name: trimmed } : label)
        : [...labels, { id: crypto.randomUUID(), name: trimmed }]);
      setName(""); setEditingId(null); setError("");
    } catch { setError("Could not save labels to browser storage."); }
  };

  return (
    <Stack gap={5}>
      <Text>Manage the copy labels used in challan previews. Changes are saved in this browser and update open pages immediately.</Text>
      <form onSubmit={(event) => { event.preventDefault(); save(); }}>
        <HStack flexWrap="wrap">
          <Input aria-label="Copy label name" placeholder="Copy label name" value={name} onChange={(event) => setName(event.target.value)} maxW="500px" />
          <Button type="submit">{editingId ? "Save changes" : "Add label"}</Button>
          {editingId && <Button variant="ghost" onClick={() => { setEditingId(null); setName(""); setError(""); }}>Cancel</Button>}
        </HStack>
      </form>
      {error && <Text role="alert" color="red.600">{error}</Text>}
      {labels.map((label) => (
        <HStack key={label.id} borderWidth="1px" p={3} borderRadius="md" flexWrap="wrap">
          <Text flex="1">{label.name}</Text>
          <Button size="sm" variant="outline" onClick={() => { setEditingId(label.id); setName(label.name); setError(""); }}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => {
            try {
              saveLabels(labels.filter((item) => item.id !== label.id));
              if (editingId === label.id) { setEditingId(null); setName(""); }
              setError("");
            } catch { setError("Could not save labels to browser storage."); }
          }}>Delete</Button>
        </HStack>
      ))}
      {!labels.length && <Text color="fg.muted">Add a label to use it in previews.</Text>}
    </Stack>
  );
}
