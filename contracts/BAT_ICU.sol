// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 contract buyBAT{
    IERC20 BATtoken;
    uint256 rate = 100;
    uint256 minimumBuy;
    uint256 maximumBuy;
    event Buy(address by, uint256 value);

    constructor(address _BATtoken){
        BATtoken = IERC20(_BATtoken);
        minimumBuy = 10 * 10**18;
        maximumBuy = 10000 * 10**18;
    }

    function buy() public payable{
        require(msg.value >= minimumBuy, "Cheap skate! Buy more!");
        require(msg.value <= maximumBuy, "You've exceeded the maximum buy!");
        uint256 tokenBalance = checkTokenBalance();
        require(msg.value*rate <= tokenBalance, "Not enough token available. Try a lower value");
        BATtoken.transfer(msg.sender, msg.value * rate);
        emit Buy(msg.sender, msg.value * rate);
    }

    function checkBalance () external view returns (uint256){
        return address(this).balance;
    }
    function checkTokenBalance () public view returns (uint256){
        return BATtoken.balanceOf(address(this));
    }
 }