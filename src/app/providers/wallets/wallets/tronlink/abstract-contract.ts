import Web3 from 'web3';

export class AbstractContract {

  protected contract;
  protected web3 = new Web3();
  protected walletAddress;
  protected contractAddress;
  private httpClient;

  constructor(
    protected tronLink,
    contractABI,
    contractAddress
  ) {
    this.contractAddress = contractAddress;
    this.walletAddress = this.tronLink.defaultAddress.base58;
    this.contract = this.tronLink.contract(
      contractABI,
      this.contractAddress
    );
  }


  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }


}


