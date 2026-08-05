import type { MDXComponents } from 'mdx/types';
import Image, { type ImageProps } from 'next/image';
import Link from 'next/link';

/**
 * mdx-components.tsx — Global MDX component overrides.
 *
 * Registered components are used automatically by the @next/mdx plugin
 * for all .mdx pages and components in the app directory.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default HTML elements with styled/accessible versions
    h1: ({ children }) => (
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground mt-8 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-foreground mt-6 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-foreground mt-5 mb-2">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="leading-7 text-muted-foreground mb-4">{children}</p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href ?? '#'}
        className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
      >
        {children}
      </Link>
    ),
    img: (props) => (
      <Image
        {...(props as ImageProps)}
        className="rounded-xl my-6 w-full object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
        width={768}
        height={432}
        alt={(props as ImageProps & { alt?: string }).alt ?? ''}
      />
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 mb-4 text-muted-foreground">{children}</ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-xl bg-muted p-4 my-6 text-sm font-mono">
        {children}
      </pre>
    ),
    hr: () => <hr className="border-border my-8" />,
    // Spread caller-provided overrides last so they take precedence
    ...components,
  };
}
