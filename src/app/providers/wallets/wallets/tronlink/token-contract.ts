import {AbstractContract} from './abstract-contract';
import {TRON_AIRDROP_ADDRESSES} from '../../constants/contracts/tron-airdrop';
import {TRC20_TOKEN_ABI} from '../../../blockchains/constants/trc20';


export class TokenContract extends AbstractContract {
  protected airdropAddress: string;

  constructor(
    tronLink,
    tokenAddress,
    chainId
  ) {
    super(tronLink, TRC20_TOKEN_ABI, tokenAddress);
    this.airdropAddress = TRON_AIRDROP_ADDRESSES[chainId];
  }


  public async getBalance(): Promise<any> {
    return this.contract.balanceOf(this.walletAddress).call();
  }


  public async getAllowance(): Promise<string> {
    return this.contract.allowance(this.walletAddress, this.airdropAddress).call();
  }


  public sendApprove(amount): Promise<string> {
    return this.contract.approve(this.airdropAddress, amount)
      .send({
        from: this.walletAddress
      });
  }

}
