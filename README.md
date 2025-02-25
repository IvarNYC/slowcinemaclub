# Slow Cinema Club

A Next.js application for reviewing and discussing arthouse and experimental cinema.

## Features

- Dynamic content generation with Incremental Static Regeneration (ISR)
- MongoDB integration for storing and retrieving movie data
- Responsive image loading with Next.js Image optimization
- Type-safe components and API routes
- Beautiful and modern UI with Tailwind CSS
- Rich text formatting with Markdown support in reviews
  - GitHub Flavored Markdown (GFM) support
  - Syntax highlighting
  - Tables, task lists, and strikethrough
  - Automatic link formatting
  - Responsive typography with dark mode support
- Intelligent language handling
  - Automatic translation of language names to English
  - Support for multiple languages per film
  - Smart detection of language codes and names
  - Comprehensive ISO 639-1 language support
- Comprehensive SEO optimization
  - Dynamic meta tags and Open Graph data
  - Structured data with Schema.org markup
  - Automatic sitemap generation
  - RSS feed for content syndication
  - Breadcrumb navigation
  - Proper heading hierarchy
  - Optimized pagination with rel="next/prev"

## Homepage Features

- Hero section with dynamic background
- Latest Reviews section showcasing the three most recent film analyses
- Weekly Featured Reviews with sophisticated hover effects and animations
- Coming Soon section for upcoming content
- About section with mission statement and features overview

## Technical Details

### Dynamic Content Generation

- Pages are generated on-demand and cached for 1 hour using ISR
- No static path generation at build time, allowing for dynamic content updates
- Automatic background revalidation of stale content
- Manual revalidation available through the `/api/revalidate` endpoint

### Data Fetching

- MongoDB integration for efficient data storage and retrieval
- Optimized queries with proper indexing on the `updatedat` field
- Weekly rotation system for featured content
- Error handling for failed database operations
- Type-safe database operations with TypeScript interfaces

### Performance Optimizations

- Responsive images with automatic size optimization
- Eager loading for above-the-fold content
- Lazy loading for images below the fold
- Suspense boundaries for progressive loading
- Skeleton loading states for better UX
- Optimized font loading with next/font
- Proper caching headers for static assets

### SEO Features

- Dynamic meta tags generation for all pages
- Open Graph and Twitter card support
- Structured data implementation
  - WebSite schema for homepage
  - Review schema for movie reviews
  - BreadcrumbList schema for navigation
- Dynamic sitemap generation
- RSS feed for content syndication
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive alt texts for images
- Pagination with rel="next/prev" support
- Mobile-friendly responsive design
- Font optimization with next/font
- Breadcrumb navigation for better UX

### Type Safety

- TypeScript interfaces for all data models
- Type-safe API routes and page components
- Proper error handling with TypeScript
- MongoDB type definitions for database operations

## Development

To run the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Environment Variables

Required environment variables:

- `MONGODB_URI`: Connection string for MongoDB
- `MONGODB_DB`: Database name
- `REVALIDATE_TOKEN`: Token for the revalidation API

## Tech Stack
- Next.js 15
- React 19
- MongoDB
- TailwindCSS
- Supabase

## License

[MIT](https://choosealicense.com/licenses/mit/)
