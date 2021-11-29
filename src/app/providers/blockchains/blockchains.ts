import {Directive, Injectable, Injector, Input, Pipe, PipeTransform} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';

import {TronwebService} from './tronweb';
import {Web3Service} from './web3';
import {AbstractControl, NgControl} from '@angular/forms';
import BigNumber from 'bignumber.js';


@Injectable({
  providedIn: 'root',
})
export class BlockchainsProvider {

  private chains = {
    tron: this.tronwebService,
    ethereum: this.web3Service,
    binance: this.web3Service,
    polygon: this.web3Service
  };

  private activeChain: any;
  private state: {
    chain?: string;
    isTestnet?: boolean;
    isDeflationary?: boolean;
  } = {};

  private stateSubscribers: Subscriber<any>[] = [];

  constructor(
    private web3Service: Web3Service,
    private tronwebService: TronwebService
  ) {}

  public setChain(chain: string): void {

    if (this.state.chain === chain) {
      return;
    }
    this.state.chain = chain;
    this.activeChain = this.chains[chain];
    this.activeChain.setChain(chain);
    this.setTestnet(this.state.isTestnet);
    // this.setDeflationary(this.state.isDeflationary);
  }

  public setTestnet(testnet: boolean): void {
    this.state.isTestnet = !!testnet;
    if (this.activeChain) {
      this.activeChain.setTestnet(this.state.isTestnet);
      this.applyChainState();
    }
  }

  public setDeflationary(deflationary: boolean): void {
    this.state.isDeflationary = !!deflationary;
    if (this.activeChain) {
      this.activeChain.setDeflationary(this.state.isDeflationary);
      this.applyChainState();
    }
  }

  private getFullState(): any {
    return {
      state: this.state,
      chainParams: this.activeChain.getChainParams()
    };
  }

  private applyChainState(): void {
    const fullState = this.getFullState();
    this.stateSubscribers.forEach((obs) => {
      obs.next(fullState);
    });
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.stateSubscribers.push(observer);
      if (this.state.chain) {
        const fullState = this.getFullState();
        cb(fullState);
      }
      return {
        unsubscribe: () => {
          this.stateSubscribers = this.stateSubscribers.filter((obs) => {
            return obs !== observer;
          });
        },
      };
    }).subscribe((res) => {
      cb(res);
    });
  }

  public isAddress(address): boolean {
    return this.activeChain.addressValidator(address);
  }


  public addressFieldValidator = (control: AbstractControl) => {
    const address = control.value || '';
    if (!this.isAddress(address)) {
      return {
        invalidAddress: true
      };
    } else {
      return null;
    }
  }


  public tokenFieldValidator = (control: AbstractControl) => {
    return new Promise((resolve) => {
      const address = control.value ? control.value.address : '';
      if (!this.activeChain) {
        resolve(null);
      }

      if (!this.isAddress(address)) {
        return resolve({
          invalidAddress: true
        });
      }

      const tokenPath = `${this.state.chain}:${this.state.isTestnet ? 'testnet' : 'mainnet'}:${address}`;

      const setTokenValues = (tokenData) => {
        const tokenInfoKeys = Object.keys(tokenData);
        for (const k of tokenInfoKeys) {
          control.value[k] = tokenData[k];
        }
        return resolve(null);
      };

      const cachedToken = sessionStorage.getItem(tokenPath);

      if (cachedToken) {
        const parsedToken = JSON.parse(cachedToken);
        if (parsedToken === false) {
          return resolve({
            invalidContractAddress: true
          });
        }
        setTokenValues(parsedToken);
      }

      this.activeChain.getTokenInfo(address).then((tokenData) => {
        setTokenValues(tokenData);
        const tokenValue = {...control.value};
        sessionStorage.setItem(tokenPath, JSON.stringify(tokenValue));
      }, (e) => {
        sessionStorage.setItem(tokenPath, 'false');
        resolve({
          invalidContractAddress: true
        });
      });
    });
  }

  public getChainProvider(chain): any {
    return this.chains[chain];
  }

  public getChainInfo(): any {
    return this.activeChain.getChainParams();
  }

}





@Directive({
  selector: '[appAddressInput]'
})
export class AddressInputDirective {
  private control: NgControl;
  @Input() set validator(validator) {
    this.control.control.setValidators(validator);
  }

  constructor(
    private injector: Injector,
  ) {
    this.control = this.injector.get(NgControl);
  }
}


@Directive({
  selector: '[appTokenInput]'
})
export class TokenInputDirective {

  private control: NgControl;

  constructor(
    private injector: Injector,
    ) {

    this.control = this.injector.get(NgControl);
    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);

    this.control.valueAccessor.writeValue = (value) => originalWriteVal(this.maskValue(value));

    this.control.valueChanges.subscribe((result: any) => {

      if (typeof result === 'string') {
        this.control.control.setValue({
          address: result
        }, {
          emitEvent: false
        });
      } else if (!result) {
        this.control.control.setErrors({
          required: true
        });
      }
    });
  }

  private maskValue(value): string {
    return value ? value.address : '';
  }

}

@Directive({
  selector: '[appNumberInput]'
})
export class AmountInputDirective {

  private control: NgControl;
  private withEndDot;

  @Input() decimals;

  constructor(
    private injector: Injector,
  ) {

    this.control = this.injector.get(NgControl);

    const originalWriteVal = this.control.valueAccessor.writeValue.bind(this.control.valueAccessor);
    this.control.valueAccessor.writeValue = (value) => originalWriteVal(this.maskValue(value));

    this.control.valueChanges.subscribe((result: any) => {

      result = result || '';
      const value = result.replace(/,/g, '');

      const splitValue = value.split('.')[1];
      const decimalsSize = (value.split('.')[1] || '').length;
      this.withEndDot = typeof splitValue === 'string' && !decimalsSize ? '.' : '';


      if (isNaN(value) || !+value) {
        this.control.control.setErrors({
          numberFormat: true
        });
      } else if (decimalsSize > +this.decimals) {
        this.control.control.setErrors({
          decimalsError: true
        });
      } else if (!+value) {
        this.control.control.setErrors({
          required: true
        });
      } else {
        this.control.control.setErrors(null);
        this.control.control.setValue(value.replace(/\.$/, '') || '', {
          emitEvent: false
        });
      }
    });
  }

  private maskValue(v): string {
    if (v !== null && +v) {
      const value = v.replace(/,/g, '');
      if (!isNaN(value)) {
        const splitValue = value.split('.')[1];
        const decimalsSize = (splitValue || '').length;
        const val = new BigNumber(value);
        return val.toFormat(decimalsSize, {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) + this.withEndDot;
      } else {
        return v;
      }
    } else {
      return v;
    }
  }
}



@Pipe({ name: 'explorerUrl' })
export class ExplorerUrl implements PipeTransform {
  constructor(
    private blockchainsProvider: BlockchainsProvider
  ) {
  }
  transform(address, chain, isTestnet, addressType?): BigNumber {
    return this.blockchainsProvider.getChainProvider(chain).getExplorerLink(chain, isTestnet, address, addressType);
  }
}



@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value, decimals, round?): string | BigNumber {
    const formatNumberParams = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};
    const bigNumberValue = new BigNumber(value).div(Math.pow(10, decimals));
    if (bigNumberValue.isNaN()) {
      return value;
    }
    decimals = +decimals;
    return (round || decimals || (decimals === 0)) ? bigNumberValue.dp(round || decimals).toFormat(formatNumberParams) : '';
  }
}

