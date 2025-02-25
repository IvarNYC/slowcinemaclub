import { getCollection } from "@/lib/mongodb";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const collection = await getCollection('scc', 'movies');
  const movies = await collection.find({}).toArray();

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Slow Cinema Club</title>
        <description>Deep analysis of arthouse and experimental cinema</description>
        <link>https://slowcinemaclub.com</link>
        <atom:link href="https://slowcinemaclub.com/feed.xml" rel="self" type="application/rss+xml" />
        ${movies.map(movie => `
          <item>
            <title>${movie.title} Review (${movie.year})</title>
            <link>https://slowcinemaclub.com/reviews/${createSlug(movie.title)}</link>
            <guid>https://slowcinemaclub.com/reviews/${createSlug(movie.title)}</guid>
            <description>${movie.description}</description>
            <pubDate>${new Date(movie.updatedAt || new Date()).toUTCString()}</pubDate>
          </item>
        `).join('')}
      </channel>
    </rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
