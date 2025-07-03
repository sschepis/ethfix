// Contract ABI for the FundManager interface
const FUND_MANAGER_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Global variables
let provider;
let signer;
let contract;
let userAddress;

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const networkName = document.getElementById('networkName');
const transferForm = document.getElementById('transferForm');
const contractAddressInput = document.getElementById('contractAddress');
const recipientAddressInput = document.getElementById('recipientAddress');
const amountInput = document.getElementById('amount');
const ethValueInput = document.getElementById('ethValue');
const tokenDecimalsSelect = document.getElementById('tokenDecimals');
const customDecimalsInput = document.getElementById('customDecimals');
const statusDiv = document.getElementById('status');
const txInfo = document.getElementById('txInfo');
const txHash = document.getElementById('txHash');
const txStatus = document.getElementById('txStatus');
const contractInfo = document.getElementById('contractInfo');
const contractBalance = document.getElementById('contractBalance');
const checkContractBtn = document.getElementById('checkContract');

// Network names mapping
const networkNames = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet',
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    43114: 'Avalanche Mainnet',
    43113: 'Avalanche Testnet',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli',
    10: 'Optimism',
    420: 'Optimism Goerli'
};

// Connect wallet function
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showStatus('Please install MetaMask to use this application!', 'error');
            return;
        }

        showStatus('Connecting to wallet...', 'info');

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        // Get network information
        const network = await provider.getNetwork();
        const networkId = network.chainId;
        const displayNetworkName = networkNames[networkId] || `Chain ID: ${networkId}`;

        // Update UI
        walletAddress.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        networkName.textContent = displayNetworkName;
        walletInfo.classList.remove('hidden');
        transferForm.classList.remove('hidden');
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.disabled = true;

        showStatus('Wallet connected successfully!', 'success');

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

    } catch (error) {
        console.error('Error connecting wallet:', error);
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        window.location.reload();
    } else if (accounts[0] !== userAddress) {
        // User switched accounts
        window.location.reload();
    }
}

// Check contract balance and info
async function checkContract() {
    try {
        const contractAddress = contractAddressInput.value.trim();
        
        if (!ethers.utils.isAddress(contractAddress)) {
            showStatus('Please enter a valid contract address first', 'error');
            return;
        }
        
        showStatus('Checking contract...', 'info');
        
        // Get contract balance
        const balance = await provider.getBalance(contractAddress);
        const balanceInEth = ethers.utils.formatEther(balance);
        
        contractBalance.textContent = `${balanceInEth} ETH`;
        contractInfo.classList.remove('hidden');
        
        // Check if it's a contract
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            showStatus('Warning: This address is not a smart contract!', 'error');
        } else {
            showStatus('Contract verified', 'success');
            
            // Try to get more info about the contract
            console.log('Contract bytecode length:', code.length);
        }
        
    } catch (error) {
        console.error('Error checking contract:', error);
        showStatus(`Error checking contract: ${error.message}`, 'error');
    }
}

// Transfer funds function
async function transferFunds(e) {
    e.preventDefault();

    try {
        // Get form values
        const contractAddress = contractAddressInput.value.trim();
        const recipientAddress = recipientAddressInput.value.trim();
        const amountValue = amountInput.value;
        const ethValueInEth = ethValueInput.value || '0';
        
        // Get token decimals
        let decimals;
        if (tokenDecimalsSelect.value === 'custom') {
            decimals = parseInt(customDecimalsInput.value);
            if (isNaN(decimals) || decimals < 0 || decimals > 18) {
                showStatus('Invalid custom decimals value', 'error');
                return;
            }
        } else {
            decimals = parseInt(tokenDecimalsSelect.value);
        }

        // Validate addresses
        if (!ethers.utils.isAddress(contractAddress)) {
            showStatus('Invalid contract address!', 'error');
            return;
        }

        if (!ethers.utils.isAddress(recipientAddress)) {
            showStatus('Invalid recipient address!', 'error');
            return;
        }

        // Convert amount based on token decimals
        const amountInSmallestUnit = ethers.utils.parseUnits(amountValue, decimals);
        const ethValueInWei = ethers.utils.parseEther(ethValueInEth);
        
        console.log(`Converting ${amountValue} with ${decimals} decimals to ${amountInSmallestUnit.toString()}`);

        // Create contract instance
        contract = new ethers.Contract(contractAddress, FUND_MANAGER_ABI, signer);

        showStatus('Preparing transaction...', 'info');

        // Prepare transaction options
        const txOptions = {};
        if (ethValueInWei.gt(0)) {
            txOptions.value = ethValueInWei;
        }

        // Try to estimate gas first to catch errors early
        try {
            const gasEstimate = await contract.estimateGas.transferFunds(
                recipientAddress,
                amountInSmallestUnit,
                txOptions
            );
            console.log('Gas estimate:', gasEstimate.toString());
        } catch (estimateError) {
            console.error('Gas estimation failed:', estimateError);
            
            // Try with manual gas limit
            showStatus('Gas estimation failed. Trying with manual gas limit...', 'info');
            
            txOptions.gasLimit = 300000; // Manual gas limit
            
            try {
                const tx = await contract.transferFunds(recipientAddress, amountInSmallestUnit, txOptions);
                await handleTransaction(tx);
                return;
            } catch (manualError) {
                throw manualError;
            }
        }

        // Call transferFunds function
        const tx = await contract.transferFunds(recipientAddress, amountInSmallestUnit, txOptions);
        await handleTransaction(tx);


    } catch (error) {
        console.error('Error transferring funds:', error);
        
        // Handle specific error types
        if (error.code === 'ACTION_REJECTED') {
            showStatus('Transaction rejected by user', 'error');
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            showStatus('Insufficient funds for transaction', 'error');
        } else if (error.message.includes('execution reverted')) {
            showStatus('Transaction reverted: The contract rejected this transaction. Possible reasons: insufficient contract balance, missing permissions, or invalid parameters.', 'error');
            
            // Show additional help for common revert reasons
            const helpMessage = `
                <br><br>
                <strong>Common causes for USDC transfers:</strong><br>
                • The contract doesn't have enough USDC balance<br>
                • You don't have permission to call this function<br>
                • The function might be paused or disabled<br>
                • Wrong decimal places (USDC uses 6 decimals, not 18)<br>
                • The contract needs approval to spend USDC (usually set by owner)<br>
                • The recipient might be blacklisted on USDC contract
            `;
            statusDiv.innerHTML = statusDiv.textContent + helpMessage;
        } else {
            showStatus(`Error: ${error.message || 'Unknown error occurred'}`, 'error');
        }
    }
}

