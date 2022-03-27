//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract {
    // ----------- Data Variables -----------
    uint96 constant minStakePeriod = 3 days;
    address BoredApeNFT;
    address BATtoken;

    // -----Mappings------
    mapping(address => Staker) stakerToStakes;

    //  -----------Structs && Data Structures-----------
     struct Staker{
        address owner;
        uint96 lastTimeStake;
        uint currentStake;   
    }

    // -----------Custom Errors-----------
    error MustHaveBoredApeNFT();
    error InsufficientTokens();
    error MustHaveStaked();

    // -----------Constructor-----------
     constructor (address _BoredApeNFT, address _BATtoken) {
        BoredApeNFT = _BoredApeNFT;
        BATtoken = _BATtoken;
    }

    // -----------Functions-----------

    // function that allows new stakers to stake tokens initially
    // It also allows existing stakers to restake
    // this function re-compounds the staker's stakes if the lastStakedTime is greater than 3 days each time its being called 
    function stakeTokens (uint _amountIn) external{
        Staker storage o = stakerToStakes[msg.sender];
        if(o.lastTimeStake == 0){
        if (IERC721(BoredApeNFT).balanceOf(msg.sender) <= 1) revert MustHaveBoredApeNFT();
        if(_amountIn <= 5000000000000000000) revert InsufficientTokens();
        assert (IERC20(BATtoken).transferFrom(msg.sender, address(this), _amountIn));
        o.owner = msg.sender;
        o.currentStake = _amountIn;
        o.lastTimeStake = uint96(block.timestamp);
        } else {
        if (o.lastTimeStake >= block.timestamp) revert MustHaveStaked();
        uint stakePeriod = block.timestamp - o.lastTimeStake;
        if(stakePeriod >= minStakePeriod){
            uint bonus = (o.currentStake * 386/1000000000 * stakePeriod);
            o.currentStake += _amountIn + bonus;
        } else {
            o.currentStake += _amountIn;
        }
        o.lastTimeStake = uint96(block.timestamp);
        }
        
    }

    // function to withdraw tokens for staker's currnt balance
    // this function re-compounds the staker's stakes if the lastStakedTime is greater than 3 days each time its being called 
    function withdraw (uint _amount) external{
        Staker storage o = stakerToStakes[msg.sender];
        uint stakePeriod = block.timestamp - o.lastTimeStake;
        if(stakePeriod >= minStakePeriod){
            uint bonus = (o.currentStake * 386/1000000000 * stakePeriod);
            o.currentStake += bonus;
        }
        if(o.currentStake <= _amount) revert InsufficientTokens();
        o.currentStake -= _amount;
        o.lastTimeStake = uint96(block.timestamp);
        assert(IERC20(BATtoken).transfer(msg.sender, _amount));
    }

    // This function checks the compounded balance for each staker
    function checkStakingBalance () external view returns (uint balance){
        Staker storage o = stakerToStakes[msg.sender];
        uint stakePeriod = block.timestamp - o.lastTimeStake;
        if(stakePeriod >= minStakePeriod){
            uint bonus = (o.currentStake * 386/1000000000 * stakePeriod);
           return balance= o.currentStake + bonus;
        } 
        return balance = o.currentStake;
    }
}