// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KAUS_NFT_V2 is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct ProductAuthentication {
        string productId;
        string orderId;
        string brand;
        string productName;
        uint256 mintedAt;
        bool isValid;
    }

    mapping(uint256 => ProductAuthentication) public authentications;
    mapping(address => bool) public authorizedMinters;

    bool public isSoulbound;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string productId,
        string orderId,
        string brand,
        string productName,
        uint256 mintedAt
    );

    event AuthenticationRevoked(uint256 indexed tokenId);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    event SoulboundStatusChanged(bool isSoulbound);

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedMinters[msg.sender],
            "Not authorized to mint"
        );
        _;
    }

    constructor() ERC721("KAUS Authentication", "KAUS") Ownable(msg.sender) {
        _nextTokenId = 1;
        isSoulbound = true;
    }

    function setSoulboundStatus(bool _isSoulbound) external onlyOwner {
        isSoulbound = _isSoulbound;
        emit SoulboundStatusChanged(_isSoulbound);
    }

    function authorizeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }

    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }

    function mintNFT(
        address recipient,
        string memory productId,
        string memory orderId,
        string memory brand,
        string memory productName,
        string memory tokenURI
    ) public onlyAuthorized returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(productId).length > 0, "Product ID required");
        require(bytes(orderId).length > 0, "Order ID required");
        require(bytes(brand).length > 0, "Brand required");
        require(bytes(productName).length > 0, "Product name required");

        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        authentications[tokenId] = ProductAuthentication({
            productId: productId,
            orderId: orderId,
            brand: brand,
            productName: productName,
            mintedAt: block.timestamp,
            isValid: true
        });

        emit NFTMinted(
            tokenId,
            recipient,
            productId,
            orderId,
            brand,
            productName,
            block.timestamp
        );

        return tokenId;
    }

    function getAuthentication(uint256 tokenId)
        public
        view
        returns (ProductAuthentication memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return authentications[tokenId];
    }

    function revokeAuthentication(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        authentications[tokenId].isValid = false;
        emit AuthenticationRevoked(tokenId);
    }

    function isAuthenticationValid(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return authentications[tokenId].isValid;
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function hasNFT(address user) public view returns (bool) {
        return balanceOf(user) > 0;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        if (isSoulbound && from != address(0) && to != address(0)) {
            revert("Token is soulbound and cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
