import Web3 from 'web3';
import { WALLETS_NETWORKS } from '../../constants/networks';
import BigNumber from 'bignumber.js';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const BINANCE_MIN_GAS_PRICE = 5;
const gasPricePercentage = 0.1;

interface ResponseFormatIterface {
  safe: string,
  average: string,
  fast: string
}

export class AbstractContract {
  protected contract;
  protected web3 = new Web3();
  protected walletAddress;
  private httpClient;

  constructor(
    protected binanceChain,
    private contractABI,
    protected contractAddress
  ) {
    this.contractAddress = contractAddress;
  }


  protected decodeMethod(methodName, params): any {
    const abiElement = this.contractABI.find((abiItem) => {
      return abiItem.name === methodName;
    });
    return this.web3.eth.abi.encodeFunctionCall(abiElement, params);
  }


  protected callMethod(walletAddress, methodName, params): Promise<any> {
    const data = this.decodeMethod(methodName, params);
    return this.binanceChain.request({
      method: 'eth_call',
      params: [{
        to: this.contractAddress,
        data,
      }]

    });
  }

  protected sendMethod(walletAddress, methodName, params, value?, gasPrice?, gas?, hashFunc?): Promise<any> {
    const data = this.decodeMethod(methodName, params);
    return this.binanceChain.request({
      method: 'eth_sendTransaction',
      params: [{
        to: this.contractAddress,
        from: walletAddress,
        value,
        gasPrice,
        gas,
        data,
      }]
    }).then((result) => {
      if (hashFunc) {
        hashFunc(result);
      }
      return this.checkTransaction(result);
    }, (err) => {
      console.log(err);
      return err;
    });
  }

