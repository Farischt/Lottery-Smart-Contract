// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery {
  address public _manager;
  address payable[] public _players;

  constructor() {
    _manager = msg.sender;
  }

  modifier onlyManager() {
    require(msg.sender == _manager);
    _;
  }

  function enter() public payable {
    require(msg.value > .01 ether, "Please provide a valid amount of money");
    _players.push(payable(msg.sender));
  }

  function random() private view returns (uint256) {
    return
      uint256(
        keccak256(abi.encodePacked(block.difficulty, block.timestamp, _players))
      );
  }

  function chooseWinner() public onlyManager {
    uint256 index = random() % _players.length;
    _players[index].transfer(address(this).balance);
    _players = new address payable[](0);
  }

  function getPlayers() public view returns (address payable[] memory) {
    return _players;
  }
}
