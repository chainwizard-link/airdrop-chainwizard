import {AbstractContract} from './abstract-contract';
import {ERC20_TOKEN_ABI} from '../../constants/contracts/erc20-token';
import {ETHEREUM_AIRDROP_ADDRESSES} from '../../constants/contracts/ethereum-airdrop';
import {ModalMessageComponent} from '../../../../components/modal-message/modal-message.component';

export class TokenContract extends AbstractContract {
  protected airdropAddress: string;

  constructor(
    web3Provider,
    tokenAddress
  ) {
    super(web3Provider, ERC20_TOKEN_ABI, tokenAddress);
    this.airdropAddress = ETHEREUM_AIRDROP_ADDRESSES[+web3Provider.chainId];
  }

  public async getAllowance(): Promise<string> {
    return this.contract.methods
      .allowance(this.walletAddress, this.airdropAddress)
      .call()
      .then((result) => {
        return result;
      });
  }
  public async owner(): Promise<any> {
    return this.contract.methods
      .owner()
      .call()
      .then((result) => {
        console.log('owner', result);
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public async excludeFromFee(): Promise<any> {
    return this.contract.methods
      .excludeFromFee(this.airdropAddress)
      .send({from: this.walletAddress, account: this.airdropAddress})
      .then((result) => {
        console.log(6969696, result);
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  }
  public async isExcludedFromFee(): Promise<any> {
    return this.contract.methods
      .isExcludedFromFee(this.airdropAddress)
      .call()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public sendApprove(amount): Promise<string> {
    let gasPrice;
    const chainId = +this.web3Provider.chainId;
    if (chainId === 56 || chainId === 97) {
      gasPrice = 20000000000;
    }
    const txSend = this.contract.methods
      .approve(this.airdropAddress, amount)
      .send({
        from: this.walletAddress,
        gasPrice
      });

    return new Promise((resolve, reject) => {
      txSend.once('transactionHash', (txHash) => {
        this.checkTransaction(txHash).then(resolve, reject);
      });
      txSend.catch((res) => {
        reject(res);
      });
    });

  }

  public async getBalance(): Promise<any> {
    return this.contract.methods.balanceOf(this.walletAddress).call();
  }

}
