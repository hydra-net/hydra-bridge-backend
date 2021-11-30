// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/polygon/IRootChainManager.sol";
import "./interfaces/hop/IL1_Bridge.sol";

contract XsnBridgeAggregator {

    function bridgePoly(address predicate, address contractAddr, address user, address rootToken, uint256 amount, bytes calldata depositData) external {
        IERC20(rootToken).approve(predicate,amount);
        IERC20(rootToken).transferFrom(msg.sender,address(this),amount);
        IRootChainManager(contractAddr).depositFor(user,rootToken,depositData);
    }

     function bridgeEthPoly(address contractAddr, address user) payable external {
        IRootChainManager(contractAddr).depositEtherFor{value: msg.value}(user);
    }

    function sendToL2Hop(address rootToken, address contractAddr, uint256 chainId, address recipient,uint256 amount,uint256 amountOutMin,uint256 deadline,address relayer,uint256 relayerFee) external {
        IERC20(rootToken).approve(contractAddr,amount);
        IERC20(rootToken).transferFrom(msg.sender,address(this),amount);
        IL1_Bridge(contractAddr).sendToL2(chainId,recipient,amount,amountOutMin,deadline,relayer,relayerFee);
    }

    function sendToL2HopEth(address contractAddr, uint256 chainId, address recipient,uint256 amount,uint256 amountOutMin,uint256 deadline,address relayer,uint256 relayerFee) payable external {
        IL1_Bridge(contractAddr).sendToL2{value:msg.value}(chainId,recipient,amount,amountOutMin,deadline,relayer,relayerFee);
    }
}