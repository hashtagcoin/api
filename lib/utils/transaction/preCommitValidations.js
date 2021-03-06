'use strict'

async function preCommitValidations(transaction, records) {
  /* Create a Set of IOUs and a Map of address:countspace keys for quick access */
  let actualInputs = new Set()
  let actualOutputs = new Map()
  for (let record of records) {
    for (let input of record.inputs) {actualInputs.add(input)}
    for (let output of record.outputs) {
      actualOutputs.set(colonKey(output.adr, output.cru), output)
    }
  }

  let inputs = await inputValidations(transaction, actualInputs)
  let outputs = await outputValidations(transaction, actualOutputs)
  return {success: inputs && outputs}
}

async function inputValidations(transaction, actualInputs) {
  /* Check the actual inputs against the desired inputs */
  let inputsCleared = 0
  let transactionInputs = transaction.data.inputs.map(input => input.hash.val)
  for (let input of transactionInputs) {
    if (actualInputs.has(input)) inputsCleared++
  }

  let validation = (transactionInputs.length === inputsCleared)

  return validation
}

async function outputValidations(transaction, actualOutputs) {
  /* Check the actual outputs against the desired outputs */
  let outputsCreated = 0
  for (let output of transaction.data.outputs) {
    let actualOutput = actualOutputs.get(colonKey(output.adr, output.cru))
    if (actualOutput) {
      /* Check all previous outputs that should have been spent */
      let previousReferenced = 0
      let previousSet = new Set(actualOutput.pre)
      for (let previous of output.pre) {
        if (previousSet.has(previous)) previousReferenced++
      }
      /* Check whether all outputs match the transaction criteria */
      if (output.pre.length === previousReferenced) outputsCreated++
    }
  }

  actualOutputs.clear()

  return (transaction.data.outputs.length === outputsCreated)
}

function colonKey(...segments) {
  return segments.join(':')
}

module.exports = preCommitValidations
