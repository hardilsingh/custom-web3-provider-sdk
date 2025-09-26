import { useState, useEffect } from 'react';
import { useWeb3Provider, ProviderSelectModal } from 'custom-web3-provider-sdk';

function Web3DemoApp() {
  const {
    providers,
    currentProvider,
    accounts,
    chainId,
    status,
    error,
    isConnecting,
    // Connection management
    connect,
    disconnect,
    clearError,
    refreshProviders,
    // Modal functionality
    isModalOpen,
    openModal,
    closeModal,
    handleModalProviderSelect,
    // Wallet Actions
    getAccount,
    getBalance,
    getTransactionCount,
    estimateGas,
    signMessage,
    signTypedData,
    sendTransaction,
    waitForTransaction,
    switchToDefaultNetwork,
    customRequest,
    // Utilities
    utils,
  } = useWeb3Provider({
    preferred: ['metamask', 'coinbase', 'trustwallet', 'customwallet'],
    fallbackToAny: true,
    autoConnect: false,
    checkInterval: 2000,
    maxRetries: 3,
    requestTimeout: 30000,
    debug: true,
    
    onAccountsChanged: (accounts) => {
      console.log('🔑 Accounts changed:', accounts);
      if (accounts.length === 0) {
        console.log('⚠️ Wallet disconnected');
      }
    },
    onChainChanged: (chainId) => {
      console.log('🔗 Chain changed to:', chainId);
    },
    onDisconnect: (error) => {
      console.error('💔 Provider disconnected:', error);
    },
    onError: (error) => {
      console.error('❌ Provider error:', error);
    },
    onProvidersChanged: (providers) => {
      console.log('📱 Available providers:', providers);
    },
  });

  // Helper function to format values for RPC calls
  const formatValueForRPC = (value: string | number | undefined): string => {
    if (!value || value === '0') return '0x0';
    
    if (typeof value === 'string') {
      if (value.startsWith('0x')) {
        return value;
      }
      // For big integers, convert to hex
      return '0x' + BigInt(value).toString(16);
    }
    
    if (typeof value === 'number') {
      return '0x' + value.toString(16);
    }
    
    return '0x' + BigInt(value).toString(16);
  };

  // Demo state
  const [demoInfo, setDemoInfo] = useState({
    balance: null as any,
    networkInfo: null as any,
    latestTx: null as string | null,
    gasInfo: null as any,
    transactionResults: [] as any[],
    testResults: {
      estimates: [] as any[],
      signatures: [] as any[],
      transactions: [] as any[]
    }
  });

  // Loading states for specific tests
  const [loading, setLoading] = useState({
    balance: false,
    signMessage: false,
    sendTx: false,
    customRequest: false,
    estimateGas: false,
  });

  // Auto-fetch demo info when connected
  useEffect(() => {
    if (status === 'connected' && accounts[0]) {
      fetchDemoInfo();
    }
  }, [status, accounts]);

  const fetchDemoInfo = async () => {
    if (!getBalance || !customRequest || !getTransactionCount) return;
    
    try {
      setLoading(prev => ({ ...prev, balance: true }));
      
      const [balance, networkInfo, txCount, gasPrice] = await Promise.all([
        getBalance(),
        customRequest('eth_chainId').then(id => ({ chainId: id })),
        getTransactionCount(),
        customRequest('eth_gasPrice')
      ]);
      
      setDemoInfo(prev => ({
        ...prev,
        balance,
        networkInfo: networkInfo,
        gasInfo: {
          gasPrice: utils?.weiToEth ? utils.weiToEth(gasPrice) : gasPrice,
          txCount
        }
      }));
    } catch (error) {
      console.error('Failed to fetch demo info:', error);
    } finally {
      setLoading(prev => ({ ...prev, balance: false }));
    }
  };

  const handleSignDemo = async () => {
    if (!signMessage) return;
    
    try {
      setLoading(prev => ({ ...prev, signMessage: true }));
      const message = `📍 Universal Web3 SDK Test\n🗓️ ${new Date().toISOString()}\n🔗 Chain ID: ${chainId || 'Unknown'}`;
      const signature = await signMessage(message);
      
      setDemoInfo(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          signatures: [...prev.testResults.signatures.slice(-4), {
            message,
            signature,
            timestamp: new Date().toISOString()
          }]
        }
      }));
      
      alert('✅ Message signed successfully! Check the results below.');
    } catch (error: any) {
      console.error('❌ Signing failed:', error.message);
      alert(`❌ Signing failed: ${error.message}`);
      // Don't trigger disconnect by expanding error
    } finally {
      setLoading(prev => ({ ...prev, signMessage: false }));
    }
  };

  const handleTypedDataSign = async () => {
    if (!signTypedData) return;
    
    try {
      setLoading(prev => ({ ...prev, signMessage: true }));
      
      const typedData = {
        domain: {
          name: 'Universal Web3 SDK Test',
          version: '1',
          chainId: parseInt(chainId || '1', 16),
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
          ]
        },
        primaryType: 'Person',
        message: {
          name: 'Web3 SDK User',
          wallet: accounts[0]
        }
      };
      
      const signature = await signTypedData(typedData);
      
      setDemoInfo(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          signatures: [...prev.testResults.signatures.slice(-4), {
            message: 'Typed Data Signature',
            signature,
            typedData,
            timestamp: new Date().toISOString()
          }]
        }
      }));
      
      alert('✅ Typed data signed successfully!');
    } catch (error: any) {
      console.error('❌ Typed data signing failed:', error.message);
      alert(`❌ Typed data failed: ${error.message}`);
      // Don't trigger disconnect on typed data errors  
    } finally {
      setLoading(prev => ({ ...prev, signMessage: false }));
    }
  };

  const handleEstimateGas = async () => {
    if (!estimateGas || !getAccount) return;
    
    try {
      setLoading(prev => ({ ...prev, estimateGas: true }));
      const account = await getAccount();
      
      // Use helper to format value properly with 0x prefix
      const valueInWei = utils?.ethToWei?.('0.001');
      const formattedValue = formatValueForRPC(valueInWei);
      
      const gasEstimate = await estimateGas({
        from: account,
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: formattedValue,
        data: '0x' // Empty data field
      });
      
      setDemoInfo(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          estimates: [...prev.testResults.estimates.slice(-4), {
            gasEstimate,
            timestamp: new Date().toISOString()
          }]
        }
      }));
      
      alert(`⛽ Gas estimate: ${parseInt(gasEstimate.gasLimit, 16).toLocaleString()} gas`);
    } catch (error: any) {
      console.error('❌ Gas estimation failed:', error.message);
      alert(`❌ Gas estimation failed: ${error.message}`);
      // Keep connection state preserved despite error
    } finally {
      setLoading(prev => ({ ...prev, estimateGas: false }));
    }
  };

  const handleSendDemoTransaction = async () => {
    if (!getAccount || !sendTransaction || !waitForTransaction) return;
    
    try {
      setLoading(prev => ({ ...prev, sendTx: true }));
      const account = await getAccount();
      
      // Use helper to format value properly with 0x prefix
      const valueInWei = utils?.ethToWei?.('0.001');
      const formattedValue = formatValueForRPC(valueInWei);
      
      // Ensure transaction is well-formed for wallet approval
      const transactionData = {
        from: account,
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: formattedValue,
        maxFeePerGas: '0x2540be400',
        maxPriorityFeePerGas: '0x3b9aca00',
        data: '0x', // Empty data field
        // Optionally add gas limit for better compatibility
        gas: '0x5208' // Standard ETH transfer gas
      };
      
      console.log('🔧 Sending transaction:', transactionData);
      console.log('🔧 Account address:', account);
      
      // Verify account before transaction attempt
      if (!account || !utils?.isValidAddress?.(account)) {
        throw new Error('Invalid account address - please connect wallet correctly');
      }
      
      console.log('📝 Account verified, requesting transaction approval...');
      
      // Attempt the transaction - should open wallet dialog automatically 
      const txHash = await sendTransaction(transactionData);
      
      if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
        throw new Error('No valid transaction hash returned - wallet extension may not have opened');
      }
      
      console.log('✅ Transaction hash received:', txHash);
      
      setDemoInfo(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          transactions: [...prev.testResults.transactions.slice(-4), {
            hash: txHash,
            timestamp: new Date().toISOString()
          }],
          latestTx: txHash
        }
      }));
      
      alert(`📤 Transaction sent! Hash: ${txHash.slice(0, 20)}...`);
      
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await waitForTransaction(txHash);
      
      setDemoInfo(prev => ({
        ...prev,
        latestTx: txHash,
        transactionResults: [...prev.transactionResults.slice(-4), {
          hash: txHash,
          receipt,
          timestamp: new Date().toISOString()
        }]
      }));
      
    } catch (error: any) {
      console.error('❌ Transaction failed:', error.message);
      console.error('Full error object:', error);
      
      // Check for specific error types - Keep wallet connection alive despite tx failure
      if (error.message?.includes('user rejected')) {
        alert('❌ Transaction cancelled by user');
      } else if (error.message?.includes('no error or result')) {
        alert('❌ JSON RPC: Please check wallet connection and try again');
      } else if (error.message?.includes('extension did not open')) {
        alert('❌ Wallet Extension: Please authorize in your wallet');
      } else {
        alert(`❌ Transaction failed: ${error.message}`);
      }
      
      // DON'T disconnect wallet despite transaction failure
    } finally {
      setLoading(prev => ({ ...prev, sendTx: false }));
    }
  };

  const handleCustomRequest = async () => {
    if (!customRequest) return;
    
    try {
      setLoading(prev => ({ ...prev, customRequest: true }));
      
      const [gasPrice, blockNumber, blockHash, txCount] = await Promise.all([
        customRequest('eth_gasPrice'),
        customRequest('eth_blockNumber'),
        customRequest('eth_getBlockByNumber', ['latest', false]),
        getTransactionCount ? getTransactionCount() : Promise.resolve(0)
      ]);
      
      const result = {
        gasPrice: utils?.weiToEth ? utils.weiToEth(gasPrice as string) : gasPrice,
        blockNumber: parseInt(blockNumber as string, 16),
        blockHash,
        txCount
      };
      
      console.log('📊 Latest blockchain data:', result);
      alert(`⛽ Gas: ${result.gasPrice} ETH\n🔢 Block: ${result.blockNumber}\n🔢 Transaction Count: ${txCount}`);
    } catch (error: any) {
      console.error('❌ Custom request failed:', error.message);
      alert(`❌ Custom request failed: ${error.message}`);
      // Preserve wallet connection status despite RPC errors
    } finally {
      setLoading(prev => ({ ...prev, customRequest: false }));
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'connected': return 'status status-connected';
      case 'connecting': return 'status status-connecting';
      case 'error': return 'status status-error';
      default: return 'status status-disconnected';
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
      {/* Professional Header */}
      <header className="header">
        <div className="container">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              Universal Web3 SDK
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Enterprise-grade Web3 integration • Production-ready wallet functionality • Comprehensive testing suite
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="space-y-8">

          {/* Professional Connection Status Card */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center">
                Wallet Connection
              </h2>
              <div className={getStatusClass()}>
                {status.toUpperCase()}
              </div>
            </div>
            
            {error && (
              <div className="mb-6 bg-orange-50 border-orange-200">
                <div className="p-6 flex items-start">
                  <div className="text-orange-400 mr-3 text-xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="text-orange-400 font-semibold text-lg">System Error</h4>
                    <p className="text-orange-300 text-sm mt-2">{error.message}</p>
                    <button 
                      onClick={clearError}
                      className="mt-4 btn btn-danger"
                    >
                      Dismiss Error
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === 'connected' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProvider && (
                  <div className="bg-blue-50">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-blue-400 flex items-center mb-2">
                        ⚡ Provider Status
                      </h3>
                      <div className="text-xl font-bold text-blue-300 capitalize">
                        {currentProvider.name}
                      </div>
                    </div>
                  </div>
                )}

                {accounts[0] && (
                  <div className="bg-green-50">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-green-400 flex items-center mb-2">
                        👤 Wallet Address
                      </h3>
                      <div className="text-lg font-mono text-green-300 break-all">
                        {utils?.formatAddress?.(accounts[0]) || accounts[0]?.slice(0, 20)}...
                      </div>
                    </div>
                  </div>
                )}

                {chainId && (
                  <div className="bg-purple-50">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-purple-400 flex items-center mb-2">
                        🔗 Network ID
                      </h3>
                      <div className="text-xl font-bold text-purple-300">
                        {parseInt(chainId, 16)}
                      </div>
                    </div>
                  </div>
                )}

                {demoInfo.balance && (
                  <div className="bg-yellow-50">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-yellow-400 flex items-center mb-2">
                        💰 Wallet Balance
                      </h3>
                      <div className="text-xl font-bold text-yellow-300">
                        {demoInfo.balance.balanceInEth} ETH
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-8xl mb-6">⚡</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Connect Your Web3 Wallet
                </h3>
                <p className="text-gray-300 mb-8 text-lg">
                  {providers.length} wallet{providers.length !== 1 ? 's' : ''} detected - Choose your preferred provider
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={openModal}
                    disabled={isConnecting || providers.length === 0}
                    className="btn btn-primary text-lg px-8 py-4"
                  >
                    {isConnecting ? (
                      <>
                        <div className="loading-dots mr-3">
                          <div className="loading-dot"></div>
                          <div className="loading-dot"></div>
                          <div className="loading-dot"></div>
                        </div>
                        Connecting...
                      </>
                    ) : (
                      '🔗 Connect Wallet'
                    )}
                  </button>
                  
                  {connect && providers.length > 0 && (
                    <button
                      onClick={() => connect(providers[0].name)}
                      disabled={isConnecting}
                      className="btn btn-success text-lg px-6 py-4"
                    >
                      Quick Connect
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {status === 'connected' ? (
                <>
                  <button 
                    onClick={disconnect}
                    className="btn btn-danger flex items-center"
                  >
                    🔌 Disconnect Wallet
                  </button>
                  <button 
                    onClick={refreshProviders}
                    className="btn btn-warning flex items-center"
                  >
                    🔄 Refresh Providers
                  </button>
                </>
              ) : (
                <div className="flex flex-wrap gap-4 w-full">
                  {providers.slice(0, 3).map((provider, index) => (
                    <button
                      key={index}
                      onClick={() => connect(provider.name)}
                      disabled={isConnecting}
                      className="btn btn-primary flex items-center"
                    >
                      🔗 {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Connected State - Show all functionality */}
          {status === 'connected' && (
            <>
              {/* Main Functionality Tests */}
              <div className="card">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                  Wallet Functionality Testing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                  <button 
                    onClick={handleSignDemo} 
                    disabled={loading.signMessage}
                    className="btn btn-success p-6"
                  >
                    <div className="text-center">
                      {loading.signMessage ? (
                        <>
                          <div className="loading-dots mb-3">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                          </div>
                          <div className="text-lg">Signing...</div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">✍️</div>
                          <div className="text-sm font-medium">Sign Message</div>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleTypedDataSign}
                    disabled={loading.signMessage || !signTypedData}
                    className="btn btn-purple p-6"
                  >
                    <div className="text-center">
                      {loading.signMessage ? (
                        <>
                          <div className="loading-dots mb-3">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                          </div>
                          <div className="text-lg">Signing...</div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">📝</div>
                          <div className="text-sm font-medium">Sign Typed Data</div>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleEstimateGas}
                    disabled={loading.estimateGas || !estimateGas}
                    className="btn btn-warning p-6"
                  >
                    <div className="text-center">
                      {loading.estimateGas ? (
                        <>
                          <div className="loading-dots mb-3">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                          </div>
                          <div className="text-lg">Estimating...</div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">⛽</div>
                          <div className="text-sm font-medium">Estimate Gas</div>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleSendDemoTransaction} 
                    disabled={loading.sendTx}
                    className="btn btn-danger p-6"
                  >
                    <div className="text-center">
                      {loading.sendTx ? (
                        <>
                          <div className="loading-dots mb-3">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                          </div>
                          <div className="text-lg">Sending...</div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">💸</div>
                          <div className="text-sm font-medium">Send Tx</div>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleCustomRequest} 
                    disabled={loading.customRequest}
                    className="btn btn-cyan p-6"
                  >
                    <div className="text-center">
                      {loading.customRequest ? (
                        <>
                          <div className="loading-dots mb-3">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                          </div>
                          <div className="text-lg">Requesting...</div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">⚡</div>
                          <div className="text-sm font-medium">Custom API</div>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Additional Actions Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => switchToDefaultNetwork && switchToDefaultNetwork()} 
                    disabled={!switchToDefaultNetwork}
                    className="btn btn-cyan"
                  >
                    <span className="action-icon mr-2">🔄</span>
                    Switch Network
                  </button>
                  
                  <button 
                    onClick={fetchDemoInfo}
                    disabled={loading.balance}
                    className="btn btn-primary"
                  >
                    {loading.balance ? '🔄 Refreshing...' : '💾 Refresh Balance'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('🔍 Providers:', providers);
                      console.log('🔍 Current Provider:', currentProvider);
                      console.log('🔍 Demo Info:', demoInfo);
                    }}
                    className="btn btn-purple"
                  >
                    🔍 Log to Console
                  </button>

                  <button 
                    onClick={() => {
                      setDemoInfo(prev => ({
                        ...prev,
                        testResults: {
                          estimates: [],
                          signatures: [],
                          transactions: []
                        }
                      }));
                    }}
                    className="btn btn-danger"
                  >
                    🗑️ Clear Results
                  </button>
                </div>
              </div>

              {/* Test Results Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Signatures Results */}
                {demoInfo.testResults.signatures.length > 0 && (
                  <div className="card glass-secondary">
                    <h3 className="text-xl font-bold text-white mb-4">✍️ Recent Signatures</h3>
                    <div className="space-y-3">
                      {demoInfo.testResults.signatures.map((result, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border-green-200">
                          <div className="font-medium text-green-400 mb-2">
                            {result.message.substring(0, 50)}...
                          </div>
                          <div className="font-mono text-xs text-green-300 break-all">
                            {result.signature?.slice(0, 50)}...
                          </div>
                          <div className="text-xs text-green-400 mt-1">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions Results */}
                {demoInfo.testResults.transactions.length > 0 && (
                  <div className="card glass-secondary">
                    <h3 className="text-xl font-bold text-white mb-4">💸 Recent Transactions</h3>
                    <div className="space-y-3">
                      {demoInfo.testResults.transactions.map((result, index) => (
                        <div key={index} className="bg-yellow-50 p-4 rounded-lg border-yellow-200">
                          <div className="font-medium text-yellow-400 mb-2">
                            Transaction Hash
                          </div>
                          <div className="font-mono text-xs text-yellow-300 break-all">
                            {result.hash}
                          </div>
                          <div className="text-xs text-yellow-400 mt-1">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimates Results */}
                {demoInfo.testResults.estimates.length > 0 && (
                  <div className="card glass-secondary">
                    <h3 className="text-xl font-bold text-white mb-4">⛽ Recent Gas Estimates</h3>
                    <div className="space-y-3">
                      {demoInfo.testResults.estimates.map((result, index) => (
                        <div key={index} className="bg-orange-50 p-4 rounded-lg border-orange-200">
                          <div className="font-medium text-orange-400 mb-2">
                            Gas Estimate
                          </div>
                          <div className="font-mono text-sm text-orange-300">
                            {result.gasEstimate?.gasLimit && `${parseInt(result.gasEstimate.gasLimit, 16).toLocaleString()} gas`}
                          </div>
                          <div className="text-xs text-orange-400 mt-1">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Account Details */}
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-6">📊 Account Details & Network</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {demoInfo.balance && (
                    <div className="bg-green-50 p-6 rounded-xl border-green-200">
                      <h3 className="text-lg font-semibold text-green-600 mb-4">💰 Balance</h3>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-400">
                          {demoInfo.balance.balanceInEth} ETH
                        </div>
                        <div className="text-sm text-green-300 font-mono">
                          {demoInfo.balance.balance} Wei
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {demoInfo.gasInfo && (
                    <div className="bg-blue-50 p-6 rounded-xl border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-600 mb-4">⛽ Network Gas Info</h3>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-blue-400">
                          {demoInfo.gasInfo.gasPrice} ETH per unit
                        </div>
                        <div className="text-sm text-blue-300">
                          TX Count: {demoInfo.gasInfo.txCount}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-50 p-6 rounded-xl border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-600 mb-4">🌐 Network Info</h3>
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-purple-400">
                        Chain {parseInt(chainId || '0', 16)}
                      </div>
                      <div className="text-sm text-purple-300 font-mono">
                        {chainId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utility Functions */}
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-6">🛠️ Utility Functions</h2>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Address validation</label>
                      <div className="text-2xl">
                        {utils?.isValidAddress?.(accounts[0] || '0x0000000000000000000000000000000000000000') ? (
                          <span className="text-green-400 font-medium">✅ Valid</span>
                        ) : (
                          <span className="text-red-400 font-medium">❌ Invalid</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Chain ID validation</label>
                      <div className="text-2xl">
                        {utils?.isValidChainId?.(chainId || '0x0') ? (
                          <span className="text-green-400 font-medium">✅ Valid</span>
                        ) : (
                          <span className="text-red-400 font-medium">❌ Invalid</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Formatted address</label>
                      <div className="text-lg font-mono text-white">
                        {accounts[0] && utils?.formatAddress ? 
                          utils.formatAddress(accounts[0]) : 
                          'No account connected'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Provider Modal */}
      <ProviderSelectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        providers={providers}
        onSelectProvider={handleModalProviderSelect}
        isConnecting={isConnecting}
        error={error}
        clearError={clearError}
      />
    </div>
  );
}

export default Web3DemoApp;