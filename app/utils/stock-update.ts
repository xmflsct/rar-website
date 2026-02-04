import { data } from 'react-router'

export interface StockItem {
  quantity: number | null
  metadata: {
    contentful_id?: string
    type?: string
    [key: string]: string | undefined
  }
}

export interface Env {
  CONTENTFUL_SPACE: string
  CONTENTFUL_PAT: string
}

export const updateStockOptimized = async (items: StockItem[], env: Env) => {
  const groupedItems = new Map<string, StockItem[]>()
  for (const item of items) {
    if (item.metadata.contentful_id) {
      const id = item.metadata.contentful_id
      if (!groupedItems.has(id)) {
        groupedItems.set(id, [])
      }
      groupedItems.get(id)!.push(item)
    }
  }

  await Promise.all(
    Array.from(groupedItems.entries()).map(async ([id, group]) => {
      const entry = await (
        await fetch(
          `https://api.contentful.com/spaces/${env.CONTENTFUL_SPACE}/environments/master/entries/${id}`,
          {
            headers: { Authorization: `Bearer ${env.CONTENTFUL_PAT}` }
          }
        )
      ).json<{
        sys: { id: string; version: number }
        fields: {
          typeAStock?: { 'en-GB': number }
          typeBStock?: { 'en-GB': number }
          typeCStock?: { 'en-GB': number }
        }
      }>()

      const runningStock: Record<string, number> = {}
      const types = ['A', 'B', 'C'] as const
      for (const t of types) {
          const s = entry.fields[`type${t}Stock` as keyof typeof entry.fields]?.['en-GB']
          if (typeof s === 'number') runningStock[t] = s
      }

      const patches: { op: 'replace'; path: string; value: number }[] = []
      // We operate on runningStock directly

      for (const item of group) {
        if (!item.metadata.type) {
           console.warn('No type provided')
           continue
        }
        const type = item.metadata.type as 'A' | 'B' | 'C'

        if (runningStock[type] === undefined) continue

        if (runningStock[type] === 0) {
            throw data({ error: `Stock of ${entry.sys.id} is 0!` }, { status: 500 })
        }

        runningStock[type] -= (item.quantity || 0)
      }

      for (const t of types) {
          const initial = entry.fields[`type${t}Stock` as keyof typeof entry.fields]?.['en-GB']
          if (initial !== undefined && typeof initial === 'number' && runningStock[t] !== undefined && runningStock[t] !== initial) {
              patches.push({
                  op: 'replace',
                  path: `/fields/type${t}Stock/en-GB`,
                  value: runningStock[t]
              })
          }
      }

      if (patches.length === 0) return

      await fetch(
        `https://api.contentful.com/spaces/${env.CONTENTFUL_SPACE}/environments/master/entries/${id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${env.CONTENTFUL_PAT}`,
            'Content-Type': 'application/json-patch+json',
            'X-Contentful-Version': entry.sys.version.toString()
          },
          body: JSON.stringify(patches)
        }
      )
    })
  )
}
