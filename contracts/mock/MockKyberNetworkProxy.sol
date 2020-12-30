pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockKyberNetworkProxy {
    function swapEtherToToken(ERC20 token, uint256 minConversionRate)
        external
        payable
        returns (uint256) {

            return 1;
        }

    function swapTokenToToken(
        ERC20 src,
        uint256 srcAmount,
        ERC20 dest,
        uint256 minConversionRate
    ) external returns (uint256) {

        return 1;
    }

    function swapTokenToEther(
        ERC20 token,
        uint256 tokenQty,
        uint256 minRate
    ) external payable returns (uint256) {

        return 1;
    }
}