import * as url from "url"
import { resolve } from "path"
import { readFileSync } from "fs"
import solc from "solc"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const contractPath = resolve(__dirname, "contracts", "Lottery.sol")
const source = readFileSync(contractPath, "utf8")

const input = {
  language: "Solidity",
  sources: {
    "Lottery.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
}

// console.log(solc.compile(source, 1).contracts[":Lottery"])
const { abi, evm } = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "Lottery.sol"
].Lottery

// Just because we only have one contract on the project
export { abi, evm }
