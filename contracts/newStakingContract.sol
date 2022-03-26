//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NewStakingContract {
    struct Staker{
        address owner;
        uint currentStake;
        uint startTimeStake;
        uint lastTimeStake;
    }
    uint minStakePeriod = 3 days;
    address BoredApeNFT;
    address BATtoken;
    mapping(address => Staker) stakerToStakes;
    address[] stakerAddress;

     constructor (address _BoredApeNFT, address _BATtoken) {
        BoredApeNFT = _BoredApeNFT;
        BATtoken = _BATtoken;
    }

    function stakeTokens (uint _amountIn) external{
        Staker storage o = stakerToStakes[msg.sender];
        if(o.lastTimeStake == 0){
        require (IERC721(BoredApeNFT).balanceOf(msg.sender) >= 1, "You need to have 1 Bored Ape NFT");
        require(_amountIn >= 5* 10**18, "You need  to stake > 5 BAT tokens");
        require (IERC20(BATtoken).transferFrom(msg.sender, address(this), _amountIn), "Insufficient funds");
        o.owner = msg.sender;
        o.currentStake = _amountIn;
        o.startTimeStake= block.timestamp;
        o.lastTimeStake = block.timestamp;
        stakerAddress.push(msg.sender);
        } else {
        require(o.lastTimeStake <= block.timestamp, "You're required to have staked before");
        uint stakePeriod = block.timestamp - o.lastTimeStake;
        if(stakePeriod >= minStakePeriod){
            uint bonus = (o.currentStake * 347/1000000000 * stakePeriod);
            o.currentStake += _amountIn + bonus;
        } else {
            o.currentStake += _amountIn;
        }
        o.lastTimeStake = block.timestamp;
        }
        
    }

    function withdraw (uint _amount) external returns (bool){
        Staker storage o = stakerToStakes[msg.sender];
        uint stakePeriod = block.timestamp - o.lastTimeStake;
        if(stakePeriod >= minStakePeriod){
            uint bonus = (o.currentStake * 347/1000000000 * stakePeriod);
            o.currentStake += bonus;
        }
        require(o.currentStake >= _amount, "insufficient funds");
        o.currentStake -= _amount;
        o.lastTimeStake = block.timestamp;
        (bool status) = IERC20(BATtoken).transfer(msg.sender, _amount);
        return status;
    }

    function getDays (uint time) internal pure returns(uint day){
        while(time - 86400 >= 0){
            day++;
        }
    }

    function checkStakingBalance () external view returns (uint balance){
        Staker storage o = stakerToStakes[msg.sender];
        uint stakePeriod = block.timestamp - o.lastTimeStake;
        if(stakePeriod >= minStakePeriod){
            uint bonus = (o.currentStake * 347/1000000000 * stakePeriod);
           return balance= o.currentStake + bonus;
        } 
        return balance = o.currentStake;
    }
}