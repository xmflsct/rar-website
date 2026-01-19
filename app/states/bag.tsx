import { createContext, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Cake } from '~/utils/contentful'
import { getDateVersionString } from '~/utils/dateHelpers'

export type CakeOrder = Omit<
  Cake,
  'availableOnline' | 'special' | 'description' | 'additionalInformation'
> & {
  chosen: {
    unit: 'A' | 'B' | 'C'
    amount: number
    cakeCustomizations?: [string, number, string?][]
    delivery?:
      | {
          type: 'pickup'
          date?: string
        }
      | {
          type: 'shipping'
          date?: string
        }
  }
}

export type BagState = {
  cakeOrders: CakeOrder[]
  cakeAdd: (order: CakeOrder) => void
  cakeRemove: (order: CakeOrder) => void
}

const VERSION = '20240815'

const initBagState: BagState = {
  cakeOrders: [],
  cakeAdd: () => {},
  cakeRemove: () => {}
}

export const BagContext = createContext<BagState>(initBagState)

const BagProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [cakeOrders, setCakeOrders] = useState<CakeOrder[]>(initBagState.cakeOrders)
  useEffect(() => {
    const NOW = getDateVersionString()
    const VERSION_LOCAL = localStorage.getItem('version') || NOW
    if (VERSION_LOCAL < VERSION) {
      localStorage.removeItem('cakeOrders')
      localStorage.setItem('version', VERSION)
    } else {
      localStorage.setItem('version', VERSION)
    }

    const storedCakeOrders = localStorage.getItem('cakeOrders')
    if (!storedCakeOrders) return

    const cakeOrders = JSON.parse(storedCakeOrders)
    if (cakeOrders) {
      setCakeOrders(cakeOrders)
    }
  }, [])
  const rendered = useRef<boolean>(false)
  useEffect(() => {
    if (rendered.current) {
      localStorage.setItem('cakeOrders', JSON.stringify(cakeOrders))
    } else {
      rendered.current = true
    }
  }, [rendered.current, cakeOrders])

  // sys id and delivery type defines a unique SKU
  const findCake = (order: CakeOrder): number => {
    return cakeOrders.findIndex(o => {
      if (
        o.sys.id === order.sys.id &&
        o.chosen.unit === order.chosen.unit &&
        o.chosen.delivery?.type === order.chosen.delivery?.type
      ) {
        return true
      }
      return false
    })
  }

  const cakeAdd = (order: CakeOrder) => {
    const foundIndex = findCake(order)
    if (foundIndex === -1) {
      setCakeOrders([...cakeOrders, order])
    } else {
      setCakeOrders(cakeOrders.map((c, i) => (i === foundIndex ? order : c)))
    }
  }
  const cakeRemove = (order: CakeOrder) => {
    const foundIndex = findCake(order)
    if (foundIndex >= 0) {
      setCakeOrders(cakeOrders.filter((_, index) => index !== foundIndex))
    }
  }

  return <BagContext.Provider value={{ cakeOrders, cakeAdd, cakeRemove }} children={children} />
}

export default BagProvider
