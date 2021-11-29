import {Injectable, NgZone} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {MetaMaskService} from './wallets/metamask/wallet-provider';
import {WALLETS} from './constants/wallets';
import {WALLETS_NETWORKS} from './constants/networks';
import {HttpClient} from '@angular/common/http';

export interface InterfaceAccount {
  chainInfo?: any;
  wallet?: string;
  shortAddress?: string;
  address: string;
  chainId: number|string;
  icon?: string;
  name?: string;
  valid?: boolean|undefined;
}

@Injectable({
  providedIn: 'root',
})
export class WalletsProvider {
  private account: InterfaceAccount | false;
  private walletService;
  public walletsTypes = WALLETS;
  private accountsSubscribers: any[] = [];
  private walletServicesSubscription: Subscription;

  private selectedNetwork: string;

  constructor(
    private ngZone: NgZone,
    private httpClient: HttpClient
  ) {}

  public setNetwork(blockchain, isTestnet): void {
    this.selectedNetwork = `${blockchain}:${isTestnet ? 'testnet' : 'mainnet'}`;
    this.checkConnectedWallet();
  }

  public getWallets(): any {
    return this.walletsTypes.filter((oneWallet) => {
      if (this.selectedNetwork) {
        return oneWallet.blockchains.indexOf(this.selectedNetwork) > -1;
      } else {
        return true;
      }
    }).map((oneWallet) => {
      const {icon, name, type} = oneWallet;
      const isAvailable = oneWallet.service.isAvailable;
      return {icon, name, type, isAvailable};
    });
  }


  public subscribe(cb): any {
    return new Observable((observer) => {
      this.accountsSubscribers.push(observer);
      cb(this.account);
      return {
        unsubscribe: () => {
          this.accountsSubscribers = this.accountsSubscribers.filter((obs) => {
            return obs !== observer;
          });
        },
      };
    }).subscribe((res) => {
      cb(res);
    });
  }

  private setAccount(account, wallet): void {
    if (account) {
      this.account = {...account as InterfaceAccount};
      this.account.wallet = wallet.type;
      this.account.icon = wallet.icon;
      this.account.name = wallet.name;
      this.account.shortAddress = this.account.address.replace(/(^.{6}).+(.{4})$/, '$1...$2');
      this.account.chainInfo = WALLETS_NETWORKS[account.chainId];
      this.walletService = wallet.service;

    } else {
      this.account = undefined;
      if (this.walletServicesSubscription) {
        this.walletServicesSubscription.unsubscribe();
      }
      this.checkConnectedWallet();
    }
    this.applyAccount();
  }

  private applyAccount(): void {
    this.ngZone.run(() => {
      this.accountsSubscribers.forEach((obs) => {
        obs.next(this.account);
      });
    });
  }

  private checkConnectedWallet(): void {
    const connectedAccounts = [];
    const walletsPromises = [];

    const connectedWallet = this.walletsTypes.find((oneWallet) => {
      if (!this.account) {
        return false;
      }
      return oneWallet.type === this.account.wallet && oneWallet.blockchains.indexOf(this.selectedNetwork) > -1;
    });

    const checkWallets = connectedWallet ? [connectedWallet] : this.walletsTypes.filter((oneWallet) => {
      if (this.selectedNetwork) {
        return oneWallet.blockchains.indexOf(this.selectedNetwork) > -1;
      } else {
        return true;
      }
    });

    checkWallets.forEach((wallet) => {
      walletsPromises.push(wallet.service.getConnectedAccount());
    });

    Promise.all(walletsPromises).then((result) => {
      result.forEach((account, walletIndex) => {
        if (account) {
          connectedAccounts.push({
            account,
            wallet: checkWallets[walletIndex],
          });
        }
      });
      if (connectedAccounts.length) {
        this.setSubscriber(connectedAccounts[0].wallet);
      }
    });
  }

  private setSubscriber(wallet): void {
    if (this.walletServicesSubscription) {
      this.walletServicesSubscription.unsubscribe();
    }
    this.walletServicesSubscription = wallet.service.subscribe((acc) => {
      this.setAccount(acc, wallet);
    });
  }

  public validateWallet(chainId): void {
    if (this.account) {
      this.account.valid = chainId === this.account.chainId;
    }
  }

  private connectToService(wallet, chainId): void {
    const isCurrent = this.account && this.account.wallet === wallet.type;

    wallet.service.connect(isCurrent, chainId).then(() => {
      if (!(this.account && this.account.wallet === wallet.type)) {
        this.setSubscriber(wallet);
      }
    }, () => {});
  }


  public connect(walletType: string, chainId): void {
    const wallet = this.walletsTypes.find((w) => {
      return walletType === w.type;
    });
    this.connectToService(wallet, chainId);
  }


  get isDApp(): boolean {
    return MetaMaskService.isTrust;
  }


  public getTokenContract(tokenAddress): any {
    const contract = this.walletService.getTokenContract(tokenAddress);
    contract.setHttpClient(this.httpClient);
    return contract;
  }

  public getAirdropContract(): any {
    const contract = this.walletService.getAirdropContract();
    contract.setHttpClient(this.httpClient);
    return contract;
  }

  public async getBalance(): Promise<any> {
    return this.walletService.getBalance();
  }

}
