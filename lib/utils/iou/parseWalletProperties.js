'use strict'

/** Extract the addresses and their properties listed in the provided IOUs **/
function parseWalletProperties(ious = []) {
  let countspaces = new Set()
  /* Create a map of address keys and Set() values with their countspaces */
  let map = new Map()
  for (let iou of ious) {
    /* Map<Address, Set(Countspaces)> */
    mapSet(map, iou.data.sub, iou.data.cru) // source (subject)
    mapSet(map, iou.data.aud, iou.data.cru) // target (audience)
    countspaces.add(iou.data.cru)
  }
  countspaces = Array.from(countspaces.keys())

  /* Create an array of address/counstpaces from the map and its sets */
  let wallets = new Map()
  for (let address of map.keys()) {
    wallets.set(address, {countspaces: Array.from(map.get(address).keys())})
  }

  return {wallets, countspaces}
}

/* Map<Key, Set()> */
function mapSet(map, key, element) {
  return (map.get(key) || map.set(key, new Set()).get(key)).add(element)
}

module.exports = parseWalletProperties
