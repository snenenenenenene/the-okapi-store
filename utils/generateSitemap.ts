/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/generateSitemap.ts
import { writeFileSync } from 'fs'
import { globby } from 'globby'

export async function generateSitemap() {
  const pages = await globby([
    'app/**/*.tsx',
    '!app/**/_*.tsx',
    '!app/**/*.test.tsx',
  ])

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((page: any) => {
          const path = page
            .replace('app/', '')
            .replace('/page.tsx', '')
            .replace('/index.tsx', '')
          const route = path === 'index' ? '' : path
          return `
            <url>
              <loc>${`${process.env.NEXT_PUBLIC_BASE_URL}/${route}`}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>0.7</priority>
            </url>
          `
        })
        .join('')}
    </urlset>
  `

  writeFileSync('public/sitemap.xml', sitemap)
}