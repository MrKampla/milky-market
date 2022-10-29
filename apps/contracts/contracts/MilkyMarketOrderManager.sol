// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract MilkyMarketOrderManager is ERC721, ERC721Enumerable, ERC721Burnable, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;

  struct Order {
    address offeredToken;
    address wantedToken;
    uint256 amountOffered;
    uint256 amountWanted;
    address recipient; // can be address 0 if order is public
  }

  mapping(uint256 => Order) public orders;

  constructor() ERC721('MilkyMarketOrder', 'MMO') {}

  function getOrder(uint256 tokenId) public view returns (Order memory) {
    return orders[tokenId];
  }

  function safeMint(address to, Order calldata order) public onlyOwner returns (uint256) {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
    orders[tokenId] = order;
    return tokenId;
  }

  function burn(uint256 tokenId) public override onlyOwner {
    delete orders[tokenId];
    super._burn(tokenId);
  }

  // The following functions are overrides required by Solidity.
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
