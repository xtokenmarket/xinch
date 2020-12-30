//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Pausable.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interface/IGovernanceMothership.sol";
import "./interface/IGovernanceRewards.sol";
import "./interface/IMooniswapFactoryGovernance.sol";
import "./interface/IMooniswapPoolGovernance.sol";
// import "./interface/IKyberNetwork.sol";

interface IKyberNetworkProxy {
    function swapEtherToToken(ERC20UpgradeSafe token, uint256 minConversionRate)
        external
        payable
        returns (uint256);

    function swapTokenToToken(
        ERC20UpgradeSafe src,
        uint256 srcAmount,
        ERC20UpgradeSafe dest,
        uint256 minConversionRate
    ) external returns (uint256);

    function swapTokenToEther(
        ERC20UpgradeSafe token,
        uint256 tokenQty,
        uint256 minRate
    ) external payable returns (uint256);
}

// hook up pausable
contract xINCH is
    Initializable,
    ERC20UpgradeSafe,
    OwnableUpgradeSafe,
    PausableUpgradeSafe
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 private constant INITIAL_SUPPLY_MULTIPLIER = 10;
    uint256 private constant BUFFER_TARGET = 20; // 5% target

    uint256 public adminActiveTimestamp;

    IKyberNetworkProxy kyberNetwork;
    IERC20 private oneInch; // change to type address?

    IMooniswapFactoryGovernance private factoryGovernance;
    IGovernanceMothership private governanceMothership;
    IGovernanceRewards private governanceRewards;

    address stakedOneInch;

    address private manager;
    address private manager2;

    struct FeeDivisors {
        uint256 mintFee;
        uint256 burnFee;
        uint256 claimFee;
    }

    FeeDivisors public feeDivisors;

    uint256 withdrawableOneInchFees;

    function initialize(
        string calldata _symbol,
        IERC20 _oneInch,
        address _stakedOneInch,
        IGovernanceMothership _governanceMothership,
        IKyberNetworkProxy _kyberNetwork
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        // __Pausable_init_unchained(); // necessary?
        __ERC20_init_unchained("xINCH", _symbol);

        oneInch = _oneInch;
        stakedOneInch = _stakedOneInch;
        governanceMothership = _governanceMothership;
        kyberNetwork = _kyberNetwork;

        // _setFeeDivisors() // build;
    }

    function mint(uint256 minRate) external payable {
        require(msg.value > 0, "Must send ETH");

        uint256 fee = _calculateFee(msg.value, feeDivisors.mintFee);
        uint256 incrementalOneInch =
            kyberNetwork.swapEtherToToken.value(msg.value.sub(fee))(
                ERC20UpgradeSafe(address(oneInch)),
                minRate
            );
        return _mintInternal(incrementalOneInch);
    }

    function mintWithToken(uint256 oneInchAmount) external {
        require(oneInchAmount > 0, "Must send token");
        oneInch.safeTransferFrom(msg.sender, address(this), oneInchAmount);

        uint256 fee = _calculateFee(oneInchAmount, feeDivisors.mintFee);
        _incrementWithdrawableOneInchFees(fee);

        return _mintInternal(oneInchAmount.sub(fee));
    }

    function _mintInternal(uint256 _incrementalOneInch) private {
        uint256 mintAmount =
            calculateMintAmount(_incrementalOneInch, totalSupply());

        return super._mint(msg.sender, mintAmount);
    }

    function calculateMintAmount(
        uint256 incrementalOneInch,
        uint256 totalSupply
    ) public view returns (uint256 mintAmount) {
        if (totalSupply == 0)
            return incrementalOneInch.mul(INITIAL_SUPPLY_MULTIPLIER);

        uint256 totalNav = getNav();
        mintAmount = (incrementalOneInch).mul(totalSupply).div(totalNav);
    }

    function _calculateFee(uint256 _value, uint256 _feeDivisor)
        internal
        pure
        returns (uint256 fee)
    {
        if (_feeDivisor > 0) {
            fee = _value.div(_feeDivisor);
        }
    }

    function _incrementWithdrawableOneInchFees(uint256 _feeAmount) private {
        withdrawableOneInchFees = withdrawableOneInchFees.add(_feeAmount);
    }

    function getNav() public view returns (uint256) {
        return getStakedBalance().add(getBufferBalance());
    }

    function getStakedBalance() public view returns (uint256) {
        return IERC20(stakedOneInch).balanceOf(address(this));
    }

    function getBufferBalance() public view returns (uint256) {
        return oneInch.balanceOf(address(this)).sub(withdrawableOneInchFees);
    }

    function getReward() public onlyOwnerOrManager {
        _certifyAdmin(); // build
        _getReward();
    }

    function getRewardExternal() public {
        _getReward();
    }

    function _getReward() private {
        // TODO: build in fee
        governanceRewards.getReward();
    }

    function _stake(uint256 _amount) private {
        governanceMothership.stake(_amount);
    }

    function _unstake(uint256 _amount) private {
        governanceMothership.unstake(_amount);
    }

    function rebalance() public onlyOwnerOrManager {
        _certifyAdmin();
        _rebalance();
    }

    function rebalanceExternal() public {
        _rebalance();
    }

    function _rebalance() private {
        uint256 stakedBalance = getStakedBalance();
        uint256 bufferBalance = getBufferBalance();
        uint256 targetBuffer =
            (stakedBalance.add(bufferBalance)).div(BUFFER_TARGET);

        if (bufferBalance < targetBuffer) {
            _stake(bufferBalance.sub(targetBuffer));
        } else {
            _unstake(targetBuffer.sub(bufferBalance));
        }
    }

    //
    // Governance
    //

    function setFactoryGovernanceAddress(
        IMooniswapFactoryGovernance _factoryGovernance
    ) public onlyOwnerOrManager {
        factoryGovernance = _factoryGovernance;
    }

    function setGovernanceRewardsAddress(IGovernanceRewards _governanceRewards)
        public
        onlyOwnerOrManager
    {
        governanceRewards = _governanceRewards;
    }

    function defaultDecayPeriodVote(uint256 vote) public onlyOwnerOrManager {
        factoryGovernance.defaultDecayPeriodVote(vote);
    }

    function defaultFeeVote(uint256 vote) public onlyOwnerOrManager {
        factoryGovernance.defaultFeeVote(vote);
    }

    function defaultSlippageFeeVote(uint256 vote) public onlyOwnerOrManager {
        factoryGovernance.defaultSlippageFeeVote(vote);
    }

    function governanceShareVote(uint256 vote) public onlyOwnerOrManager {
        factoryGovernance.governanceShareVote(vote);
    }

    function referralShareVote(uint256 vote) public onlyOwnerOrManager {
        factoryGovernance.referralShareVote(vote);
    }

    function poolFeeVote(address pool, uint256 vote) public onlyOwnerOrManager {
        IMooniswapPoolGovernance(pool).feeVote(vote);
    }

    function poolSlippageFeeVote(address pool, uint256 vote)
        public
        onlyOwnerOrManager
    {
        IMooniswapPoolGovernance(pool).slippageFeeVote(vote);
    }

    function poolDecayPeriodVote(address pool, uint256 vote)
        public
        onlyOwnerOrManager
    {
        IMooniswapPoolGovernance(pool).decayPeriodVote(vote);
    }

    //
    // Utils
    //

    function _certifyAdmin() private {
        adminActiveTimestamp = block.timestamp;
    }

    function setManager(address _manager) public onlyOwner {
        manager = _manager;
    }

    function setManager2(address _manager2) public onlyOwner {
        manager2 = _manager2;
    }

    modifier onlyOwnerOrManager {
        require(
            msg.sender == owner() ||
                msg.sender == manager ||
                msg.sender == manager2,
            "Non-admin caller"
        );
        _;
    }
}
