import { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { Cake } from '~/utils/contentful'

export type CakeOrder = Omit<
  Cake,
  'availableOnline' | 'special' | 'description' | 'additionalInformation'
> & {
  chosen: {
    cakeCustomizations?: [string, number][]
    typeAAmount?: number
    typeBAmount?: number
    typeCAmount?: number
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
  cakeCheck: (order?: CakeOrder) => CakeOrder | null
}

const initBagState: BagState = {
  cakeOrders: [],
  cakeAdd: () => {},
  cakeRemove: () => {},
  cakeCheck: () => null
}

export const BagContext = createContext<BagState>(initBagState)

const BagProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [cakeOrders, setCakeOrders] = useState<CakeOrder[]>(
    initBagState.cakeOrders
  )
  useEffect(() => {
    const storedCakeOrders = localStorage.getItem('cakeOrders')
    if (!storedCakeOrders) return

    const cakeOrders = JSON.parse(storedCakeOrders)
    if (cakeOrders) {
      setCakeOrders(cakeOrders)
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('cakeOrders', JSON.stringify(cakeOrders))
  }, [cakeOrders])

  // sys id and delivery type defines a unique SKU
  const findCake = (order: CakeOrder): number => {
    return cakeOrders.findIndex(o => {
      if (o.sys.id === order.sys.id) {
        if (o.chosen.delivery?.type === order.chosen.delivery?.type) {
          return true
        } else {
          return false
        }
      }
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
  const cakeCheck = (order: CakeOrder | undefined) => {
    if (!order) return null
    const foundIndex = findCake(order)
    if (foundIndex >= 0) {
      return cakeOrders[foundIndex]
    } else {
      return null
    }
  }

  return (
    <BagContext.Provider
      value={{ cakeOrders, cakeAdd, cakeRemove, cakeCheck }}
      children={children}
    />
  )
}

export default BagProvider
