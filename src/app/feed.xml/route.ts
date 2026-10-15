import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://glessios.com.br";

  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Glessios Comunicação Visual | Blog &amp; Engenharia</title>
  <link>${baseUrl}/blog</link>
  <description>Tendências, engenharia de materiais, ACM, letreiros luminosos e arquitetura comercial.</description>
  <language>pt-br</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
  ${posts
    .map(
      (post) => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${baseUrl}/blog/${post.slug}</link>
    <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
    <description><![CDATA[${post.excerpt}]]></description>
    <pubDate>${post.publishedAt.toUTCString()}</pubDate>
  </item>`
    )
    .join("")}
</channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("[RSS Feed] Erro ao gerar feed:", error);
    return new NextResponse("Erro ao gerar feed", { status: 500 });
  }
}
