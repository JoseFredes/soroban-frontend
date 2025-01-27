import { useSorobanReact } from '@soroban-react/core';
import { useContractValue } from '@soroban-react/contracts';
import { Constants } from '../constants';
import {
  scvalToBigNumber,
  accountToScVal,
  contractIdToScVal,
} from '../utils';
import { formatAmount } from '../utils';
import { useTokens } from './useTokens';



export function useBalances() {
  const sorobanContext = useSorobanReact();
  let balancesBigNumber;
  if (sorobanContext.address) {
    const user = accountToScVal(sorobanContext.address);
 
    let balances = {
      userBalance_1: useContractValue({
        contractId: Constants.TokenId_1,
        method: 'balance',
        params: [user],
        sorobanContext: sorobanContext,
      }),

      userBalance_2: useContractValue({
        contractId: Constants.TokenId_2,
        method: 'balance',
        params: [user],
        sorobanContext: sorobanContext,
      }),
      liquidityPoolBalance_1: useContractValue({
        contractId: Constants.TokenId_1,
        method: 'balance',
        params: [contractIdToScVal(Constants.LiquidityPoolId)],
        sorobanContext: sorobanContext,
      }),

      liquidityPoolBalance_2: useContractValue({
        contractId: Constants.TokenId_2,
        method: 'balance',
        params: [contractIdToScVal(Constants.LiquidityPoolId)],
        sorobanContext: sorobanContext,
      }),
    };

    balancesBigNumber = {
      userBalance_1: scvalToBigNumber(balances.userBalance_1.result),
      userBalance_2: scvalToBigNumber(balances.userBalance_2.result),
      liquidityPoolBalance_1: scvalToBigNumber(
        balances.liquidityPoolBalance_1.result
      ),
      liquidityPoolBalance_2: scvalToBigNumber(
        balances.liquidityPoolBalance_2.result
      ),
    };
    return balancesBigNumber;
  } else {
    return undefined;
  }
}

export function tokenBalance(tokenAddress: string, userAddress?: string) {
  const sorobanContext = useSorobanReact();

  if (!sorobanContext.address) return;

  const address = userAddress ?? sorobanContext.address;

  const user = accountToScVal(address);

  let balances = {
    tokenBalance: useContractValue({
      contractId: tokenAddress,
      method: 'balance',
      params: [user],
      sorobanContext: sorobanContext,
    }),
  };

  const decimals = useContractValue({
    contractId: tokenAddress,
    method: 'decimals',
    sorobanContext: sorobanContext,
  });

  const tokenDecimals = decimals?.result && (decimals.result?.u32() ?? 7);

  const formatedBalance = formatAmount(
    scvalToBigNumber(balances.tokenBalance.result),
    tokenDecimals
  );

  return formatedBalance;
}

export function tokenBalances(userAddress: string) {
  const sorobanContext = useSorobanReact();

  if (!sorobanContext.address) return;

  const address = userAddress ?? sorobanContext.address;

  const tokens = useTokens(sorobanContext);

  const balances = tokens.map((token) => {
    return {
      balance: tokenBalance(token.token_address, address),
      symbol: token.token_symbol,
      address: token.token_address,
    };
  });

  return balances;
}
