import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js'
import { assert } from './utils'
import { Campaign, STORAGE_COST } from './model'

@NearBindgen({})
class CampaignContract {
  beneficiary: string = "";
  pledges = new UnorderedMap<bigint>('map-uid-1');
  campaigns = new UnorderedMap<Campaign>('Campaigns');
  count : number = 0;
  
  @initialize({})
  init({ beneficiary }: { beneficiary: string }) {
    this.beneficiary = beneficiary
  }

  @call({})
  launch({ title, description, goal, startAt, endAt, tier_1, tier_2, tier_3 } : 
    { title: string, description :string, goal: number, startAt: number, endAt: number, tier_1: number, tier_2: number, tier_3: number}) {
    this.campaigns.set(
      this.count.toString(), 
      { 
        id: this.count.toString(),
        title: title,
        description: description,
        creator: near.predecessorAccountId(),
        goal: goal,
        pledged: 0,
        startAt: startAt,
        endAt: endAt,
        claimed: false,
        tier_1: tier_1,
        tier_2: tier_2,
        tier_3: tier_3,
      });
    this.count++;
  }

  @call({})
  cancel({ id }: { id: number}) {
    const campaign = this.campaigns.get(id.toString());
    // assert(campaign.creator == near.predecessorAccountId(), "Only the creator can cancel the campaign");
    // assert(campaign.pledged == 0, "Cannot cancel a campaign with pledges");
    this.campaigns.remove(id.toString());
  }

  @call({ payableFunction: true })
  pledge({ id }: { id: number}) {
    const campaign = this.campaigns.get(id.toString());
    let beneficiary = campaign.creator;

    // assert(beneficiary != near.predecessorAccountId(), "You cannot pledge to your own campaign");
    // assert(campaign.startAt < Date.now(), "Campaign has not started yet");
    // assert(campaign.endAt > Date.now(), "Campaign has ended");
    // assert(campaign.goal > campaign.pledged, "Campaign has reached its goal");

    // Get who is calling the method and how much $NEAR they attached
    let donor = near.predecessorAccountId();
    let campaignAmount: bigint = near.attachedDeposit() as bigint;

    let donatedSoFar = this.pledges.get(donor, {defaultValue: BigInt(0)})
    let toTransfer = campaignAmount;

    // This is the user's first campaign, lets register it, which increases storage
    if (donatedSoFar == BigInt(0)) {
      assert(campaignAmount > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);

      // Subtract the storage cost to the amount to transfer
      toTransfer -= STORAGE_COST
    }

    // Persist in storage the amount donated so far
    donatedSoFar += campaignAmount
    this.pledges.set(donor, donatedSoFar)
    campaign.pledged += Number(donatedSoFar);
    this.campaigns.set(id.toString(),campaign);
    near.log(`Thank you ${donor} for donating ${campaignAmount}! You donated a total of ${donatedSoFar}`);

    // Send the money to the beneficiary
    const promise = near.promiseBatchCreate(beneficiary)
    near.promiseBatchActionTransfer(promise, toTransfer)

    // Return the total amount donated so far
    return donatedSoFar.toString()
  }

  @call({})
  unpledge({ id }: { id: number}) {

    assert(this.campaigns.get(id.toString()) != null, "Campaign does not exist");
    const campaign = this.campaigns.get(id.toString());

    assert(campaign.pledged > 0, "Campaign has no pledges");
    assert(campaign.claimed == false, "Campaign has been claimed");

    let donor = near.predecessorAccountId();
    let donatedSoFar = this.pledges.get(donor, {defaultValue: BigInt(0)});

    assert(donatedSoFar > BigInt(0), "You haven't donated anything yet");
   
    this.pledges.set(donor, BigInt(0));

    campaign.pledged = 0;
    this.campaigns.set(id.toString(),campaign);

    near.log(`You unpledged ${donatedSoFar}!`);

    // Send the money to the beneficiary
    const promise = near.promiseBatchCreate(donor)
    near.promiseBatchActionTransfer(promise, donatedSoFar)

    return donatedSoFar.toString()
  }

