import { Observable } from 'rxjs';
import { InterfaceAccount } from '../../wallets';
// import { BscConnector } from '@binance-chain/bsc-connector';
import { TokenContract } from './token-contract';
import { AirdropContract } from './airdrop-contract';

// const bsc = new BscConnector({
//   supportedChainIds: [56, 97, 1] // later on 1 ethereum mainnet and 3 ethereum ropsten will be supported
// });


export class BinanceSCService {

  private binanceChain: any;
  private isConnectedState: boolean;

  public connectedAccount: InterfaceAccount;
  public subscribers = [];

  constructor() { }

  public getConnectedAccount(): Promise<InterfaceAccount> {
    return new Promise(async (resolve) => {
      const isConnected = await this.isConnected();
      if (isConnected) {
        this.iniEventsHandlers();
        resolve(this.connectedAccount);
      } else {
        resolve(null);
      }
    });
  }

  private async applyAccount(): Promise<InterfaceAccount> {
    let chainId = await this.binanceChain.request({ method: 'net_version' });
    const chainIdFirefox = await this.binanceChain.request({ method: 'eth_chainId' });
    if (chainIdFirefox === 'Binance-Chain-Ganges') {
      chainId = 97;
    } else if (chainIdFirefox === 'Binance-Chain-Tigris') {
      chainId = 56;
    } else if (chainIdFirefox === '0x38' || chainIdFirefox === '0x61') {
      chainId = +chainIdFirefox;
    }

    const addresses = await this.binanceChain.request({ method: 'eth_requestAccounts' });
    const address = addresses ? addresses[0] : false;

    return new Promise((resolve) => {
      if (address) {
        this.connectedAccount = {
          address,
          chainId: Number(chainId),
        };
      } else {
        this.connectedAccount = undefined;
      }
      resolve(null);
    });
  }

  private callAllSubscribers(): void {
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  private iniEventsHandlers(): void {
    const applyAccount = () => {
      this.applyAccount().then(() => {
        this.callAllSubscribers();
      });
    };
    if (!this.isConnectedState) {
      this.binanceChain.on('chainChanged', applyAccount);
      this.binanceChain.on('accountsChanged', applyAccount);
      this.binanceChain.on('disconnect', applyAccount);
      this.isConnectedState = true;
    }
    applyAccount();
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.subscribers.push(observer);
      return {
        unsubscribe: () => {
          this.subscribers = this.subscribers.filter((obs) => {
            return obs !== observer;
          });
        },
      };
    }).subscribe((acc) => {
      cb(acc);
    });
  }

  get isAvailable(): boolean {
    this.binanceChain = (window as any).BinanceChain;
    return !!this.binanceChain;
  }

  public async isConnected(): Promise<boolean> {
    return this.isAvailable && !!this.connectedAccount;
  }

  public connect(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.binanceChain.on('connect', () => {
        this.iniEventsHandlers();
        resolve(null);
      });
    });
  }


  public getTokenContract(tokenAddress): any {
    return new TokenContract(this.binanceChain, tokenAddress);
  }

  public getAirdropContract(): any {
    return new AirdropContract(this.binanceChain);
  }

  public async getBalance(): Promise<any> {
    return this.binanceChain.request({
      method: 'eth_getBalance',
      params: [this.connectedAccount.address]
    });
  }

}
