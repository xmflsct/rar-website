import { describe, it, expect } from 'vitest'
import { getPairs } from './checkout'

describe('getPairs', () => {
  it('should flatten a simple object', () => {
    const data = { a: 1, b: 'test' }
    const result = getPairs(data)
    expect(result).toEqual([
      [['a'], 1],
      [['b'], 'test'],
    ])
  })

  it('should flatten nested objects', () => {
    const data = { a: { b: 2 } }
    const result = getPairs(data)
    expect(result).toEqual([
      [['a', 'b'], 2],
    ])
  })

  it('should flatten arrays', () => {
    const data = { arr: [1, 2] }
    const result = getPairs(data)
    expect(result).toEqual([
      [['arr', '0'], 1],
      [['arr', '1'], 2],
    ])
  })

  it('should flatten mixed nested structures', () => {
    const data = {
      a: 1,
      b: { c: [3, { d: 4 }] }
    }
    const result = getPairs(data)
    expect(result).toEqual(expect.arrayContaining([
      [['a'], 1],
      [['b', 'c', '0'], 3],
      [['b', 'c', '1', 'd'], 4],
    ]))
    expect(result).toHaveLength(3)
  })

  it('should handle null values as primitives', () => {
    const data = { a: null, b: { c: null } }
    const result = getPairs(data)
    expect(result).toEqual([
      [['a'], null],
      [['b', 'c'], null],
    ])
  })
})
