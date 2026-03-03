// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ALULogoToken is ERC20, Ownable {
    //fixed supply at 1,000,000 tokens (with 18 decimals)
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10**18;

    constructor(address owner) ERC20("ALU Logo Token", "ALUT") {
        require(owner != address(0), "ALULogoToken: owner cannot be zero address");
        
        //Mint all tokens to the specified owner
        _mint(owner, TOTAL_SUPPLY);
        
        //Transfer ownership from deployer to the specified owner
        transferOwnership(owner);
    }

    function distributeShares(address recipient, uint256 amount) public onlyOwner {
        require(recipient != address(0), "ALULogoToken: recipient cannot be zero address");
        require(amount > 0, "ALULogoToken: amount must be greater than zero");
        require(balanceOf(owner()) >= amount, "ALULogoToken: insufficient owner balance");
        
        transferFrom(owner(), recipient, amount);
    }

    function distributeSharesWithApproval(address recipient, uint256 amount) public onlyOwner {
        require(recipient != address(0), "recipient cannot be zero address");
        require(amount > 0, "amount must be greater than zero");
        
        _approve(owner(), owner(), amount);
        
        //Transferring tokens
        transferFrom(owner(), recipient, amount);
    }

    function ownershipPercentage(address account) public view returns (uint256) {
        uint256 balance = balanceOf(account);
        if (balance == 0) return 0;
        
        return (balance * 100) / TOTAL_SUPPLY;
    }

    function balanceOfInTokens(address account) public view returns (uint256) {
        return balanceOf(account) / 10**18;
    }
    
    function renounceOwnership() public override onlyOwner {
        revert("ALULogoToken: Cannot renounce ownership");
    }
}