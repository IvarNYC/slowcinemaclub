'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" className="hover:text-foreground transition-colors duration-200" itemProp="item">
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const position = index + 2;

          return (
            <li key={path} className="flex items-center whitespace-nowrap" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="mx-2 text-muted-foreground/50">/</span>
              {isLast ? (
                <span className="font-medium text-foreground" itemProp="name">
                  {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                </span>
              ) : (
                <Link href={path} className="hover:text-foreground transition-colors duration-200" itemProp="item">
                  <span itemProp="name">{segment.charAt(0).toUpperCase() + segment.slice(1)}</span>
                </Link>
              )}
              <meta itemProp="position" content={position.toString()} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
