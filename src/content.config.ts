import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    sourceType: z.enum(["post", "page", "release"]),
    releaseStatus: z.enum(["published", "unreleased"]).optional(),
    sourceUrl: z.url().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    historical: z.boolean().default(false),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
