import {MetaMaskService} from '../wallets/metamask/wallet-provider';
import {WalletConnectService} from '../wallets/walletconnect/wallet-provider';
import {BinanceSCService} from '../wallets/binancesc/wallet-provider';
import {TronLinkService} from '../wallets/tronlink/wallet-provider';

export const WALLETS = [
  {
    icon: './assets/images/icons/wallets/metamask.svg',
    name: 'MetaMask',
    service: new MetaMaskService(),
    type: 'metamask',
    blockchains: [
      'ethereum:mainnet',
      'ethereum:testnet',
      'binance:mainnet',
      'binance:testnet',
      'polygon:mainnet',
      'polygon:testnet'
    ]
  }, {
    icon: './assets/images/icons/wallets/wallet-connect.svg',
    name: 'Wallet Connect',
    service: new WalletConnectService(),
    type: 'walletconnect',
    blockchains: [
      'ethereum:mainnet',
      'ethereum:testnet',
      'binance:mainnet',
      'binance:testnet',
      'polygon:mainnet',
      'polygon:testnet'
    ]
  }, {
    icon: './assets/images/icons/wallets/binance.svg',
    name: 'Binance',
    service: new BinanceSCService(),
    type: 'binance',
    blockchains: [
      'ethereum:mainnet',
      'binance:mainnet',
      'binance:testnet',
    ]
  }, {
    icon: './assets/images/icons/wallets/tronlink.png',
    name: 'TronLink',
    service: new TronLinkService(),
    type: 'tronlink',
    blockchains: [
      'tron:mainnet',
      'tron:testnet'
    ]
  }
];