  @call({})
  claim({ id }: { id: number}) {
    assert(this.campaigns.get(id.toString()) != null, "Campaign does not exist");
    const campaign = this.campaigns.get(id.toString());
    let donor = near.predecessorAccountId();
    let beneficiary = campaign.creator;
    let goal = campaign.goal;

    // assert(donor == campaign.creator, "Only the creator can claim the campaign");
    // assert(campaign.pledged > 0, "Campaign has no pledges");
    // assert(campaign.pledged >= campaign.goal, "Campaign has not reached its goal");
    // assert(campaign.claimed == false, "Campaign has been claimed");
    // assert(campaign.endAt < Date.now(), "Campaign has not ended yet");

    campaign.claimed  = true;
    this.campaigns.set(id.toString(),campaign);
    this.pledges.set(donor, BigInt(0));

    near.log(`You claimed ${goal}!`);
    // Send the money to the beneficiary
    const promise = near.promiseBatchCreate(beneficiary)
    near.promiseBatchActionTransfer(promise, goal)

    return goal.toString()
  }

  @call({})
  refund({ id }: { id: number}) {
    assert(this.campaigns.get(id.toString()) != null, "Campaign does not exist");
    const campaign = this.campaigns.get(id.toString());
    let donor = near.predecessorAccountId();
    let donatedSoFar = this.pledges.get(donor, {defaultValue: BigInt(0)})

    // assert(campaign.pledged > 0, "Campaign has no pledges");
    // assert(campaign.pledged > campaign.goal, "Campaign has not reached its goal");
    // assert(campaign.claimed == false, "Campaign has been claimed");
    // assert(campaign.endAt < Date.now(), "Campaign has not ended yet");
    // assert(donatedSoFar > BigInt(0), "You haven't donated anything yet");

    this.campaigns.set(id.toString(),campaign);
    this.pledges.set(donor, BigInt(0));

    near.log(`You claimed ${donatedSoFar}!`);
    // Send the money to the beneficiary
    const promise = near.promiseBatchCreate(donor)
    near.promiseBatchActionTransfer(promise, donatedSoFar)

    return donatedSoFar.toString()
  }


  @call({ privateFunction: true })
  change_beneficiary(beneficiary) {
    this.beneficiary = beneficiary;
  }

  @view({})
  get_beneficiary(): string { return this.beneficiary }

  @view({})
  number_of_pledgers(): number { return this.pledges.length }

  @view({})
  get_counter(): number { return this.count }

  @view({})
  get_campaigns({ from_index = 0, limit = 50 }: { from_index: number, limit: number }): Campaign[] {
    let ret: Campaign[] = []
    let end = Math.min(limit, this.campaigns.length)
    for (let i = from_index; i < end; i++) {
      const counter: string = this.campaigns.keys.get(i) as string
      const account_id = this.campaigns.get(counter).creator
      const pledgedAmount = this.pledges.get(account_id)
      const campaign: Campaign = this.get_campaign_for_account({ count: counter, creator: account_id })
      ret.push(campaign)
    }
    return ret
  }

  @view({})
  get_campaign_for_account({ count, creator }: { count: string, creator: string}): Campaign {
    return {
      id: this.campaigns.get(count).id,
      title: this.campaigns.get(count).title,
      description: this.campaigns.get(count).description,
      creator: creator,
      pledged: this.campaigns.get(count).pledged, 
      goal: this.campaigns.get(count).goal,
      startAt: this.campaigns.get(count).startAt,
      endAt: this.campaigns.get(count).endAt,
      claimed: this.campaigns.get(count).claimed,
      tier_1: this.campaigns.get(count).tier_1,
      tier_2: this.campaigns.get(count).tier_2,
      tier_3: this.campaigns.get(count).tier_3,
    }
  }
}