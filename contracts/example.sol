// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.12;

contract Example {
    uint256 public value;

    constructor(uint256 _value) {
        value = _value;
    }

    function setValue(uint256 _value) external {
        value = _value;
    }
}