import Link from "next/link";
import Image from "next/image";
import { Placeholder } from "./components/Placeholder";
import { getCollection } from "@/lib/mongodb";
import { MovieCard } from "./components/MovieCard";
import { getSlugFromUrl } from '@/lib/utils/url';
import { Metadata } from 'next';
import { ObjectId } from 'mongodb';

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Add metadata for better SEO
export const metadata: Metadata = {
  title: 'Slow Cinema Club - Arthouse & Experimental Film Analysis',
  description: 'Dive deep into the world of arthouse and experimental cinema. Discover thoughtful analysis, reviews, and essays on slow cinema, independent films, and avant-garde masterpieces.',
  openGraph: {
    title: 'Slow Cinema Club - Arthouse & Experimental Film Analysis',
    description: 'Dive deep into the world of arthouse and experimental cinema. Discover thoughtful analysis, reviews, and essays on slow cinema, independent films, and avant-garde masterpieces.',
    type: 'website',
  },
};

interface Movie {
  _id: string;
  title: string;
  imageurl: string;
  imagepreviewurl: string;
  director: string;
  year: string;
  description: string;
  rating: number;
  updatedat: string;
  updatedAd: string;
  url: string;
  language: string;
  duration: string;
}

async function getLatestReviews(): Promise<Movie[]> {
  try {
    const collection = await getCollection('scc', 'movies');
    const movies = await collection
      .find(
        {},
        {
          projection: {
            _id: 1,
            title: 1,
            imagepreviewurl: 1,
            director: 1,
            year: 1,
            description: 1,
            rating: 1,
            updatedat: 1,
            updatedAd: 1,
            url: 1,
            language: 1,
            duration: 1
          },
          sort: { updatedAd: -1 },
          limit: 3
        }
      )
      .toArray();
    
    return movies.map(movie => ({
      ...movie,
      _id: movie._id.toString()
    })) as Movie[];
  } catch (error) {
    console.error('Failed to fetch latest reviews:', error);
    return [];
  }
}

async function getFeaturedReviews(latestReviewIds: string[]): Promise<Movie[]> {
  try {
    const collection = await getCollection('scc', 'movies');
    
    // Get current week number (1-52) for consistent weekly selection
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
    
    // Create a query that excludes the latest reviews
    const query = {
      _id: { $nin: latestReviewIds.map(id => new ObjectId(id)) }
    };
    
    // Use week number to skip a deterministic number of documents
    const aggregation = [
      // First, filter out the latest reviews
      { $match: query },
      // Then sort by a consistent field to ensure stable ordering
      { $sort: { title: 1 } },
      // Skip a number of documents based on the week number
      { $skip: ((weekNumber - 1) * 2) % 50 }, // Assuming we have at least 50 movies
      { $limit: 2 },
      {
        $project: {
          _id: 1,
          title: 1,
          imageurl: 1,
          imagepreviewurl: 1,
          director: 1,
          year: 1,
          url: 1,
          language: 1
        }
      }
    ];

    let movies = await collection.aggregate(aggregation).toArray();
    
    // If we don't get enough movies (e.g., at the end of our collection),
    // start from the beginning but still exclude latest reviews
    if (movies.length < 2) {
      const remainingCount = 2 - movies.length;
      const additionalMovies = await collection
        .aggregate([
          { $match: query },
          { $sort: { title: 1 } },
          { $limit: remainingCount },
          {
            $project: {
              _id: 1,
              title: 1,
              imageurl: 1,
              imagepreviewurl: 1,
              director: 1,
              year: 1,
              url: 1,
              language: 1
            }
          }
        ])
        .toArray();
      
      movies.push(...additionalMovies);
    }

    // Double check: If we still don't have 2 movies or somehow got latest reviews, 
    // get more movies and filter out the latest reviews
    if (movies.length < 2 || movies.some(movie => latestReviewIds.includes(movie._id.toString()))) {
      // Fetch more movies (up to 10) to ensure we have options
      const backupMovies = await collection
        .aggregate([
          { $match: query },
          { $sort: { updatedAd: -1 } }, // Sort by update date as a fallback
          { $limit: 10 },
          {
            $project: {
              _id: 1,
              title: 1,
              imageurl: 1,
              imagepreviewurl: 1,
              director: 1,
              year: 1,
              url: 1,
              language: 1
            }
          }
        ])
        .toArray();
      
      // Filter out any that might be in the latest reviews
      const safeMovies = backupMovies.filter(movie => 
        !latestReviewIds.includes(movie._id.toString())
      );
      
      // If we have backups, use them to replace any missing or duplicate featured reviews
      if (safeMovies.length > 0) {
        // Replace any featured reviews that are in latest reviews
        movies = movies.filter(movie => !latestReviewIds.includes(movie._id.toString()));
        
        // Fill up to 2 movies from our safe backup list
        while (movies.length < 2 && safeMovies.length > 0) {
          movies.push(safeMovies.shift()!);
        }
      }
    }

    return movies.map(movie => ({
      ...movie,
      _id: movie._id.toString()
    })) as Movie[];
  } catch (error) {
    console.error('Failed to fetch featured reviews:', error);
    return [];
  }
}

