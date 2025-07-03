# Fund Manager Web Interface

A simple web interface for interacting with the FundManager smart contract to transfer USDC (or other ERC20 tokens) on Ethereum and EVM-compatible blockchains.

## Features

- 🔗 Connect MetaMask wallet
- 💸 Transfer USDC/ERC20 tokens using the FundManager contract
- 🎯 Configurable token decimals (USDC: 6, ETH/most ERC20: 18)
- � Multi-chain support (Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism)
- 📱 Responsive design for mobile and desktop
- 🔍 Transaction tracking with block explorer links
- ⚡ Real-time transaction status updates
- 💰 Contract balance checking

## Prerequisites

- MetaMask browser extension installed
- Some ETH (or native token) for gas fees
- The FundManager contract address deployed on your chosen network

## How to Use

1. **Open the Application**
   - Simply open `index.html` in your web browser
   - No server or build process required!

2. **Connect Your Wallet**
   - Click the "Connect Wallet" button
   - Approve the connection in MetaMask
   - Your wallet address and network will be displayed

3. **Transfer Funds**
   - Enter the FundManager contract address
   - Enter the recipient's address
   - Enter the amount (in USDC or your token's units)
   - Select the correct token decimals (USDC = 6, most tokens = 18)
   - (Optional) Expand "Advanced Options" to send ETH with the transaction
   - Click "Transfer Funds"
   - Confirm the transaction in MetaMask

4. **Track Your Transaction**
   - Transaction hash will be displayed with a link to the block explorer
   - Status updates will show when the transaction is confirmed

## Smart Contract Interface

The application interacts with contracts implementing this interface:

```solidity
interface FundManager {
    function transferFunds(
        address recipient,
        uint256 amount
    ) external;
}
```

## Supported Networks

- Ethereum Mainnet & Testnets (Goerli, Sepolia)
- Polygon (Matic) Mainnet & Mumbai Testnet
- Binance Smart Chain Mainnet & Testnet
- Avalanche C-Chain Mainnet & Fuji Testnet
- Arbitrum One & Arbitrum Goerli
- Optimism Mainnet & Goerli

## Security Considerations

- Always verify the contract address before interacting
- Double-check recipient addresses before sending funds
- Ensure you're connected to the correct network
- **IMPORTANT**: Select the correct decimals for your token (USDC = 6, not 18)
- The `amount` parameter is converted to the token's smallest unit
- Some contracts may require ETH to be sent with the transaction (use Advanced Options)
- The contract must have approval to spend the token (usually set by contract owner)

## Technical Details

- Built with vanilla JavaScript and ethers.js v5
- No framework dependencies
- Responsive CSS design
- Client-side only (no backend required)

## Troubleshooting

**"Please install MetaMask"**
- Install the MetaMask browser extension from [metamask.io](https://metamask.io)

**"Invalid contract address"**
- Ensure the contract address starts with "0x" and is 42 characters long
- Verify the contract is deployed on the selected network

**"Transaction reverted"**
- Check that the contract has sufficient USDC/token balance
- Verify you have permission to call the transferFunds function
- **Ensure you selected the correct decimals (USDC = 6)**
- Ensure the amount doesn't exceed the contract's balance
- The contract needs approval to spend USDC (set by contract owner)
- Try sending ETH with the transaction using Advanced Options (some contracts require this)
- Check if the contract is paused or has other restrictions
- The recipient might be blacklisted on the token contract

## License

MIT