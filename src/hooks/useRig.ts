import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { MULTICALL_ADDRESS, MULTICALL_ABI, RIG_ADDRESS, type RigState } from '../config/contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export function useRig() {
  const { address } = useAccount();

  // Always fetch rig data (use zero address if not connected)
  const { data: rigData, refetch, isLoading } = useReadContract({
    address: MULTICALL_ADDRESS,
    abi: MULTICALL_ABI,
    functionName: 'getRig',
    args: [RIG_ADDRESS, address ?? ZERO_ADDRESS],
    query: {
      refetchInterval: 5000,
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
    
    console.log('Mining with:', {
      rig: RIG_ADDRESS,
      epochId: state.epochId,
      deadline,
      maxPrice,
      value: state.price,
    });
    
    try {
      writeContract({
        address: MULTICALL_ADDRESS,
        abi: MULTICALL_ABI,
        functionName: 'mine',
        args: [RIG_ADDRESS, state.epochId, deadline, maxPrice, epochUri],
        value: state.price,
      });
    } catch (err) {
      console.error('Mine error:', err);
    }
  };

  // Log any write errors
  if (writeError) {
    console.error('Write contract error:', writeError);
  }

  const getTimer = () => {
    if (!state) return '00:00';
    const now = BigInt(Math.floor(Date.now() / 1000));
    const elapsed = now - state.epochStartTime;
    const remaining = Math.max(0, 3600 - Number(elapsed));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return {
    state,
    isLoading,
    refetch,
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