  private checkTx(txHash, resolve, reject): void {
    return this.binanceChain.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    }).then((res) => {
      if (!res) {
        setTimeout(() => {
          this.checkTx(txHash, resolve, reject);
        }, 2000);
      } else if (res && res.blockNumber) {
        !res.status ? reject() : resolve(res);
      }
    }, (err) => {
      reject(err);
    });
  }

  public checkTransaction(txHash): Promise<any> {
    return new Promise((resolve, reject) => {
      this.checkTx(txHash, resolve, reject);
    });
  }

  protected async getBlock(): Promise<any> {
    return this.binanceChain.request({
      method: 'eth_blockNumber',
      params: []
    }).then((blockNumber) => {
      return this.binanceChain.request({
        method: 'eth_getBlockByNumber',
        params: [blockNumber, false]
      });
    });
  }

  protected async estimateGas(params): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const promise = this.binanceChain.request({
          method: 'eth_estimateGas',
          params
        }).then(resolve, reject);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });

  }

  public async getGasPrice(): Promise<any> {
    const chainParams = WALLETS_NETWORKS[+this.binanceChain.chainId];

    const apis = chainParams.apis;

    if (chainParams.chain === 'binance') {

      const gasPrice = +(await this.web3.eth.getGasPrice());
      return [gasPrice * (1 - gasPricePercentage), gasPrice, gasPrice * (1 + gasPricePercentage)];

    } else if (chainParams.chain === 'ethereum') {

      let apiUrl;

      if (chainParams.name === 'Ethereum Mainnet') {
        apiUrl = 'https://api.etherscan.io/';
      }

      if (chainParams.name === 'Ethereum Kovan Testnet') {
        apiUrl = 'https://api-kovan.etherscan.io/';
      }

      const apikey = chainParams.apiKey.name + '=' + chainParams.apiKey.value;
      return this.httpClient.get(apiUrl + '/api?module=gastracker&action=gasoracle&' + apikey).toPromise().then((data) => {
        const result = data.result;
        return [
          new BigNumber(result.SafeGasPrice).times(Math.pow(10, 9)).toString(10),
          new BigNumber(result.ProposeGasPrice).times(Math.pow(10, 9)).toString(10),
          new BigNumber(result.FastGasPrice).times(Math.pow(10, 9)).toString(10)
        ];
      });

    } else {

      const requests = apis.reduce((acc, req) => {

        let requestUrl = `${req.url}?`;

        for (let param in req.params) {
          requestUrl += `${param}=${req.params[param]}&`
        }

        return [
          ...acc,
          this.httpClient.get(requestUrl).pipe(
            map((gasPrices: { result: ResponseFormatIterface } | ResponseFormatIterface) => {

              let multiplier = req.multiplier;

              if ('result' in gasPrices && typeof gasPrices.result === 'string') {

                if (multiplier) {

                  return {
                    safe: new BigNumber(gasPrices.result).times(Math.pow(10, multiplier).toString(10)),
                    average: new BigNumber(gasPrices.result).times(Math.pow(10, multiplier).toString(10)),
                    fast: new BigNumber(gasPrices.result).times(Math.pow(10, multiplier).toString(10)),
                  }

                }

                return {
                  safe: new BigNumber(gasPrices.result).toString(10),
                  average: new BigNumber(gasPrices.result).toString(10),
                  fast: new BigNumber(gasPrices.result).toString(10)
                }
              }

              if ('result' in gasPrices) {

                if (multiplier) {
                  return {
                    safe: new BigNumber(gasPrices.result[req.responseFormat['result'].safe]).times(Math.pow(10, multiplier).toString(10)),
                    average: new BigNumber(gasPrices.result[req.responseFormat['result'].average]).times(Math.pow(10, multiplier).toString(10)),
                    fast: new BigNumber(gasPrices.result[req.responseFormat['result'].fast]).times(Math.pow(10, multiplier).toString(10)),
                  }
                }

                return {
                  safe: new BigNumber(gasPrices.result[req.responseFormat['result'].safe]).toString(10),
                  average: new BigNumber(gasPrices.result[req.responseFormat['result'].average]).toString(10),
                  fast: new BigNumber(gasPrices.result[req.responseFormat['result'].fast]).toString(10)
                }
              }

              if (multiplier) {
                return {
                  safe: new BigNumber(gasPrices[req.responseFormat.safe]).times(Math.pow(10, multiplier).toString(10)),
                  average: new BigNumber(gasPrices[req.responseFormat.average]).times(Math.pow(10, multiplier).toString(10)),
                  fast: new BigNumber(gasPrices[req.responseFormat.fast]).times(Math.pow(10, multiplier).toString(10)),
                }
              }

              return {
                safe: new BigNumber(gasPrices[req.responseFormat.safe]).toString(10),
                average: new BigNumber(gasPrices[req.responseFormat.average]).toString(10),
                fast: new BigNumber(gasPrices[req.responseFormat.fast]).toString(10)
              }

            }),
            catchError((e) => of(null))
          )
        ]
      }, [])

      return forkJoin(requests).toPromise().then((_gasPrices: { safe: string, average: string, fast: string }[]) => {

        const gasPrices = _gasPrices.filter(v => v);

        const TO_GWEI = 1000000000;

        const slowDeviation = this.getDeviation(gasPrices.map(prices => +prices.safe / TO_GWEI));
        const avgDeviation = this.getDeviation(gasPrices.map(prices => +prices.average / TO_GWEI));
        const fastDeviation = this.getDeviation(gasPrices.map(prices => +prices.fast / TO_GWEI));

        const slowGas = this.getGas(gasPrices.map(prices => +prices.safe / TO_GWEI), slowDeviation);
        const avgGas = this.getGas(gasPrices.map(prices => +prices.average / TO_GWEI), avgDeviation);
        const fastGas = this.getGas(gasPrices.map(prices => +prices.fast / TO_GWEI), fastDeviation);

        if (this.isBinance(chainParams.chain)) {

          const minBinanceGas = new BigNumber(BINANCE_MIN_GAS_PRICE).times(Math.pow(10, 9).toString());

          return [
            slowGas < BINANCE_MIN_GAS_PRICE ? minBinanceGas : new BigNumber(slowGas).times(Math.pow(10, 9).toString(10)),
            avgGas < BINANCE_MIN_GAS_PRICE ? minBinanceGas : new BigNumber(slowGas).times(Math.pow(10, 9).toString(10)),
            fastGas < BINANCE_MIN_GAS_PRICE ? minBinanceGas : new BigNumber(slowGas).times(Math.pow(10, 9).toString(10)),
          ]
        }

        return [
          new BigNumber(slowGas).times(Math.pow(10, 9)).toString(10),
          new BigNumber(avgGas).times(Math.pow(10, 9)).toString(10),
          new BigNumber(fastGas).times(Math.pow(10, 9)).toString(10)
        ]

      })
    }

  }

  private getDeviation(gasPrices: number[]) {

    let average = 0;
    let deviation = 0;

    for (let price of gasPrices) {
      average += price;
    }

    average = average / gasPrices.length;

    for (let price of gasPrices) {
      deviation += Math.pow((price - average), 2);
    }

    return Math.sqrt(deviation / (gasPrices.length - 1));

  }

  private getGas(gasPrices: number[], deviation: number) {

    const MAX_ALLOWED_DEVIATION = 10;
    const MAX_ALLOWED_DIFF = 20;

    if (deviation === 0) {
      return gasPrices[0];
    }

    if (deviation <= MAX_ALLOWED_DEVIATION) {
      return Math.round(gasPrices.reduce((acc, price) => acc + price, 0) / gasPrices.length);
    }

    const sorted = gasPrices.sort((a, b) => a - b);
    let cleanData = [];

    for (let i = 0; i < sorted.length - 1; i++) {

      if ((sorted[i] - sorted[i + 1]) < MAX_ALLOWED_DIFF) {
        cleanData = [
          ...cleanData,
          sorted[i]
        ]
      }

    }

    return Math.round(cleanData.reduce((acc, price) => acc + price, 0) / gasPrices.length);

  }

  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }

  public isBinance(chain: string): boolean {
    return chain === 'binance';
  }

}
