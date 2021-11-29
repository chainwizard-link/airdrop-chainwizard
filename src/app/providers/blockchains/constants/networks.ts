export const NETWORKS = {
  'ethereum:mainnet': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 1,
    coin: 'ETH',
    etherscanAPI: 'https://api.etherscan.io/',
    apiKey: {
      name: 'apikey',
      value: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
    },
    apis: [
      {
        url: 'https://api.etherscan.io/api',
        params: {
          module: 'gastracker',
          action: 'gasoracle',
          apikey: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
        },
        responseFormat: {
          result: {
            safe: 'SafeGasPrice',
            average: 'ProposeGasPrice',
            fast: 'FastGasPrice'
          }
        },
        multiplier: 9
      },
      {
        url: 'https://api.etherscan.io/api',
        params: {
          module: 'proxy',
          action: 'eth_gasPrice',
          apikey: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
        },
        responseFormat: {
          safe: 'result',
          average: 'result',
          fast: 'result'
        },
        multiplier: null
      },
      {
        url: 'https://ethgasstation.info/json/ethgasAPI.json',
        params: {
          "api-key": '0f005e0fd3072a3d8480a1f3d694607b5192a2d5ef4e9e67444d572aae03'
        },
        responseFormat: {
          safe: 'safeLow',
          average: 'average',
          fast: 'fast'
        },
        multiplier: 8
      }
    ]
  },
  'ethereum:ropsten': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Ropsten Testnet',
    explorer: 'https://ropsten.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 3,
    coin: 'rETH'
  },
  'ethereum:rinkeby': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Rinkeby Testnet',
    explorer: 'https://rinkeby.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 4,
    coin: 'rETH'
  },
  'ethereum:kovan': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Kovan Testnet',
    explorer: 'https://kovan.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 42,
    coin: 'kETH',
    etherscanAPI: 'https://api-kovan.etherscan.io/',
    apiKey: {
      name: 'apikey',
      value: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
    },
    apis: [
      {
        url: 'https://api-kovan.etherscan.io/api',
        params: {
          module: 'gastracker',
          action: 'gasoracle',
          apikey: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
        },
        responseFormat: {
          result: {
            safe: 'SafeGasPrice',
            average: 'ProposeGasPrice',
            fast: 'FastGasPrice'
          }
        },
        multiplier: 9
      },
      {
        url: 'https://api-kovan.etherscan.io/api',
        params: {
          module: 'proxy',
          action: 'eth_gasPrice',
          apikey: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
        },
        responseFormat: {
          safe: 'result',
          average: 'result',
          fast: 'result'
        },
        multiplier: null
      },
    ]
  },
  'ethereum:goerli': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Goerli Testnet',
    explorer: 'https://goerli.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 5,
    coin: 'gETH'
  },
  'binance:mainnet': {
    chain: 'binance',
    icon: './assets/images/icons/coins/binance.svg',
    name: 'Binance Smart Chain Mainnet',
    explorer: 'https://bscscan.com',
    csvExample: './assets/csv-examples/binance.csv',
    chainId: 56,
    coin: 'BNB',
    // apis: [
    //   {
    //     url: 'https://api.bscscan.com/api',
    //     params: {
    //       module: 'proxy',
    //       action: 'eth_gasPrice',
    //       apikey: 'DKJ7CFIZ14QC9RZ4SJ5ZYD3YQAKJ5D6WED'
    //     },
    //     responseFormat: {
    //       safe: 'result',
    //       average: 'result',
    //       fast: 'result'
    //     },
    //     multiplier: null
    //   },
    //   {
    //     url: 'https://bscgas.info/gas',
    //     params: null,
    //     responseFormat: {
    //       safe: 'slow',
    //       average: 'standard',
    //       fast: 'fast'
    //     },
    //     multiplier: 9
    //   }
    // ]
  },
  'binance:testnet': {
    chain: 'binance',
    icon: './assets/images/icons/coins/binance.svg',
    name: 'Binance Smart Chain Testnet',
    explorer: 'https://testnet.bscscan.com',
    csvExample: './assets/csv-examples/binance.csv',
    chainId: 97,
    coin: 'tBNB',
    // apis: [
    //   {
    //     url: 'https://api-testnet.bscscan.com/api',
    //     params: {
    //       module: 'proxy',
    //       action: 'eth_gasPrice',
    //       apikey: 'DKJ7CFIZ14QC9RZ4SJ5ZYD3YQAKJ5D6WED'
    //     },
    //     responseFormat: {
    //       safe: 'result',
    //       average: 'result',
    //       fast: 'result'
    //     },
    //     multiplier: null
    //   },
    //   {
    //     url: 'https://bscgas.info/gas',
    //     params: null,
    //     responseFormat: {
    //       safe: 'slow',
    //       average: 'standard',
    //       fast: 'fast'
    //     },
    //     multiplier: 9
    //   }
    // ]
  },
  'tron:mainnet': {
    chain: 'tron',
    icon: './assets/images/icons/coins/tron.svg',
    name: 'TRON Mainnet',
    explorer: 'https://tronscan.org/',
    csvExample: './assets/csv-examples/tron.csv',
    chainId: 'tron:mainnet',
    coin: 'TRON'
  },
  'tron:shasta': {
    chain: 'tron',
    icon: './assets/images/icons/coins/tron.svg',
    name: 'TRON Shasta Testnet',
    explorer: 'https://shasta.tronscan.org',
    csvExample: './assets/csv-examples/tron.csv',
    chainId: 'tron:shasta',
    coin: 'sTRON'
  },
  'polygon:mainnet': {
    chain: 'polygon',
    icon: './assets/images/icons/coins/polygon.svg',
    name: 'Polygon Mainnet',
    explorer: 'https://polygonscan.com',
    csvExample: './assets/csv-examples/polygon.csv',
    chainId: 137,
    coin: 'MATIC',
    apis: [
      {
        url: 'https://gasstation-mainnet.matic.network/',
        params: null,
        responseFormat: {
          safe: 'safeLow',
          average: 'standard',
          fast: 'fast'
        },
        multiplier: 9
      },
      {
        url: 'https://polygongasstation.com/api/gas_overview',
        params: null,
        responseFormat: {
          safe: 'safeLow',
          average: 'standard',
          fast: 'fast'
        },
        multiplier: 9
      },
      {
        url: 'https://api.polygonscan.com/api',
        params: {
          module: 'proxy',
          action: 'eth_gasPrice',
          apikey: 'MTG1UGK2SCNNMYFSAPJTU8YPZSQCZU841Q'
        },
        responseFormat: {
          safe: 'result',
          average: 'result',
          fast: 'result'
        },
        multiplier: null
      }
    ]
  },
  'polygon:testnet': {
    chain: 'polygon',
    icon: './assets/images/icons/coins/polygon.svg',
    name: 'Polygon Mumbai Testnet',
    explorer: 'https://mumbai.polygonscan.com/',
    csvExample: './assets/csv-examples/polygon.csv',
    chainId: 80001,
    coin: 'MATIC',
    apis: [
      {
        url: 'https://gasstation-mumbai.matic.today/',
        params: null,
        responseFormat: {
          safe: 'safeLow',
          average: 'standard',
          fast: 'fast'
        },
        multiplier: 9
      },
      {
        url: 'https://polygongasstation.com/api/gas_overview',
        params: null,
        responseFormat: {
          safe: 'safeLow',
          average: 'standard',
          fast: 'fast'
        },
        multiplier: 9
      },
      {
        url: 'https://api-testnet.polygonscan.com/api',
        params: {
          module: 'proxy',
          action: 'eth_gasPrice',
          apikey: 'MTG1UGK2SCNNMYFSAPJTU8YPZSQCZU841Q'
        },
        responseFormat: {
          safe: 'result',
          average: 'result',
          fast: 'result'
        },
        multiplier: null
      }
    ]
  }
};

