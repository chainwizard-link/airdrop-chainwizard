import {TRON_AIRDROP_ABI, TRON_AIRDROP_ADDRESSES} from '../../constants/contracts/tron-airdrop';
import {AbstractContract} from './abstract-contract';


export class AirdropContract extends AbstractContract {
  constructor(
    tronLink,
    chainId
  ) {
    const airdropAddress = TRON_AIRDROP_ADDRESSES[chainId];
    super(tronLink, TRON_AIRDROP_ABI, airdropAddress);
  }


  public async getFee(): Promise<any> {
    return this.contract.fee().call();
  }


  private async gasLimit(): Promise<any> {
    const block = await this.tronLink.trx.getCurrentBlock();
    console.log(this.tronLink);
    console.log(this.tronLink.trx);
    console.log(block);
    // return (await this.web3.eth.getBlock('latest')).gasLimit;
  }

  public async tokensMultiSendGas(testTokenAddress): Promise<any> {
    const addressesLengthTest = 500;
    const fee = await this.getFee();
    const blockGasLimit = await this.gasLimit();


    const accounts = Array(addressesLengthTest).fill(null);
    const promises = [];
    let index = -1;
    for (const address of accounts) {
      index++;
      if ((index !== 0) && (index !== (addressesLengthTest - 1))) {
        continue;
      }
      const addressesArray = Array(index + 1);
      addressesArray.fill(this.tronLink.createAccount);
      const addresses = await Promise.all(addressesArray.map(async (creator) => {
        const account = await creator();
        return account.address.base58;
      }));

      const amountsArray = Array(addresses.length);
      amountsArray.fill('1');

      const tx = this.contract.multisendToken(
        testTokenAddress,
        addresses,
        amountsArray,
        amountsArray.length.toString(10)
      );
      console.log(tx);
      tx.send({
        callValue: fee
      });

      // const data = tx.encodeABI();
      // // console.trace();
      // console.log('Fee: ', fee);
      // console.log('walletAddress: ', this.walletAddress);
      // console.log('contractAddress: ', this.contractAddress);

      // promises.push(
      //   this.web3.eth.estimateGas({
      //     from: this.walletAddress,
      //     to: this.contractAddress,
      //     value: fee,
      //     data
      //   })
      // );
    }
    //
    //
    // return new Promise((resolve, reject) => {
    //   Promise.all(promises).then((result) => {
    //     if (!result[0] || !result[1]) {
    //       return reject();
    //     }
    //     const oneAddressAdding = (result[1] - result[0]) / (addressesLengthTest - 1);
    //     const initTransaction = result[0] - oneAddressAdding;
    //     const maxAddressesLength = Math.floor((blockGasLimit - initTransaction) / oneAddressAdding) - 1;
    //
    //     // console.log('Latest block gas limit:', blockGasLimit);
    //     // console.log('Gas limit per address:', oneAddressAdding);
    //     // console.log('Gas limit of first address:', initTransaction);
    //     // console.log('Max addresses length per tx:', maxAddressesLength);
    //
    //     resolve({
    //       maxAddressesLength,
    //       gasLimitPerAddress: oneAddressAdding,
    //       gasLimitForFirstAddress: result[0]
    //     });
    //   }, reject);
    // });

  }

}



