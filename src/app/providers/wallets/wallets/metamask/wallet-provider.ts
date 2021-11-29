import {Observable} from 'rxjs';
import Web3 from 'web3';
import {InterfaceAccount} from '../../wallets';
import {TokenContract} from './token-contract';
import {AirdropContract} from './airdrop-contract';

export class MetaMaskService {
  private metaMaskWeb3: any;
  private metaMaskProvider;
  public connectedAccount: InterfaceAccount;
  public subscribers = [];

  constructor() {
    this.setMetaMaskWeb3();
  }


  private setMetaMaskWeb3(): void {
    this.metaMaskWeb3 = (window as any).ethereum;
    if (this.metaMaskWeb3 && (this.metaMaskWeb3.isMetaMask || this.metaMaskWeb3.isTrust)) {
      (window as any).ethereum.autoRefreshOnNetworkChange = false;
    }
    this.metaMaskProvider = Web3.givenProvider;
  }

  public getConnectedAccount(): Promise<InterfaceAccount> {
    return new Promise((resolve) => {
      if (this.isConnected()) {
        if (this.metaMaskWeb3.selectedAddress || this.metaMaskWeb3.address) {
          this.applyAccount().then(() => {
            resolve(this.connectedAccount);
          });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  private applyAccount(): Promise<InterfaceAccount> {
    return this.metaMaskWeb3.request({method: 'net_version'}).then((result) => {
      const address =
        this.metaMaskWeb3.selectedAddress ||
        this.metaMaskWeb3.address ||
        (this.metaMaskWeb3.accounts ? this.metaMaskWeb3.accounts[0] : false);
      if (address) {
        this.connectedAccount = {
          address,
          chainId: Number(result)
        };
      } else {
        this.connectedAccount = undefined;
      }
    });
  }

  private callAllSubscribers(): void {
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  private iniEventsHandlers(): void {
    const applyAccount = (a?) => {
      this.applyAccount().then(() => {
        this.callAllSubscribers();
      });
    };
    this.metaMaskWeb3.on('chainChanged', applyAccount);
    this.metaMaskWeb3.on('accountsChanged', applyAccount);
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.subscribers.push(observer);
      observer.next(this.connectedAccount);
      this.iniEventsHandlers();
      return {
        unsubscribe: () => {
          this.metaMaskWeb3.removeAllListeners();
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
    return this.metaMaskWeb3 && this.metaMaskWeb3.isMetaMask;
  }

  static get isTrust(): boolean {
    const metaMaskWeb3 = (window as any).ethereum;
    return metaMaskWeb3 && metaMaskWeb3.isTrust;
  }

  public isConnected(): boolean {
    return this.metaMaskWeb3 &&
      (this.metaMaskWeb3.isMetaMask || this.metaMaskWeb3.isTrust) &&
      (this.metaMaskWeb3.selectedAddress || this.metaMaskWeb3.address ||
        (this.metaMaskWeb3.accounts ? this.metaMaskWeb3.accounts[0] : false));
  }

  public connect(killOldConnection?): Promise<any> {
    return new Promise((resolve, reject) => {

      const isConnected = this.isConnected();

      if (isConnected) {
        if (killOldConnection) {
          this.metaMaskWeb3.request({
            method: 'wallet_requestPermissions',
            params: [{eth_accounts: {}}],
          }).then(() => {
            resolve(null);
          }, () => {
            reject({});
          });
        } else {
          resolve(null);
        }
        return;
      }

      this.metaMaskWeb3.request({ method: 'eth_requestAccounts' }).then(() => {
        resolve(null);
      }, () => {
        reject({});
      });
    });
  }

  public getTokenContract(tokenAddress): any {
    return new TokenContract(this.metaMaskProvider, tokenAddress);
  }

  public getAirdropContract(): any {
    return new AirdropContract(this.metaMaskProvider);
  }

  public async getBalance(): Promise<any> {
    const web3 = new Web3(this.metaMaskProvider);
    return web3.eth.getBalance(this.connectedAccount.address);
  }
}
