pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockGovernanceRewards {
    IERC20 oneInch;
    constructor(IERC20 _oneInch) public {
        oneInch = _oneInch;
    }

    function getReward() external {
        oneInch.transfer(msg.sender, 1e17);
    }

    function earned(address account) external view returns (uint256) {
        return 1;
    }
}