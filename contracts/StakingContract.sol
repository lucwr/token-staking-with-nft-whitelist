//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract {
    struct Stakers{
        address stakeOwner;
        uint stakeAmount;
        uint startStake;
    }

    uint currentStakeIndex = 0;
    uint stakingPercent = (1*100)/10;
    address BoredApeNFT;
    address BATtoken;
    mapping(address => mapping(uint=>Stakers)) stakerToStakes;
    mapping(address => uint) stakeNumber;
    address[] stakerAddress;
    constructor (address _BoredApeNFT, address _BATtoken) {
        BoredApeNFT = _BoredApeNFT;
        BATtoken = _BATtoken;
    }

    function stake(uint _amountIn) external{
        Stakers storage o = stakerToStakes[msg.sender][currentStakeIndex++];
        require(stakerToStakes[msg.sender][currentStakeIndex].stakeAmount == 0, "you already have an existing stake");
        require (IERC721(BoredApeNFT).balanceOf(msg.sender) >= 1, "You're required to have at least 1 Bored Ape NFT");
        require(_amountIn >= 10* 10**18, "You're required to stake at least 10 BAT tokens");
        require (IERC20(BATtoken).transferFrom(msg.sender, address(this), _amountIn), "Insufficient funds");
        o.stakeOwner = msg.sender;
        o.stakeAmount = _amountIn;
        o.startStake= block.timestamp;
        stakeNumber[msg.sender]++;
        stakerAddress.push(msg.sender);
    }

    function checkAllStakeBalance() view public returns(uint balance) {
        // 259200
        for(uint i =0; i<stakeNumber[msg.sender]; i++){
            Stakers storage o = stakerToStakes[msg.sender][i];
            if(block.timestamp- 2592000 >= o.startStake){
       while( block.timestamp- 2592000 >= o.startStake){
            balance += (o.stakeAmount + ((o.stakeAmount * stakingPercent) / 100));
        }
            } else {
                balance += o.stakeAmount ; 
            }  
       } 
    }

    function checkSingleStakeBalance(uint index) view public returns(uint balance) {
        // 259200
       Stakers storage o = stakerToStakes[msg.sender][index];
        if(block.timestamp- 2592000 >= o.startStake){
       while( block.timestamp- 2592000 >= o.startStake){
            balance += (o.stakeAmount + ((o.stakeAmount * stakingPercent) / 100));
        }
            } else {
                balance += o.stakeAmount ; 
            } 
    }

    function getAmount (uint _amount) external returns (bool){
        uint balance = checkAllStakeBalance();
        require(_amount <= balance, "insufficient funds");
        uint amountLeft =_amount;
        for(uint i =0; i<stakeNumber[msg.sender]; i++){
        Stakers storage o = stakerToStakes[msg.sender][i];
         if(o.stakeAmount - amountLeft <=0){
             o.stakeAmount = 0;
             amountLeft -= o.stakeAmount;
             continue;
         } else {
             o.stakeAmount -= amountLeft;
             break;
         }
        }
        (bool status) = IERC20(BATtoken).transfer(msg.sender, _amount);
        return status;
    }
}
