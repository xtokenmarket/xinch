pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockKyberNetworkProxy {
    address inchAddress;

    constructor(address _inchAddress) public {
        inchAddress = _inchAddress;
    }

    uint ethInch = 600; // eth $600, inch $1

    function swapEtherToToken(ERC20 token, uint minConversionRate) external payable returns(uint amountToSend) {
        if(token == ERC20(inchAddress)){
            amountToSend = msg.value * ethInch;
            IERC20(inchAddress).transfer(msg.sender, amountToSend);
        }
    }
    function swapTokenToEther(ERC20 token, uint tokenQty, uint minRate) external payable returns(uint returnAmount) {
        if(token == ERC20(inchAddress)){
            IERC20(inchAddress).transferFrom(msg.sender, address(this), tokenQty);
            returnAmount = tokenQty/ ethInch;
            (bool success, ) = msg.sender.call.value(returnAmount)("");
            require(success, "Transfer failed");
        }
    }

    function swapTokenToToken(ERC20 src, uint srcAmount, ERC20 dest, uint minConversionRate) public returns(uint){

    }

    receive() external payable {

    }
}