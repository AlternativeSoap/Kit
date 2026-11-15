function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const normText = normalize(text);
  const normQuery = normalize(q);
  const index = normText.indexOf(normQuery);

  if (index === -1) return <>{text}</>;

  const end = index + q.length;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-accent-soft text-foreground rounded-[3px] px-0.5">
        {text.slice(index, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}