export default async function Home() {
  // Get the latest reviews first
  const latestReviews = await getLatestReviews();
  
  // Get featured reviews, passing the latestReviewIds to avoid duplicate DB calls
  const featuredReviews = await getFeaturedReviews(latestReviews.map(movie => movie._id));

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background">
          <Placeholder pattern="lines" className="opacity-50" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-medium tracking-tight">
              Explore the Art of Slow Cinema
            </h1>
            <p className="text-lg text-muted-foreground">
              Dive deep into the world of arthouse and experimental films,
              where every frame tells a story.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      <section>
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tight">Latest Reviews</h2>
            <p className="mt-2 text-muted-foreground">Fresh perspectives on cinema</p>
          </div>
        </div>
        <div className="relative">
          <div className="grid gap-6 md:grid-cols-3">
            {latestReviews.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
          <Link 
            href="/reviews" 
            className="mt-8 block w-full bg-muted hover:bg-muted/80 transition-colors py-4 text-center rounded-lg text-sm font-medium"
          >
            View All Reviews
          </Link>
        </div>
      </section>

      {/* Featured Reviews */}
      <section className="relative">
        <div className="mb-12">
          <h2 className="text-2xl font-medium tracking-tight">Featured Reviews</h2>
          <p className="mt-2 text-muted-foreground">Curated selections, refreshed weekly</p>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {featuredReviews.map((movie) => (
            <Link 
              key={movie._id} 
              href={`/reviews/${getSlugFromUrl(movie.url)}`}
              className="group relative block"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                {/* Animated spotlight effect */}
                <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out translate-x-full group-hover:translate-x-0 blur-2xl"></div>
                
                {/* Featured badge with shimmer effect */}
                <div className="absolute top-4 left-4 z-20 overflow-hidden">
                  <div className="relative bg-background/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <span className="relative z-10 text-sm font-medium bg-gradient-to-r from-white/90 to-white bg-clip-text text-transparent">
                      Featured
                    </span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>

                {/* Main image */}
                <Image
                  src={movie.imageurl || movie.imagepreviewurl.replace('?w=600', '?w=1920')}
                  alt={`Movie still from ${movie.title} (${movie.year})`}
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                  width={1920}
                  height={1080}
                  quality={90}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Gradient overlay with enhanced interaction */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700"></div>
              </div>

              {/* Text content with animated underline */}
              <div className="mt-6">
                <h3 className="relative text-xl font-medium inline-block">
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    {movie.title}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-px bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                </h3>
                <p className="text-muted-foreground mt-2 group-hover:text-white/70 transition-colors duration-500">
                  {movie.director} • {movie.year} • {movie.language}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute -bottom-2 -right-2 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-xl"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section>
        <div className="mb-12">
          <h2 className="text-2xl font-medium tracking-tight">Featured Articles</h2>
          <p className="mt-2 text-muted-foreground">Essential reading from our archives</p>
        </div>

        {/* Coming Soon */}
        <div className="relative overflow-hidden rounded-lg bg-muted/50 border border-muted">
          <div className="absolute inset-0">
            <Placeholder pattern="dots" className="opacity-5" />
          </div>
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center space-y-4">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              Coming Soon
            </div>
            <h3 className="text-2xl font-medium tracking-tight">
              New Articles Coming in March
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re working on a series of in-depth articles exploring the influence of slow cinema 
              on contemporary filmmaking. Stay tuned for thought-provoking analysis and insights.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-medium tracking-tight">
            About Slow Cinema Club
          </h2>
          <p className="text-muted-foreground">
          We&apos;re a dedicated online space for cinephiles who crave deeper engagement with arthouse and experimental cinema. From the meditative narratives of Andrei Tarkovsky to the poetic, dreamlike frames of Wong Kar-wai and the intimate storytelling of Agnès Varda, our platform goes beyond the mainstream to offer rich, thought-provoking analysis.
</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">What you&apos;ll find here:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• In-depth film reviews and analysis</li>
            <li>• Essays on themes and artistic techniques</li>
            <li>• Curated film lists and viewing guides</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
