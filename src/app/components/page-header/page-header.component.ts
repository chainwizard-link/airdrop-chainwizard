import {Component, OnDestroy, OnInit} from '@angular/core';
import {WALLETS_NETWORKS} from '../../providers/wallets/constants/networks';
import {InterfaceAccount, WalletsProvider} from '../../providers/wallets/wallets';
import {MatDialog} from '@angular/material/dialog';
import {BlockchainsProvider} from '../../providers/blockchains/blockchains';
import {ModalWalletsComponent} from '../modal-wallets/modal-wallets';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  public currentAccount: InterfaceAccount|false;
  public networks = WALLETS_NETWORKS;
  private walletSubscriber;
  private blockchainSubscriber;
  private chainInfo;

  constructor(
    private walletsProvider: WalletsProvider,
    private dialog: MatDialog,
    private blockchainsProvider: BlockchainsProvider
  ) {
  }

  ngOnInit(): void {
    this.walletSubscriber = this.walletsProvider.subscribe((account: InterfaceAccount) => {
      this.currentAccount = account || false;
      if (this.chainInfo) {
        this.walletsProvider.validateWallet(this.chainInfo.chainId);
      }
    });
    this.blockchainSubscriber = this.blockchainsProvider.subscribe((state) => {
      this.chainInfo = state.chainParams;
    });
  }

  ngOnDestroy(): void {
    if (this.walletSubscriber) {
      this.walletSubscriber.unsubscribe();
      this.blockchainSubscriber.unsubscribe();
    }
  }

  public selectWallet(): void {
    const availableWallets = this.walletsProvider.getWallets();
    const chooseWalletModal = this.dialog.open(ModalWalletsComponent, {
      data: {
        onSelectWallet: (wallet) => {
          this.walletsProvider.connect(wallet.type, this.chainInfo.chainId);
          chooseWalletModal.close();
        },
        wallets: availableWallets,
      },
    });
  }



}
