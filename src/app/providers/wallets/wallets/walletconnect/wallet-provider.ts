import WalletConnectProvider from '@walletconnect/web3-provider';
import {Observable} from 'rxjs';
import {InterfaceAccount} from '../../wallets';
import {WalletConnectTokenContract as TokenContract} from './token-contract';
import {WalletConnectAirdropContract as AirdropContract} from './airdrop-contract';
import Web3 from 'web3';

export class WalletConnectService {

  constructor(
  ) {
    this.web3 = new Web3();
  }


  get isAvailable(): boolean {
    return true;
  }
  private connectedAccount: InterfaceAccount;
  private provider;
  private connector;
  private subscribers = [];

  private web3;

  private killSession: any;

  private getProvider(): any {
    return new WalletConnectProvider({
      infuraId: '9cf8f565468b4ff2b0a6bf474150b007',
      rpc: {
        56: 'https://bsc-dataseed1.binance.org',
        97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
      },
      bridge: 'https://bridge.walletconnect.org'
    });
  }

  private createProvider(): void {
    if (this.provider) {
      this.provider.removeAllListeners();
      this.provider = false;
    }
    this.provider = this.getProvider();
    this.web3.setProvider(this.provider);
    this.iniEventsHandlers();
  }

  public async getConnectedAccount(): Promise<InterfaceAccount> {
    return new Promise(async (resolve) => {
      if (this.provider && this.provider.connector.connected) {
        this.provider.enable();
        await this.applyAccount();
      } else {
        this.connectedAccount = null;
      }
      resolve(this.connectedAccount);
    });
  }

  private async applyAccount(): Promise<any> {
    const address = this.provider.connector.accounts[0];
    const chainId = this.provider.connector.chainId;
    if (!this.provider.connector.connected || !address) {
      this.connectedAccount = undefined;
    } else {
      this.connectedAccount = {address, chainId};
    }
    this.callAllSubscribers();
  }

  private callAllSubscribers(): void {
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  private applyHandler(): any {
    return () => {
      this.applyAccount();
    };
  }

  private iniEventsHandlers(): void {
    this.provider.on('chainChanged', this.applyHandler());
    this.provider.on('accountsChanged', this.applyHandler());
    this.provider.on('connect', this.applyHandler());
    this.provider.on('disconnect', this.applyHandler());
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.subscribers.push(observer);
      observer.next(this.connectedAccount);
      return {
        unsubscribe: () => {
          this.provider.removeAllListeners();
          if (this.killSession) {
            this.killSession();
          }
          this.subscribers = this.subscribers.filter((obs) => {
            return obs !== observer;
          });
        },
      };
    }).subscribe((acc) => {
      cb(acc);
    });
  }

  public isConnected(): boolean {
    const provider = this.getProvider();
    if (provider && provider.connector.connected) {
      return true;
    }
  }

  private async connectWalletProvider(chainId, resolve): Promise<any> {
    this.provider.connector.createSession({chainId});
    this.killSession = () => {
      this.provider.connector.killSession({});
    };
    this.provider.connector.on('connect', async () => {
      await this.provider.enable();
      await this.applyAccount();
      return resolve(null);
    });
  }

  public async connect(killOldConnection, chainId): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.isConnected()) {
        this.createProvider();
        this.connectWalletProvider(chainId, resolve);
      } else {
        if (!killOldConnection) {
          if (!this.provider) {
            this.createProvider();
            this.killSession = () => {
              this.provider.connector.killSession({});
            };
            await this.provider.enable();
          }
          await this.applyAccount();
          return resolve(null);
        } else {
          const oldProvider = this.provider;
          oldProvider.removeListener('disconnect', this.applyHandler);
          this.killSession = false;
          oldProvider.on('disconnect', async () => {
            await this.applyAccount();
            this.createProvider();
            this.connectWalletProvider(chainId, resolve);
          });
          this.provider.connector.killSession({});
        }
      }
    });
  }

  public getTokenContract(tokenAddress): any {
    return new TokenContract(this.provider, tokenAddress);
  }

  public getAirdropContract(): any {
    return new AirdropContract(this.provider);
  }

}
