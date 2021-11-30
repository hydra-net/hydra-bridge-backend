// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.4;

interface IL1_Bridge {

      struct SwapData {
        uint8 tokenIndex;
        uint256 amountOutMin;
        uint256 deadline;
    }

  function sendToL2(
        uint256 chainId,
        address recipient,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline,
        address relayer,
        uint256 relayerFee
    )
        external
        payable;
    
}