import store from "store2"
import { findIndex } from "lodash"

const storageKey = "rar-bag"
let storageData = store(storageKey)

export function add(data) {
  !storageData.things[data.type] && (storageData.things[data.type] = [])
  const keyIndex = findIndex(storageData.things[data.type], [
    "contentful_id",
    data.contentful_id
  ])
  if (keyIndex === -1) {
    storageData.things[data.type].push(data)
  } else {
    storageData.things[data.type][keyIndex] = data
  }
  store(storageKey, storageData)
  return storageData
}

export function remove(data) {
  const keyIndex = findIndex(storageData.things[data.type], [
    "contentful_id",
    data.contentful_id
  ])
  storageData.things[data.type].splice(keyIndex, 1)
  store(storageKey, storageData)
  return storageData
}

export function clear() {
  const timestamp = new Date().getTime()
  storageData = { things: {}, timestamp: timestamp }
  store(storageKey, storageData)
  return storageData
}

export function check() {
  const timestamp = new Date().getTime()
  if (storageData) {
    if (timestamp - storageData.timestamp > 60 * 60000) {
      storageData = { things: {}, timestamp: timestamp }
    } else {
      storageData.timestamp = timestamp
    }
  } else {
    storageData = { things: {}, timestamp: timestamp }
  }
  store(storageKey, storageData)
  return storageData
}
