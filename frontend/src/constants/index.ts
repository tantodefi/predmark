import { marketAbi } from './marketAbi';
import { lsp7Abi } from './lsp7Abi';
import { DIA_PRICE_FEEDS, DIA_ADAPTERS, CONTRACTS, LUKSO_NETWORKS } from './contracts';

export const marketAddress = '0x4E581D6a88bc7D60D092673904d961B6b0961A40' as `0x${string}`;
export const tokenAddress = '0x8653F395983827E05A6625eED4D045e696980D16' as `0x${string}`;
export const diaOracleAddress = CONTRACTS.LUKSO_MAINNET.DIA_ORACLE as `0x${string}`;

export { 
  marketAbi, 
  lsp7Abi, 
  DIA_PRICE_FEEDS, 
  DIA_ADAPTERS, 
  CONTRACTS, 
  LUKSO_NETWORKS 
};
