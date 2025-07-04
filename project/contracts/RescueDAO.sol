// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RescueDAO is Ownable {
    IERC20 public usdcToken;
    
    event FundsReleased(address indexed recipient, uint256 amount);
    event USDCReleased(address indexed recipient, uint256 amount);

    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcAddress);
    }

    // Release native currency (MATIC)
    function release(address payable recipient, uint256 amount) external onlyOwner returns (bool) {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit FundsReleased(recipient, amount);
        return true;
    }

    // Release USDC tokens
    function releaseUSDC(address recipient, uint256 amount) external onlyOwner returns (bool) {
        require(usdcToken.transfer(recipient, amount), "USDC transfer failed");
        emit USDCReleased(recipient, amount);
        return true;
    }

    // Get contract's native token balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Get contract's USDC balance
    function getUSDCBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    // Allow contract to receive native currency
    receive() external payable {}
}
