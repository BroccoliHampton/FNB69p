import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { MULTICALL_ADDRESS, MULTICALL_ABI, RIG_ADDRESS, type RigState } from '../config/contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export function useRig() {
  const { address } = useAccount();

  const { data: rigData, refetch, isLoading, error: readError, status } = useReadContract({
    address: MULTICALL_ADDRESS,
    abi: MULTICALL_ABI,
    functionName: 'getRig',
    args: [RIG_ADDRESS, address ?? ZERO_ADDRESS],
    query: {
      refetchInterval: 15000,
    },
  });

  const { writeContract, data: txHash, isPending: isMining, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const state = rigData as RigState | undefined;

  const mine = async (maxPriceEth: string = '0.1', epochUri: string = '') => {
    if (!state) {
      console.log('No state available');
      return;
    }
    if (!address) {
      console.log('No wallet connected');
      return;
    }
    
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    const maxPrice = parseEther(maxPriceEth);
    
    writeContract({
      address: MULTICALL_ADDRESS,
      abi: MULTICALL_ABI,
      functionName: 'mine',
      args: [RIG_ADDRESS, state.epochId, deadline, maxPrice, epochUri],
      value: state.price,
    });
  };

  // Count UP from zero (elapsed time)
  const getTimer = () => {
    if (!state) return '0m 00s';
    const now = BigInt(Math.floor(Date.now() / 1000));
    const elapsed = Math.max(0, Number(now - state.epochStartTime));
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return {
    state,
    isLoading,
    refetch,
    readError,
    status,
    epochId: state?.epochId ? Number(state.epochId) : 0,
    mineRate: state?.ups ? Number(state.ups) : 0,
    glazed: state?.glazed ? Number(state.glazed) : 0,
    price: state?.price ? formatEther(state.price) : '0',
    priceWei: state?.price ?? 0n,
    unitPrice: state?.unitPrice ? Number(state.unitPrice) / 1e18 : 0,
    miner: state?.miner ?? ZERO_ADDRESS,
    ethBalance: state?.ethBalance ? formatEther(state.ethBalance) : '0',
    wethBalance: state?.wethBalance ? formatEther(state.wethBalance) : '0',
    donutBalance: state?.donutBalance ? Number(state.donutBalance) / 1e18 : 0,
    unitBalance: state?.unitBalance ? Number(state.unitBalance) / 1e18 : 0,
    timer: getTimer(),
    epochStartTime: state?.epochStartTime ? Number(state.epochStartTime) : 0,
    epochUri: state?.epochUri ?? '',
    rigUri: state?.rigUri ?? '',
    mine,
    isMining: isMining || isConfirming,
    isConfirmed,
    txHash,
    writeError,
  };
}
