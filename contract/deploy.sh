#!/bin/bash

source ../.env

# build the contract
npm run build

# deploy the contract
near deploy --accountId $CONTRACT_ID --wasmFile build/contract.wasm