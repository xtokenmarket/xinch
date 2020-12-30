pragma solidity 0.6.2;

contract MockGovernanceRewards {
    function getReward() external {

    }
    function earned(address account) external view returns (uint256) {
        return 1;
    }
}