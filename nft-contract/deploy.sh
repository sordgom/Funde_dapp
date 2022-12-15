#!/bin/bash

source ../.env


# deploy the contract
near deploy --accountId $NFT_CONTRACT_ID --wasmFile build/nft.wasm