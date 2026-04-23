const CLASSES = {
  der: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  die: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  das: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
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
