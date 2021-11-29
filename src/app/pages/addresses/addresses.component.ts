import {Component, OnDestroy, OnInit} from '@angular/core';
import {AirdropParamsInterface} from '../prepare/prepare.component';
import {Router} from '@angular/router';
import {BlockchainsProvider} from '../../providers/blockchains/blockchains';
import {ValidationErrors} from '@angular/forms';
import BigNumber from 'bignumber.js';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModalMessageComponent} from '../../components/modal-message/modal-message.component';
import {WalletsProvider} from '../../providers/wallets/wallets';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit, OnDestroy {

  private addressesErrorsModal: MatDialogRef<any>;

  public errorsMessages = {
    1: 'Empty address',
    2: 'Invalid address',
    3: 'Empty amount',
    4: 'Invalid amount value',
    5: 'Invalid amount decimals'
  };

  public totalAmount = '';

  public airdropParams: AirdropParamsInterface;
  public addressesList: {
    address: string;
    amount: string;
    line: number;
  }[];

  public visibleValidTable = false;
  public visibleInValidTable = true;

  public tableData = {
    valid: [],
    invalid: []
  };

  public addressValidator: ValidationErrors;

  public chainInfo: any;

  constructor(
    private router: Router,
    private blockchainsProvider: BlockchainsProvider,
    private dialog: MatDialog,
    private walletsProvider: WalletsProvider
  ) {
    const storageAirdropParams = localStorage.getItem('proceedAirdrop');
    this.airdropParams = storageAirdropParams ? JSON.parse(storageAirdropParams) : false;

    this.walletsProvider.setNetwork(
      this.airdropParams.blockchain,
      this.airdropParams.testnet
    );

    const airdropState = localStorage.getItem('airdropState');

    if (!(this.airdropParams && airdropState)) {
      this.router.navigate(['']);
      return;
    }

    this.blockchainsProvider.setChain(this.airdropParams.blockchain);
    this.blockchainsProvider.setTestnet(this.airdropParams.testnet);
    this.chainInfo = this.blockchainsProvider.getChainInfo();

    this.validateAddressesList();
    this.addressValidator = this.blockchainsProvider.addressFieldValidator;

  }




  private validateAddressesList(): void {

    this.addressesList = this.airdropParams.addresses.reduce((tableData, oneTableItem, index) => {

      const errors = [];

      const {address, amount} = oneTableItem;

      const isValidAddress = this.blockchainsProvider.isAddress(address);
      if (isValidAddress) {
        oneTableItem.address = '0x' + address.toLowerCase().replace(/^0x/, '');
      }

      const isNanAmount = isNaN(amount) || +amount === 0;
      const correctDecimals = (amount.split('.')[1] || '').length <= +this.airdropParams.token.decimals;
      const isValidAmount = !isNanAmount && correctDecimals;

      const isValidItem = isValidAddress && isValidAmount;

      if (isValidItem) {
        tableData.valid.push(oneTableItem);
      } else {
        if (!isValidAddress) {
          if (!address) {
            errors.push(1);
          } else {
            errors.push(2);
          }
        }

        if (!isValidAmount) {
          if (!amount || +amount === 0) {
            errors.push(3);
          } else if (isNanAmount) {
            errors.push(4);
          } else if (!correctDecimals) {
            errors.push(5);
          }
        }
        oneTableItem.errors = errors;
        tableData.invalid.push(oneTableItem);
      }

      return tableData;

    }, this.tableData);

    this.calculateTotalTokensAmount();
  }

  public applyAddressItem(addressItem): void {
    const nextItem = this.tableData.valid.find((oneItem) => {
      return oneItem.line > addressItem.line;
    });
    if (nextItem) {
      const nextItemIndex = this.tableData.valid.indexOf(nextItem);
      this.tableData.valid.splice(nextItemIndex, 0, addressItem);
    } else {
      this.tableData.valid.push(addressItem);
    }
    this.tableData.valid = [...this.tableData.valid];
    addressItem.errors = null;
    this.deleteInvalidItem(addressItem);
  }


  public deleteAllErrors(): void {
    this.airdropParams.addresses = this.airdropParams.addresses.filter((oneItem) => {
      const isInValid = this.tableData.invalid.indexOf(oneItem) > -1;
      return !isInValid;
    });
    this.tableData.invalid = [];
    this.airdropParams.changed = true;
    this.updateAirdropParams();
  }

  public deleteInvalidItem(item, fromBaseList?): void {
    this.tableData.invalid = this.tableData.invalid.filter((oneItem) => {
      return oneItem !== item;
    });

    if (fromBaseList) {
      this.airdropParams.addresses = this.airdropParams.addresses.filter((oneItem) => {
        return oneItem !== item;
      });
    }
    this.airdropParams.changed = true;
    this.updateAirdropParams();
  }

  ngOnInit(): void {}

  private updateAirdropParams(): void {
    this.calculateTotalTokensAmount();
    localStorage.setItem('proceedAirdrop', JSON.stringify(this.airdropParams));
  }

  ngOnDestroy(): void {}

  private calculateTotalTokensAmount(): void {
    const totalAmountBN = this.tableData.valid.reduce((val, item) => {
      if (item.amount && !isNaN(item.amount)) {
        return val.plus(item.amount);
      } else {
        return val;
      }
    }, new BigNumber(0));
    this.totalAmount = totalAmountBN.toString(10);
  }

  private showAddressesError(): void {
    let errorText = 'All errors must be corrected and/or removed';
    let errorTitle = 'File errors';

    if (!this.tableData.valid.length) {
      errorText = 'List is empty, load another list';
      errorTitle = 'File errors';
    }

    this.addressesErrorsModal = this.dialog.open(ModalMessageComponent, {
      width: '372px',
      panelClass: 'custom-dialog-container',
      data: {
        title: errorTitle,
        text: errorText,
        buttonText: 'Ok'
      }
    });
  }

  private goToSubmit(): void {
    this.airdropParams.totalAmount = this.totalAmount;
    localStorage.setItem('proceedAirdrop', JSON.stringify(this.airdropParams));
    localStorage.setItem('airdropState', '2');
    this.router.navigate(['submit']);
  }


  public approveToken(): void {

    if (this.tableData.invalid.length || !this.tableData.valid.length) {
      this.showAddressesError();
      return;
    }
    this.goToSubmit();
  }
}

