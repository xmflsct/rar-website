import type { MetaDescriptor } from 'react-router'

export const SITE_URL = 'https://roundandround.nl'
export const SITE_NAME = 'Round & Round Rotterdam'
export const DEFAULT_DESCRIPTION =
  'Cross cultural cakes and sweets from Round & Round in Rotterdam. Order cakes and sweets online for pickup or shipping.'

export const canonicalUrl = (pathname = '/') => {
  const path = pathname === '/' ? '' : pathname.replace(/\/+$/, '')
  return `${SITE_URL}${path}`
}

export const absoluteUrl = (url?: string) => {
  if (!url) return undefined
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${SITE_URL}${url}`
  return url
}

export const cleanDescription = (value?: string) =>
  (value || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().substring(0, 160)

export const seoMeta = ({
  title,
  description,
  pathname,
  image,
  noIndex = false
}: {
  title: string
  description?: string
  pathname?: string
  image?: string
  noIndex?: boolean
}): MetaDescriptor[] => {
  const content = cleanDescription(description)
  const url = canonicalUrl(pathname)
  const imageUrl = absoluteUrl(image)

  return [
    { title },
    { name: 'description', content },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    ...(imageUrl ? [{ property: 'og:image', content: imageUrl }] : []),
    { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
    ...(noIndex ? [{ name: 'robots', content: 'noindex, nofollow' }] : [])
  ]
}
