import assert from "assert"
import ganache from "ganache-cli"
import Web3 from "web3"
import { abi, evm } from "../compile.js"

const web3 = new Web3(ganache.provider())

let accounts, lottery

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts()
  // Use one of these accounts to deploy the contract
  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
    })
    .send({ from: accounts[0], gas: "1000000" })
})

describe("Lottery ", () => {
  it("Deploys a contract", () => {
    assert.ok(lottery.options.address)
  })

  it("Manager", async () => {
    const owner = await lottery.methods._manager().call()
    assert.equal(accounts[0], owner)
  })

  it("Allow one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    })
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })
    assert.equal(1, players.length)
    assert.equal(accounts[0], players[0])
  })

  it("Allow multiple accounts to enter", async () => {
    for (let i = 0; i < 3; i++) {
      await lottery.methods.enter().send({
        from: accounts[i],
        value: web3.utils.toWei("0.02", "ether"),
      })
    }

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(3, players.length)
    for (let i = 0; i < 3; i++) {
      assert.equal(accounts[i], players[i])
    }
  })

  it("Insufficient amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.001", "ether"),
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it("Only manager", async () => {
    try {
      await lottery.methods.chooseWinner().send({
        from: accounts[1],
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it("Sends money to the winner and reset", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether"),
    })

    const initialBalance = await web3.eth.getBalance(accounts[1])
    await lottery.methods.chooseWinner().send({
      from: accounts[0],
    })
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })
    assert.equal(0, players.length)

    const finalBalance = await web3.eth.getBalance(accounts[1])
    const delta = finalBalance - initialBalance
    assert(delta > web3.utils.toWei("1.8", "ether"))
  })
})
