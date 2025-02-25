'use client';

import Image from "next/image";
import Link from "next/link";
import { getSlugFromUrl } from '@/lib/utils/url';

export interface Movie {
  _id: string;
  title: string;
  imagepreviewurl: string;
  director: string;
  year: string;
  description: string;
  rating: number;
  updatedat: string;
  url: string;
  language: string;
  duration: string;
}

export function MovieCard({ movie, index }: { movie: Movie; index: number }) {
  const slug = getSlugFromUrl(movie.url);

  return (
    <Link 
      href={`/reviews/${slug}`}
      className="group block hover:opacity-95"
      aria-labelledby={`movie-title-${movie._id}`}
      scroll={true}
    >
      <article className="space-y-4" itemScope itemType="https://schema.org/Movie">
        <div className="aspect-[3/2] overflow-hidden rounded-lg bg-muted">
          <Image
            src={movie.imagepreviewurl.replace('?w=600', '?w=1200')}
            alt={`Movie still from ${movie.title} (${movie.year})`}
            width={1200}
            height={800}
            className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105 group-hover:brightness-90"
            loading={index < 6 ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="space-y-2">
          <h2 
            id={`movie-title-${movie._id}`}
            className="text-lg font-medium leading-snug tracking-tight group-hover:text-primary"
            itemProp="name"
          >
            {movie.title}
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              {movie.director}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
              {movie.rating > 0 && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span>{movie.rating}</span>
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                </>
              )}
              <span>{movie.duration} min</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 