import {AirdropContract} from '../metamask/airdrop-contract';
export class WalletConnectAirdropContract extends AirdropContract {
  constructor(
    web3Provider
  ) {
    super(web3Provider);
    this.walletAddress = web3Provider.accounts[0];
  }
}
