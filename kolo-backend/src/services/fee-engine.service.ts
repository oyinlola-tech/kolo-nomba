export class FeeEngineService {
  private readonly config: FeeConfig;

  constructor() {
    this.config = {
      contributionFeeRate: 0.01,
      payoutFeeRate: 0.005,
      flatFee: 0,
      minFee: 0,
      maxFee: 2000,
    };
  }

  calculateFee(amount: number): number {
    const percentageFee = Math.round(amount * this.config.contributionFeeRate);
    const totalFee = Math.max(percentageFee + this.config.flatFee, this.config.minFee);
    return Math.min(totalFee, this.config.maxFee);
  }

  getConfig(): FeeConfig {
    return { ...this.config };
  }
}

export interface FeeConfig {
  contributionFeeRate: number;
  payoutFeeRate: number;
  flatFee: number;
  minFee: number;
  maxFee: number;
}
