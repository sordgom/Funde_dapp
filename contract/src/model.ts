export const STORAGE_COST: bigint = BigInt("1000000000000000000000")

// Data structure for the contract
export class Campaign {
  id: string = "0";
  title: string = "";
  description: string = "";
  // Creator of campaign
  creator: string = "";
  // Total amount of funds raised
  goal: number = 0;
  //Total amount pledged
  pledged: number = 0;
  // Timestamp of start of campaign
  startAt: number = 0;  
  // Timestamp of end of campaign
  endAt: number = 0;
  // True if goal was reached and creator has claimed the tokens.
  claimed: boolean = false;
  tier_1: number = 0;
  tier_2: number = 0;
  tier_3: number = 0;
}

