const CLASSES = {
  der: "bg-blue-100 text-blue-800",
  die: "bg-red-100 text-red-800",
  das: "bg-green-100 text-green-800",
} as const;

type Article = keyof typeof CLASSES;

export function ArticlePill({ article }: { article: Article }) {
  return (
    <span
      className={`${CLASSES[article]} text-xs font-semibold rounded-md`}
      style={{ padding: "2px 8px", lineHeight: 1.4 }}
    >
      {article}
    </span>
  );
}
