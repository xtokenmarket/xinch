# xINCH smart contracts audit report

Prepared by:

- Alex Tikonoff, [tikonoff@gmail.com](tikonoff@gmail.com)

Report:

- January 8, 2021 – date of delivery
- January 28, 2020 – last report update

<br><!-- ******************************************************** -->

## Preamble

This audit report was undertaken for the **[xToken](http://xToken.market)**, by its request, and has subsequently been shared publicly without any express or implied warranty.

Contracts provided and source verified at [link to Etherscan once deployed].

We would encourage all community members and token holders to make their own assessment of the contracts.

<br><!-- ******************************************************** -->

## Scope

The following contracts were subject for static analyses only:

#### Smart contracts

- [xINCH.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/xINCH.sol)
- [xINCHProxy.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/proxies/xINCHProxy.sol)
- [IExchangeGovernance.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/interface/IExchangeGovernance.sol)
- [IGovernanceMothership.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/interface/IGovernanceMothership.sol)
- [IGovernanceReward.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/interface/IGovernanceRewards.sol)
- [IKyberNetwork.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/interface/IKyberNetwork.sol)
- [IMooniswapFactoryGovernance.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/interface/IMooniswapFactoryGovernance.sol)
- [IMooniswapPoolGovernance.sol](https://github.com/xtokenmarket/xinch/blob/master/contracts/interface/IMooniswapPoolGovernance.sol)

### Out of scope

Documentation analysis, deploying, dynamic or function testing.

- Open Zeppeling libraries: [OpenZeppelin GSN](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/GSN), [OpenZeppelin math](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/math), [OpenZeppelin ERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20), [OpenZeppelin access](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/access), [OpenZeppelin utils](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/utils), – _standard libraries, previously audited_

<br><!-- ******************************************************** -->

## Reports

- [Static analysis](static-analysis.md)
- [Dynamic analysis](dynamic-analysis.md)
- [Test coverage](test-coverage.md)
- [Gas consumption report](gas-report.md)

<br><!-- ******************************************************** -->

## Issues found

### Severity Description

<table>
<tr>
  <td>Minor</td>
  <td>A defect that does not have a material impact on the contract execution and is likely to be subjective.</td>
</tr>
<tr>
  <td>Moderate</td>
  <td>A defect that could impact the desired outcome of the contract execution in a specific scenario.</td>
</tr>
<tr>
  <td>Major</td>
  <td> A defect that impacts the desired outcome of the contract execution or introduces a weakness that may be exploited.</td>
</tr>
<tr>
  <td>Critical</td>
  <td>A defect that presents a significant security vulnerability or failure of the contract across a range of scenarios.</td>
</tr>
</table>

### Minor

- **Compiler versions is not the latest one** – `Best practices`<br>

  The version of compiler used is 0.6.2
  It is recommended to use the latest version since some of the features become deprecated.
  Thus, `msg.sender.call.value(ethBal)("");` were changed with 0.6.4 to `msg.sender.call{value: ethBal}("");`

- **Use of SafeMath** – `Best practices`<br>

  ```
  contract MasterChef is Ownable {
    		 using SafeMath for uint256;
    		 ...
  ```

  While using SafeMath is good for project security, it could be expensive. Generally, it is good practice to use explicit checks where it is really needed, and to avoid extra checks where overflow/underflow is impossible.

- **New manager addresses are not being verified** – `Security`<br>
  Consider implementing verification of the new addresses to set as a manager, e.g.:

  ```
    function setManager(address _manager) external onlyOwner {
      require(_manager != address(0), 'Wrong address');
      manager = _manager;
    }
  ```

- **calculateMintAmount() require extra input param** - `Gas spending`<br>
  Function asks for the `uint256 totalSupply` param that could be obtained as `totalSupply()`.
  Then it's possible to simplify `_mintInternal()` and get rid of variable assignment:

  ```
      function _mintInternal(uint256 _incrementalOneInch) private {
          return super._mint(msg.sender, calculateMintAmount(_incrementalOneInch));
    }
  ```

### Moderate

- None found

### Major

- None found

### Critical

- None found

<br><!-- ******************************************************** -->

## Observations

- **Fee counting/logging is inconsistent**<br>
  Fee counted and logged on burning xINCH and minting it with tokens but not with ETH.<br>
  It could be helpful to explicitly log all the fees, including non withdrawable in someway, by storing them in variable or by emitting some event.

- **Amount to mint is calculating independently on swapped ETH/xINCH amount**<br>
  Function `mint()` calls `oneInchLiquidityProtocol.swap()` but doesn't use the returned value to its advantage. `swap` returns nothing, therefore `mint` should calculate the amount by itself. It would probably better to return swapped amount and do calculations of amount to mint based on the returned value, but checking `oneInch.balanceOf()` for safety reason.

<br><!-- ******************************************************** -->

## Conclusion

We are confident that these Smart Contracts do not exhibit any known security vulnerabilities. Overall the code is well written and the developers have been responsive and active throughout the audit process. The contracts show care taken by the developers to follow best practices and a strong knowledge of Solidity.

<br><!-- ******************************************************** -->

---

### Disclaimer

Our team uses our current understanding of the best practices for Solidity and Smart Contracts. Development in Solidity and for Blockchain is an emerging area of software engineering which still has a lot of room to grow, hence our current understanding of best practice may not find all of the issues in this code and design.

We have not analysed any of the assembly code generated by the Solidity compiler. We have not verified the deployment process and configurations of the contracts. We have only analysed the code outlined in the scope. We have not verified any of the claims made by any of the organizations behind this code.

Security audits do not warrant bug-free code. We encourage all users interacting with smart contract code to continue to analyse and inform themselves of any risks before interacting with any smart contracts.

```

```
