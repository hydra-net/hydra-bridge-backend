// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

contract RootManager {
    function depositEtherFor(address user) public payable {}

    function depositFor(
        address user,
        address rootToken,
        bytes calldata depositData
    ) external {}

    function exit(bytes calldata inputData) external {}
}
