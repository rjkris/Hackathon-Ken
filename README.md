# Hackathon-Ken
```

constructor(address _governer)
```
### governance
```
newCarbonSeason(uint _supply)
addIssurers(address[] calldata _issuers)
```

### issuers
```
uploadCertificate(address company, int quota, string calldata ipfs)
```

### company
```
claimCarbon(uint amount)
useCarbon(uint amount)
```
### swap
```
makeOrder(uint amount)
cancelOrder(uint index)
buyCarbon(uint index)
```

## Getting Started 
```bash
# Install project's dependencies
yarn install

# Start Hardhat Network
yarn chain

# Deploy contract
yarn deploy

# Start Server
yarn dev
```