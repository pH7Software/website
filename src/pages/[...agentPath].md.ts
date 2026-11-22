import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { agentPages, type AgentPage } from "../data/agent-pages";
import { legacyRedirects } from "../data/redirects";
import { site } from "../data/site";

type Props =
  | { kind: "page"; page: AgentPage }
  | { kind: "article"; article: CollectionEntry<"articles"> };

const routeSegment = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const markdownRouteForPage = (pagePath: string): string =>
  pagePath === "/" ? "index" : `${pagePath.replace(/^\/+|\/+$/g, "")}/index`;

const articleBody = (article: CollectionEntry<"articles">): string => {
  const { data } = article;
  const canonical = new URL(`/${data.slug}/`, site.origin).toString();
  const published = data.publishedAt.toISOString().slice(0, 10);
  const updated = data.updatedAt?.toISOString().slice(0, 10);
  const metadata = [
    `- Canonical page: [${canonical}](${canonical})`,
    `- Author: [${site.author.name}](${site.author.url})`,
    `- Published: ${published}`,
    ...(updated ? [`- Updated: ${updated}`] : []),
    ...(data.categories.length > 0 ? [`- Section: ${data.categories.join(", ")}`] : []),
    ...(data.tags.length > 0 ? [`- Topics: ${data.tags.join(", ")}`] : []),
  ].join("\n");
  const archiveNotice = data.historical
    ? `> Archive notice: this article is preserved from the former pH7Builder website and may describe an older release, service or requirement. Use the current changelog and official documentation for present-day decisions.\n\n`
    : "";

  return `# ${data.title}

> ${data.description}

${metadata}

${archiveNotice}${article.body?.trim() ?? ""}

## Continue

- [Current pH7Builder changelog](${site.origin}/changelog/)
- [Install the latest published release](${site.origin}/get-started/)
- [Source repository](${site.githubUrl})
`;
};

const pageBody = (page: AgentPage): string => {
  const canonical = new URL(page.path, site.origin).toString();
  return `# ${page.title}

> ${page.description}

- Canonical page: [${canonical}](${canonical})
- Maintainer: [${site.author.name}](${site.author.url})

${page.body.trim()}
`;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection("articles", ({ data }) => !data.draft && !(data.slug in legacyRedirects));
  return [
    ...agentPages.map((page) => ({
      params: { agentPath: markdownRouteForPage(page.path) },
      props: { kind: "page", page } satisfies Props,
    })),
    ...articles.map((article) => ({
      params: { agentPath: `${routeSegment(article.data.slug)}/index` },
      props: { kind: "article", article } satisfies Props,
    })),
  ];
};

export const GET: APIRoute<Props> = ({ props }) => {
  const body = props.kind === "page" ? pageBody(props.page) : articleBody(props.article);
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
