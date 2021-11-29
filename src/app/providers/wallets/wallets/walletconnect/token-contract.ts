import {TokenContract} from '../metamask/token-contract';
export class WalletConnectTokenContract extends TokenContract {
  constructor(
    web3Provider,
    tokenAddress: string
  ) {
    super(web3Provider, tokenAddress);
    this.walletAddress = web3Provider.accounts[0];
  }
}
