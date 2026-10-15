export function CitationBadge({ citation }: { citation: string }) {
  return (
    <span className="ml-1.5 text-[10px] font-medium text-muted-foreground/60 bg-muted/60 px-1.5 py-0.5 rounded">
      {citation}
    </span>
  );
}
