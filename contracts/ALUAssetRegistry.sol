// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ALUAssetRegistry is ERC721, Ownable {
    uint256 private _tokenIds;

    struct AssetMetadata {
        string assetName;        
        string fileType;         
        bytes32 contentHash;     
        address registrant;      
        uint256 timestamp;       
    }

    //TokenID to metadata
    mapping(uint256 => AssetMetadata) private _assetMetadata;
    
    //Mapping from content hash to boolean (prevents duplicate registrations)
    mapping(bytes32 => bool) private _hashUsed;

    //Event notif when a new asset is registered
    event AssetRegistered(
        uint256 indexed tokenId,
        string assetName,
        bytes32 contentHash,
        address indexed registrant,
        uint256 timestamp
    );


    constructor() ERC721("ALU Official Logo", "ALULOGO") {
        _tokenIds = 0;
    }

    function registerAsset(
        string memory assetName,
        string memory fileType,
        bytes32 contentHash
    ) public returns (uint256) {
        //Checking for duplicate hash
        require(!_hashUsed[contentHash], "ALUAssetRegistry: This logo has already been registered");

        //Incrementing token ID to counter
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        //NFT minted to caller of contract
        _safeMint(msg.sender, newTokenId);

        //Storing metadata
        _assetMetadata[newTokenId] = AssetMetadata({
            assetName: assetName,
            fileType: fileType,
            contentHash: contentHash,
            registrant: msg.sender,
            timestamp: block.timestamp
        });

        _hashUsed[contentHash] = true;

        emit AssetRegistered(newTokenId, assetName, contentHash, msg.sender, block.timestamp);

        return newTokenId;
    }

    function verifyLogoIntegrity(uint256 tokenId, bytes32 providedHash) 
        public 
        view 
        returns (bool, string memory) 
    {
        require(_ownerOf(tokenId) != address(0), "ALUAssetRegistry: Token does not exist");
        
        bytes32 storedHash = _assetMetadata[tokenId].contentHash;
        
        if (storedHash == providedHash) {
            return (true, "Logo is authentic.");
        } else {
            return (false, "Warning: logo does not match.");
        }
    }

    function getAsset(uint256 tokenId) public view returns (AssetMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "ALUAssetRegistry: Token does not exist");
        return _assetMetadata[tokenId];
    }

    function getTokenIdByHash(bytes32 contentHash) public view returns (bool, uint256) {
        if (!_hashUsed[contentHash]) {
            return (false, 0);
        }
        
        uint256 currentId = _tokenIds;
        for (uint256 i = 1; i <= currentId; i++) {
            if (_assetMetadata[i].contentHash == contentHash) {
                return (true, i);
            }
        }
        return (false, 0);
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds;
    }
}