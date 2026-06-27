import { describe, expect, it } from 'vitest'
import { absoluteUrl, canonicalUrl, cleanDescription } from './seo'

describe('seo helpers', () => {
  it('normalizes canonical urls', () => {
    expect(canonicalUrl('/cake/foo/')).toBe('https://roundandround.nl/cake/foo')
  })

  it('normalizes asset urls', () => {
    expect(absoluteUrl('//images.ctfassets.net/foo.jpg')).toBe('https://images.ctfassets.net/foo.jpg')
  })

  it('keeps descriptions compact', () => {
    expect(cleanDescription('Round\n\nRound').length).toBeLessThanOrEqual(160)
    expect(cleanDescription('Round\n\nRound')).toBe('Round Round')
  })
})
