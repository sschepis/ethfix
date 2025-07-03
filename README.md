# Fund Manager Web Interface

A simple web interface for interacting with the FundManager smart contract to transfer funds on Ethereum and EVM-compatible blockchains.

## Features

- 🔗 Connect MetaMask wallet
- 💸 Transfer funds using the FundManager contract
- 🌐 Multi-chain support (Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism)
- 📱 Responsive design for mobile and desktop
- 🔍 Transaction tracking with block explorer links
- ⚡ Real-time transaction status updates

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
   - Enter the amount in ETH (or native token)
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
- The `amount` parameter is in Wei (1 ETH = 10^18 Wei)

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
- Check that the contract has sufficient balance
- Verify you have permission to call the transferFunds function
- Ensure the amount doesn't exceed the contract's balance

## License

MIT