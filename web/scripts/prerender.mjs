// Post-vite-build prerender: emits SEO-friendly HTML for every static route
// (common list, common/<slug>, guides list, guides/<slug>) plus sitemap.xml.
// Each page gets its own <title>, meta description, canonical, OG/Twitter tags,
// and a server-rendered content stub inside <div id="root"> so crawlers see real
// text. The SPA hydrates over the stub on the client.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const distDir = join(webRoot, "dist");
const publicDir = join(webRoot, "public");

const SITE = "https://satzbau.eu";

if (!existsSync(distDir)) {
  console.error("dist/ does not exist — run vite build first");
  process.exit(1);
}

const shellHtml = readFileSync(join(distDir, "index.html"), "utf8");
const commonSentences = JSON.parse(
  readFileSync(join(publicDir, "common-sentences.json"), "utf8"),
);
const guides = JSON.parse(readFileSync(join(publicDir, "guides.json"), "utf8"));
const about = JSON.parse(readFileSync(join(publicDir, "about.json"), "utf8"));

// --- helpers ---

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonForScript(obj) {
  // Safe to embed inside <script type="application/ld+json">
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) return html;
  return html.replace(regex, replacement);
}

function applyMeta(html, meta) {
  const url = `${SITE}${meta.path}`;
  let out = html;
  out = replaceTag(out, /<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  out = replaceTag(
    out,
    /<meta\s+name="description"[^>]*>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  out = replaceTag(
    out,
    /<link\s+rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:url"[^>]*>/,
    `<meta property="og:url" content="${url}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  );

  // Replace ALL existing JSON-LD blocks with the route's own schema(s)
  out = out.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/g,
    "",
  );
  const ldBlocks = (meta.jsonLd ?? [])
    .map(
      (obj) =>
        `<script type="application/ld+json">${escapeJsonForScript(obj)}</script>\n    `,
    )
    .join("");
  out = out.replace("</head>", `${ldBlocks}</head>`);

  // Replace empty root with a content stub so crawlers see real text
  out = out.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${meta.contentHtml}</div>`,
  );
  return out;
}

function writePage(path, html) {
  const rel = path === "/" ? "" : path.replace(/^\//, "");
  const dir = rel ? join(distDir, rel) : distDir;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

function breadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

// --- per-route meta + content stubs ---

function commonListMeta() {
  const sample = commonSentences.slice(0, 8).map((e) => e.sentence);
  const items = commonSentences.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE}/common/${e.slug}`,
    name: e.sentence,
  }));
  return {
    path: "/common",
    title: "100 most common German sentences, fully analyzed — satzbau.eu",
    description:
      "100 everyday German sentences with full grammatical analysis: noun gender (der/die/das), plural forms, verb conjugation, Partizip II, and case roles for every word.",
    jsonLd: [
      breadcrumb([
        { name: "satzbau.eu", path: "/" },
        { name: "Common sentences", path: "/common" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "100 most common German sentences",
        numberOfItems: commonSentences.length,
        itemListElement: items,
      },
    ],
    contentHtml: `<main><h1>100 most common German sentences, fully analyzed</h1><p>Tap any sentence to see articles, plurals, verb forms, and case roles.</p><ol>${commonSentences
      .map(
        (e) =>
          `<li><a href="/common/${e.slug}">${escapeHtml(e.sentence)}</a></li>`,
      )
      .join("")}</ol></main>`,
  };
}

function commonDetailMeta(entry, index, all) {
  const translation = entry.analysis?.sentences?.[0]?.translation ?? "";
  const description = translation
    ? `"${entry.sentence}" — ${translation}. Full grammar breakdown: noun gender, plural, verb conjugation, Partizip II, and case roles.`
    : `Full grammatical breakdown of "${entry.sentence}" — noun gender, plurals, verb conjugation, Partizip II, and case roles.`;
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  return {
    path: `/common/${entry.slug}`,
    title: `${entry.sentence} — German sentence breakdown`,
    description,
    jsonLd: [
      breadcrumb([
        { name: "satzbau.eu", path: "/" },
        { name: "Common sentences", path: "/common" },
        { name: entry.sentence, path: `/common/${entry.slug}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: entry.sentence,
        inLanguage: "de",
        about: "German grammar",
        url: `${SITE}/common/${entry.slug}`,
        ...(translation ? { description: translation } : {}),
      },
    ],
    contentHtml: `<main><nav><a href="/common">← All common sentences</a></nav><article><h1 lang="de">${escapeHtml(entry.sentence)}</h1>${
      translation ? `<p lang="en">${escapeHtml(translation)}</p>` : ""
    }</article><nav>${
      prev ? `<a href="/common/${prev.slug}">← ${escapeHtml(prev.sentence)}</a> ` : ""
    }${
      next ? `<a href="/common/${next.slug}">${escapeHtml(next.sentence)} →</a>` : ""
    }</nav></main>`,
  };
}

function guidesListMeta() {
  return {
    path: "/guides",
    title: "German grammar guides — satzbau.eu",
    description:
      "Short, focused guides to German grammar: noun gender (der/die/das), the perfect tense, cases, and the patterns that come up again and again.",
    jsonLd: [
      breadcrumb([
        { name: "satzbau.eu", path: "/" },
        { name: "Guides", path: "/guides" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "German grammar guides",
        numberOfItems: guides.length,
        itemListElement: guides.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/guides/${g.slug}`,
          name: g.title,
        })),
      },
    ],
    contentHtml: `<main><h1>Grammar guides</h1><ul>${guides
      .map(
        (g) =>
          `<li><a href="/guides/${g.slug}"><strong>${escapeHtml(g.title)}</strong> — ${escapeHtml(g.summary)}</a></li>`,
      )
      .join("")}</ul></main>`,
  };
}

function guideDetailMeta(guide) {
  return {
    path: `/guides/${guide.slug}`,
    title: `${guide.title} — satzbau.eu`,
    description: guide.summary,
    jsonLd: [
      breadcrumb([
        { name: "satzbau.eu", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: guide.title, path: `/guides/${guide.slug}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: guide.summary,
        url: `${SITE}/guides/${guide.slug}`,
        inLanguage: "en",
      },
    ],
    contentHtml: `<main><nav><a href="/guides">← All guides</a></nav><article class="prose">${guide.body}</article></main>`,
  };
}

function aboutMeta() {
  return {
    path: "/about",
    title: about.title,
    description: about.summary,
    jsonLd: [
      breadcrumb([
        { name: "satzbau.eu", path: "/" },
        { name: "About", path: "/about" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: about.title,
        url: `${SITE}/about`,
        description: about.summary,
      },
    ],
    contentHtml: `<main><article class="prose">${about.body}</article></main>`,
  };
}

// --- run ---

const pages = [
  commonListMeta(),
  ...commonSentences.map((e, i) => commonDetailMeta(e, i, commonSentences)),
  guidesListMeta(),
  ...guides.map((g) => guideDetailMeta(g)),
  aboutMeta(),
];

for (const meta of pages) {
  writePage(meta.path, applyMeta(shellHtml, meta));
}

// Sitemap — include "/" plus every prerendered path
const allUrls = ["/", ...pages.map((p) => p.path)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (p) =>
      `  <url><loc>${SITE}${p}</loc><changefreq>weekly</changefreq></url>`,
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(distDir, "sitemap.xml"), sitemap);

// robots.txt — point crawlers at the sitemap
writeFileSync(
  join(distDir, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(
  `prerendered ${pages.length} pages + sitemap.xml (${allUrls.length} urls)`,
);
