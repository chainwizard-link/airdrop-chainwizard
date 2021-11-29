import {Observable} from 'rxjs';
import {InterfaceAccount} from '../../wallets';
import {TokenContract} from './token-contract';
import {AirdropContract} from './airdrop-contract';


const CHAIN_IDS = {
  'https://api.trongrid.io': 'tron:mainnet',
  'https://api.trostack.io': 'tron:mainnet',
  'https://api.shasta.trongrid.io': 'tron:shasta',
  'https://api.nileex.io': 'tron:nileex',
  'https://testhttpapi.tronex.io': 'tron:tronextest'
};

export class TronLinkService {
  private tronLink: any;
  public connectedAccount: InterfaceAccount;
  public subscribers = [];

  constructor() {}


  public getConnectedAccount(): Promise<InterfaceAccount> {
    return new Promise((resolve) => {
      const applyTronWeb = () => {
        if (this.isConnected()) {
          this.applyAccount();
          resolve(this.connectedAccount);
        } else {
          resolve(null);
        }
      };
      applyTronWeb();
    });
  }

  private applyAccount(): void {
    const address = this.tronLink.defaultAddress.base58;
    const chainId = CHAIN_IDS[this.tronLink.fullNode.host];
    this.connectedAccount = {
      address,
      chainId
    };
  }

  private callAllSubscribers(): void {
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  private iniEventsHandlers(): void {
    this.tronLink.on('addressChanged', (a) => {
      const newAddress = this.tronLink.defaultAddress.base58;
      const newChainId = CHAIN_IDS[this.tronLink.fullNode.host];
      if (this.connectedAccount.address !== newAddress || this.connectedAccount.chainId !== newChainId) {
        this.applyAccount();
        this.callAllSubscribers();
      }
    });
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.subscribers.push(observer);
      observer.next(this.connectedAccount);
      this.iniEventsHandlers();
      return {
        unsubscribe: () => {
          this.tronLink.removeAllListeners();
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
    this.tronLink = (window as any).tronWeb;
    return !!this.tronLink;
  }

  public isConnected(): boolean {
    return this.isAvailable && !!this.tronLink.defaultAddress.base58;
  }

  public connect(killOldConnection?): Promise<any> {
    return new Promise((resolve, reject) => {
      const isConnected = this.isConnected();
      if (isConnected) {
        resolve(null);
      } else {
        const error = {
          type: -1,
          msg: ''
        };
        if (this.isAvailable) {
          error.type = 1;
          error.msg = 'Log in to Tron Link';
        }
        reject(error);
      }
    });
  }


  public getTokenContract(tokenAddress): any {
    return new TokenContract(this.tronLink, tokenAddress, this.connectedAccount.chainId);
  }

  public getAirdropContract(): any {
    return new AirdropContract(this.tronLink, this.connectedAccount.chainId);
  }

}