// Handle transaction submission and confirmation
async function handleTransaction(tx) {
    showStatus('Transaction submitted! Waiting for confirmation...', 'info');

    // Show transaction info
    const explorerUrl = getExplorerUrl(tx.hash);
    txHash.href = explorerUrl;
    txHash.textContent = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`;
    txStatus.textContent = 'Pending...';
    txInfo.classList.remove('hidden');

    try {
        // Wait for transaction confirmation
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            txStatus.textContent = 'Confirmed ✓';
            showStatus('Transaction successful!', 'success');
        } else {
            txStatus.textContent = 'Failed ✗';
            showStatus('Transaction failed! The transaction was mined but execution failed.', 'error');
            
            // Provide detailed failure information
            const failureInfo = `
                <br><br>
                <strong>Transaction failed on-chain. Possible reasons:</strong><br>
                • The contract doesn't have enough balance to transfer<br>
                • You don't have the required role/permission<br>
                • The recipient address might be blacklisted<br>
                • The contract might be paused<br>
                • The amount exceeds allowed limits<br>
                <br>
                <strong>Debug Info:</strong><br>
                • Gas Used: ${receipt.gasUsed.toString()}<br>
                • Block: ${receipt.blockNumber}<br>
                • <a href="${explorerUrl}" target="_blank">View on Explorer</a>
            `;
            statusDiv.innerHTML = statusDiv.textContent + failureInfo;
        }
    } catch (error) {
        console.error('Transaction error:', error);
        txStatus.textContent = 'Error';
        
        if (error.code === 'CALL_EXCEPTION') {
            showStatus('Transaction failed during execution. Check the explorer for details.', 'error');
        } else {
            showStatus(`Transaction error: ${error.message}`, 'error');
        }
    }
}

// Get block explorer URL based on network
function getExplorerUrl(txHash) {
    const chainId = provider.network.chainId;
    
    const explorers = {
        1: `https://etherscan.io/tx/${txHash}`,
        5: `https://goerli.etherscan.io/tx/${txHash}`,
        11155111: `https://sepolia.etherscan.io/tx/${txHash}`,
        137: `https://polygonscan.com/tx/${txHash}`,
        80001: `https://mumbai.polygonscan.com/tx/${txHash}`,
        56: `https://bscscan.com/tx/${txHash}`,
        97: `https://testnet.bscscan.com/tx/${txHash}`,
        43114: `https://snowtrace.io/tx/${txHash}`,
        43113: `https://testnet.snowtrace.io/tx/${txHash}`,
        42161: `https://arbiscan.io/tx/${txHash}`,
        421613: `https://goerli.arbiscan.io/tx/${txHash}`,
        10: `https://optimistic.etherscan.io/tx/${txHash}`,
        420: `https://goerli-optimism.etherscan.io/tx/${txHash}`
    };

    return explorers[chainId] || `https://etherscan.io/tx/${txHash}`;
}

// Show status message
function showStatus(message, type = '') {
    statusDiv.textContent = message;
    statusDiv.className = 'status-message';
    
    if (type) {
        statusDiv.classList.add(type);
    }

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status-message';
        }, 5000);
    }
}

// Event listeners
connectWalletBtn.addEventListener('click', connectWallet);
transferForm.addEventListener('submit', transferFunds);
checkContractBtn.addEventListener('click', checkContract);

// Show contract info when address is entered
contractAddressInput.addEventListener('change', () => {
    if (contractAddressInput.value.trim() && ethers.utils.isAddress(contractAddressInput.value.trim())) {
        contractInfo.classList.remove('hidden');
    }
});

// Show/hide custom decimals input
tokenDecimalsSelect.addEventListener('change', () => {
    if (tokenDecimalsSelect.value === 'custom') {
        customDecimalsInput.classList.remove('hidden');
    } else {
        customDecimalsInput.classList.add('hidden');
    }
});

// Check if wallet is already connected on page load
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
});