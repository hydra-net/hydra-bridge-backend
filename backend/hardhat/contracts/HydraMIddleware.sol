// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/polygon/IRootChainManager.sol";
import "./interfaces/hop/IL1_Bridge.sol";

contract HydraMIddleware is Ownable, Pausable {
    /**
        Address of polygon bridge root chain manager contract
    */
     address _polygonRootChainManager;

     /**
        Address of polygon bridge erc20Predicate contract
    */

     address _erc20Predicate;

     /**
        Address of hop bridge contract
    */
     address _hopBridge;

    constructor(address polygonRootChainManager, address erc20Predicate, address hopBridge) {
         _polygonRootChainManager = polygonRootChainManager;
          _erc20Predicate = erc20Predicate;
          _hopBridge = hopBridge;
    }

     function sendToPolygon(address recipient, address rootToken, uint256 amount, bytes calldata depositData) external {
        IERC20(rootToken).approve(_erc20Predicate,amount);
        IERC20(rootToken).transferFrom(msg.sender,address(this),amount);
        IRootChainManager(_polygonRootChainManager).depositFor(recipient,rootToken,depositData);
    }

     function sendEthToPolygon( address recipient) payable external {
        IRootChainManager(_polygonRootChainManager).depositEtherFor{value: msg.value}(recipient);
    }

    function sendToL2Hop(address rootToken, address recipient, uint256 chainId,uint256 amount,uint256 amountOutMin,uint256 deadline,address relayer,uint256 relayerFee) external {
        IERC20(rootToken).approve(_hopBridge,amount);
        IERC20(rootToken).transferFrom(msg.sender,address(this),amount);
        IL1_Bridge(_hopBridge).sendToL2(chainId,recipient,amount,amountOutMin,deadline,relayer,relayerFee);
    }

    function sendEthToL2Hop(address recipient, uint256 chainId,uint256 amountOutMin,uint256 deadline,address relayer,uint256 relayerFee) payable external {
        IL1_Bridge(_hopBridge).sendToL2{value:msg.value}(chainId,recipient,msg.value,amountOutMin,deadline,relayer,relayerFee);
    }

     function checkAllowance(address owner, address spender) external view returns (uint256){
         return IERC20(address(this)).allowance(owner,spender);
     }

    function setRootManager(address polygonRootChainManager) external onlyOwner { 
        _polygonRootChainManager = polygonRootChainManager;
    }

    function setHopBridge(address hopBridge) external onlyOwner { 
          _hopBridge = hopBridge;
    }

     function setErc20Predicate(address erc20Predicate) external onlyOwner { 
         _erc20Predicate = erc20Predicate;
    }

    /**
        Disable the contract.
    */
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    /**
        Enable the contract.
    */
    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

   
}