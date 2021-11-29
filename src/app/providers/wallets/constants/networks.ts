import {NETWORKS} from '../../blockchains/constants/networks';

const networksKeys = Object.keys(NETWORKS);

const networks = {};
for (const path of networksKeys) {
  networks[NETWORKS[path].chainId] = {...NETWORKS[path]};
}


export const WALLETS_NETWORKS = networks;
