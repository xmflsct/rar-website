import store from "store2"
import { findIndex } from "lodash"

const storageKey = "rar-bag"
const storageVer = "200514"
let storageData = store(storageKey)

export function add(data) {
  !storageData.things[data.type] && (storageData.things[data.type] = [])
  const keyIndex = findIndex(storageData.things[data.type], [
    "contentful_id",
    data.contentful_id,
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
  const keyIndex = findIndex(storageData.things[data.type], ["hash", data.hash])
  if (keyIndex !== -1) {
    storageData.things[data.type].splice(keyIndex, 1)
    store(storageKey, storageData)
  }
  return storageData
}

export function clear() {
  const timestamp = new Date().getTime()
  storageData = { things: {}, timestamp: timestamp, version: storageVer }
  store(storageKey, storageData)
  return storageData
}

export function check() {
  const timestamp = new Date().getTime()
  if (storageData) {
    if (
      timestamp - storageData.timestamp > 60 * 60000 ||
      storageVer !== storageData.version
    ) {
      storageData = { things: {}, timestamp: timestamp, version: storageVer }
    } else {
      storageData.timestamp = timestamp
    }
  } else {
    storageData = { things: {}, timestamp: timestamp, version: storageVer }
  }
  store(storageKey, storageData)
  return storageData
}
