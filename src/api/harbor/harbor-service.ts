import { RawRecord } from '@nozbe/watermelondb';
import { BigNumber, ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { t } from 'i18next';
import moment from 'moment/moment';
import { UNSTAKE_LOG_ABI, HARBOR_ABI } from '@api/harbor/abi';
import Config from '@constants/config';
import { ILogs } from '@entities/harbor/model';
import { showCriticalError } from '@features/critical-error';
import { Cache, CacheKey } from '@lib/cache';
import {
  CustomAppEvents,
  sendFirebaseEvent
} from '@lib/firebaseEventAnalytics';

const harborErrorHandler = (e: any, functionName: string) => {
  console.error(`Error in ${functionName}:`, e);
  showCriticalError({
    title: t('critical.error.harbor.header'),
    message: t('critical.error.harbor.subheader')
  });
  throw e;
};

export function calculateAPR(
  interestNumber: number,
  interestPeriodNumber: number
) {
  const r = interestNumber / 1000000000;
  const periodsPerYear = ((365 * 24 * 60 * 60) / interestPeriodNumber) * r;

  return Math.ceil(periodsPerYear * 10000) / 100;
}

const provider = new ethers.providers.JsonRpcProvider(Config.NETWORK_URL);
const createSigner = (privateKey: string) => {
  return new ethers.Wallet(privateKey, provider);
};

export const createHarborLiquidStakedContract = (
  providerOrSigner: ethers.providers.JsonRpcProvider | ethers.Wallet = provider
) => {
  return new ethers.Contract(
    Config.LIQUID_STAKING_ADDRESS,
    HARBOR_ABI,
    providerOrSigner
  );
};

const getTotalStaked = async () => {
  try {
    const contract = new ethers.Contract(
      Config.ST_AMB_ADDRESS,
      HARBOR_ABI,
      provider
    );
    return await contract.totalSupply();
  } catch (e) {
    return harborErrorHandler(e, 'getTotalStaked');
  }
};

const getStakeAPR = async () => {
  try {
    const contract = createHarborLiquidStakedContract();
    const interest = await contract.interest();
    const interestPeriod = await contract.interestPeriod();
    return calculateAPR(Number(interest), Number(interestPeriod));
  } catch (e) {
    return harborErrorHandler(e, 'getStakeAPR');
  }
};

const getUserStaked = async (address: string) => {
  try {
    if (address) {
      const contract = createHarborLiquidStakedContract();
      return await contract.getStake(address);
    }
    return null;
  } catch (e) {
    return harborErrorHandler(e, 'getUserStaked');
  }
};

const getStakeLimit = async () => {
  try {
    const contract = createHarborLiquidStakedContract();
    return await contract.minStakeValue();
  } catch (e) {
    return harborErrorHandler(e, 'getStakeLimit');
  }
};

const getUnstakeLockTime = async () => {
  try {
    const contract = createHarborLiquidStakedContract();
    const data = await contract.unstakeLockTime();

    return {
      rate: '1 AMB = 1 stAMB',
      delay: (Number(data) / 86400).toFixed(0) || '0'
    };
  } catch (e) {
    return harborErrorHandler(e, 'getUnstakeLockTime');
  }
};

const getTier = async (address: string) => {
  try {
    const contract = new ethers.Contract(
      Config.STAKING_TIERS_ADDRESS,
      HARBOR_ABI,
      provider
    );
    const data = await contract.calculateTier(address);
    const value = Number(data);
    if (isNaN(value)) {
      return 1;
    }
    switch (true) {
      case value >= 100:
        return 4;
      case value >= 75:
        return 3;
      case value >= 50:
        return 2;
      case value >= 25:
        return 1;
      default:
        return 1;
    }
  } catch (e) {
    return harborErrorHandler(e, 'getTier');
  }
};

const getClaimAmount = async (address: string) => {
  try {
    const contract = createHarborLiquidStakedContract();
    return await contract.getClaimAmount(address);
  } catch (e) {
    return harborErrorHandler(e, 'getClaimAmount');
  }
};

const getWithdrawalRequests = async (address: string) => {
  try {
    const contract = new ethers.Contract(
      Config.LIQUID_STAKING_ADDRESS,
      UNSTAKE_LOG_ABI,
      provider
    );
    const filter = contract.filters.UnstakeLocked(address);
    const rawWithdrawalsList = await contract.queryFilter(filter);
    const withdrawalsList: ILogs[] = [];

    const formatData = (date: Date) => moment(date).format('DD/MM/YYYY  HH:mm');
    for (let i = 0; i < rawWithdrawalsList.length; i++) {
      const event: ethers.Event = rawWithdrawalsList[i];
      const { args } = event;

      const requestDateTime = new Date(Number(args?.creationTime) * 1000);
      const formattedRequestDateTime = formatData(requestDateTime);

      const unlockDateTime = new Date(Number(args?.unlockTime) * 1000);

      const formattedUnlockDateTime = formatData(unlockDateTime);
      const status = unlockDateTime < new Date() ? 'Success' : 'Pending';
      const amount = BigNumber.from(args?.amount);

      // add event to the beginning of the list to sort it from newest to oldest
      withdrawalsList.unshift({
        amount,
        tokenAddress: event.address,
        requestData: formattedRequestDateTime,
        unlockData: formattedUnlockDateTime,
        status
      });
    }

    return withdrawalsList.filter(
      (item) => item.tokenAddress === Config.LIQUID_STAKING_ADDRESS
    );
  } catch (e) {
    return harborErrorHandler(e, 'getWithdrawalRequests');
  }
};

const processStake = async (
  wallet: RawRecord | undefined,
  value: BigNumber,
  { estimateGas = false }: { estimateGas?: boolean } = {}
) => {
  try {
    if (wallet) {
      const privateKey = (await Cache.getItem(
        // @ts-ignore
        `${CacheKey.WalletPrivateKey}-${wallet.hash}`
      )) as string;
      const signer = createSigner(privateKey);

      const contract = createHarborLiquidStakedContract(signer);

      if (estimateGas) {
        return await contract.estimateGas.stake({ value });
      }

      sendFirebaseEvent(CustomAppEvents.harbor_amb_stake_start);
      const tx = await contract.stake({ value });

      if (tx) {
        const res = await tx.wait();
        if (res) {
          sendFirebaseEvent(CustomAppEvents.harbor_amb_stake_finish);
          return res;
        }
      }
    }
  } catch (e) {
    const errorMessage =
      (e as { message: string }).message || JSON.stringify(e);
    sendFirebaseEvent(CustomAppEvents.harbor_amb_stake_error, {
      harborAMBStakeError: errorMessage
    });
    return harborErrorHandler(e, 'processStake');
  }
};

const processWithdraw = async (
  wallet: RawRecord | undefined,
  amount: string,
  _desiredCoeff: number,
  { estimateGas = false }: { estimateGas?: boolean } = {}
) => {
  try {
    const privateKey = (await Cache.getItem(
      // @ts-ignore
      `${CacheKey.WalletPrivateKey}-${wallet.hash}`
    )) as string;
    const signer = createSigner(privateKey);
    const contract = createHarborLiquidStakedContract(signer);
    const desiredCoeff = _desiredCoeff * 100;

    if (estimateGas) {
      return await contract.estimateGas.unstake(
        parseEther(amount),
        desiredCoeff
      );
    }

    sendFirebaseEvent(CustomAppEvents.harbor_amb_withdraw_start);
    const tx = await contract.unstake(parseEther(amount), desiredCoeff);

    if (tx) {
      const res = await tx.wait();
      if (res) {
        sendFirebaseEvent(CustomAppEvents.harbor_amb_withdraw_finish);
        return res;
      }
    }
  } catch (e) {
    const errorMessage =
      (e as { message: string }).message || JSON.stringify(e);
    sendFirebaseEvent(CustomAppEvents.harbor_amb_withdraw_error, {
      harborAMBWithdrawError: errorMessage
    });
    return harborErrorHandler(e, 'processWithdraw');
  }
};

const processClaimReward = async (
  wallet: RawRecord | undefined,
  _desiredCoeff: number,
  { estimateGas = false }: { estimateGas?: boolean } = {}
) => {
  try {
    const privateKey = (await Cache.getItem(
      // @ts-ignore
      `${CacheKey.WalletPrivateKey}-${wallet.hash}`
    )) as string;
    const signer = createSigner(privateKey);

    const contract = createHarborLiquidStakedContract(signer);
    const desiredCoeff = _desiredCoeff * 100;

    if (estimateGas) {
      return await contract.estimateGas.claimRewards(desiredCoeff);
    }

    sendFirebaseEvent(CustomAppEvents.harbor_amb_claim_reward_start);
    const tx = await contract.claimRewards(desiredCoeff);

    if (tx) {
      const res = await tx.wait();
      if (res) {
        sendFirebaseEvent(CustomAppEvents.harbor_amb_claim_reward_finish);
        return res;
      }
    }
  } catch (e) {
    const errorMessage =
      (e as { message: string }).message || JSON.stringify(e);
    sendFirebaseEvent(CustomAppEvents.harbor_amb_claim_reward_error, {
      harborAMBClaimRewardError: errorMessage
    });
    return harborErrorHandler(e, 'processClaimReward');
  }
};

export const harborService = {
  getTotalStaked,
  getStakeAPR,
  getUserStaked,
  getStakeLimit,
  getUnstakeLockTime,
  getTier,
  getClaimAmount,
  getWithdrawalRequests,
  processStake,
  processWithdraw,
  processClaimReward,
  harborErrorHandler
};
