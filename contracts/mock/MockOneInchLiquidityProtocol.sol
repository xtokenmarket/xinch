pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockOneInchLiquidityProtocol {
    address inchAddress;

    address private constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    uint ethInch = 600; // eth $600, inch $1

    constructor(address _inchAddress) public {
        inchAddress = _inchAddress;
    }

    function swap(address src, address dst, uint256 amount, uint256 minReturn, address referral) external payable returns(uint256 result) {
        if(src == ETH_ADDRESS){
            result = msg.value * ethInch;
            IERC20(inchAddress).transfer(msg.sender, result);
        } else if(src == inchAddress){
            IERC20(inchAddress).transferFrom(msg.sender, address(this), amount);
            result = amount/ ethInch;
            (bool success, ) = msg.sender.call.value(result)("");
            require(success, "Transfer failed");
        }
    }

}