import HDWalletProvider from "@truffle/hdwallet-provider"
import Web3 from "web3"
import { abi, evm } from "./compile.js"
import { MNEMONIC } from "./env.js"

const provider = new HDWalletProvider(
  MNEMONIC,
  "https://rinkeby.infura.io/v3/ea9b38e2b3504c4196462b8d6e9dbda7"
)

const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()
  const result = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
    })
    .send({ from: accounts[0], gas: "1000000" })
  console.log("Contract deployed to: ", result.options.address)
  provider.engine.stop()
}

deploy()
