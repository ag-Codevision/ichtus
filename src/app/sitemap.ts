import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://glessios.com.br";

  // Rotas estáticas fundamentais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#solucoes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#orcamento`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Rotas dinâmicas do Portfólio
  const { getAllProjects } = await import("@/lib/portfolio-data");
  const portfolioProjects = await getAllProjects();
  const dynamicPortfolioRoutes: MetadataRoute.Sitemap = portfolioProjects.map((proj) => ({
    url: `${baseUrl}/portfolio/${proj.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // Rotas dinâmicas do Blog com IA
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    });

    const dynamicBlogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicPortfolioRoutes, ...dynamicBlogRoutes];
  } catch (error) {
    console.error("[Sitemap] Erro ao buscar artigos dinâmicos:", error);
    return [...staticRoutes, ...dynamicPortfolioRoutes];
  }
}
