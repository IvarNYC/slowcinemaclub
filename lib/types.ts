export interface Review {
  id: number;
  created_at: string;
  title: string;
  content: string;
  film_title: string;
  director: string;
  year: number;
  rating: number;
  slug: string;
  author_id: string;
}

export interface Article {
  id: number;
  created_at: string;
  title: string;
  content: string;
  category: 'essay' | 'analysis' | 'interview';
  slug: string;
  author_id: string;
}

export interface Director {
  id: number;
  created_at: string;
  name: string;
  bio: string;
  birth_year: number;
  death_year?: number;
  nationality: string;
  notable_works: string[];
  slug: string;
}

export interface Profile {
  id: string;
  created_at: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  favorite_films?: string[];
}

export interface Movie {
  _id: string;
  title: string;
  imageurl: string;
  imagepreviewurl: string;
  director: string;
  cast: string;
  duration: string;
  year: string;
  language: string;
  description: string;
  rating: number;
  votecount: number;
  url: string;
}