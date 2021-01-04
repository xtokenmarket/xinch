pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MockOneInch is ERC20{
    constructor() public ERC20("OneInch", "INCH") {
        _mint(msg.sender, 1000e18);
    }
}