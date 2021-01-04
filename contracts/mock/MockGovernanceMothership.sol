pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// https://etherscan.io/address/0xa0446d8804611944f1b527ecd37d7dcbe442caba#code
contract MockGovernanceMothership is ERC20("StakedInch", "StkInch") {
    IERC20 oneInch;

    constructor(IERC20 _oneInch) public {
        oneInch = _oneInch;
    }

    function stake(uint256 amount) external {
        oneInch.transferFrom(msg.sender, address(this), amount);
        super._mint(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        oneInch.transfer(msg.sender, amount);
        super._burn(msg.sender, amount);
    }
}