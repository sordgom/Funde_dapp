## 1. Build and Deploy the Contract
You can automatically compile and deploy the contract in the NEAR testnet by running:

```bash
npm run deploy
```

Once finished, check the `neardev/dev-account` file to find the address in which the contract was deployed:

```bash
cat ./neardev/dev-account
# e.g. dev-1659899566943-21539992274727
```

The contract will be automatically initialized with a default `beneficiary`.

To initialize the contract yourself do:

```bash
# Use near-cli to initialize contract (optional)
near call <dev-account> init '{"beneficiary":"<account>"}' --accountId <dev-account>
```

<br />

## 2. Get Beneficiary
`beneficiary` is a read-only method (`view` method) that returns the beneficiary of the donations.

`View` methods can be called for **free** by anyone, even people **without a NEAR account**!

```bash
near view <dev-account> beneficiary
```

<br />

## 3. Get Number of Donations

`donate` forwards any attached money to the `beneficiary` while keeping track of it.

`donate` is a payable method for which can only be invoked using a NEAR account. The account needs to attach money and pay GAS for the transaction.

```bash
# Use near-cli to donate 1 NEAR
near call <dev-account> donate --amount 1 --accountId <account>
```

**Tip:** If you would like to `donate` using your own account, first login into NEAR using:

```bash
# Use near-cli to login your NEAR account
near login
```

and then use the logged account to sign the transaction: `--accountId <your-account>`.