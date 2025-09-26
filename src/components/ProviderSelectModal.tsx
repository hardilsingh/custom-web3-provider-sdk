import React from 'react';
import { DetectedWalletProvider, Web3ProviderError } from '../types';

export interface ProviderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: DetectedWalletProvider[];
  onSelectProvider: (providerName: string) => void;
  isConnecting?: boolean;
  error?: Web3ProviderError | null;
  clearError?: () => void;
}

const walletIcons: Record<string, string> = {
  metamask: '🦊',
  coinbase: '🔷',
  trustwallet: '🛡️',
  gala: '🎮',
  rabby: '🐰',
  brave: '🦁',
  phantom: '👻',
};

export const ProviderSelectModal: React.FC<ProviderSelectModalProps> = ({
  isOpen,
  onClose,
  providers,
  onSelectProvider,
  isConnecting = false,
  error,
  clearError,
}) => {
  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      {/* Backdrop */}
      <div className='modal-backdrop' onClick={onClose} />

      {/* Modal */}
      <div className='modal-content'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-2xl font-bold gradient-text'>Connect Wallet</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center'>
                <div className='text-red-600 mr-3'>⚠️</div>
                <div className='flex-1'>
                  <p className='text-red-800 text-sm font-medium'>
                    {error.message}
                  </p>
                </div>
                {clearError && (
                  <button
                    onClick={clearError}
                    className='ml-3 text-red-600 hover:text-red-800'
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          <p className='text-gray-600 mb-6'>
            Choose a wallet to connect to your dApp
          </p>

          {/* Providers List */}
          <div className='space-y-3'>
            {providers.length > 0 ? (
              providers.map(provider => (
                <button
                  key={provider.name}
                  onClick={() => onSelectProvider(provider.name)}
                  disabled={isConnecting}
                  className='w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='text-2xl'>
                      {walletIcons[provider.name] || '💰'}
                    </div>
                    <div className='text-left'>
                      <div className='font-semibold text-gray-900 dark:text-white capitalize'>
                        {provider.name}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {provider.version || 'Unknown version'}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    {provider.isConnected && (
                      <span className='text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full'>
                        Connected
                      </span>
                    )}
                    <svg
                      className='w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className='text-center py-12'>
                <div className='text-6xl mb-4'>🔍</div>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No wallets detected
                </h3>
                <p className='text-gray-500 dark:text-gray-400 mb-6'>
                  Please install a crypto wallet to continue
                </p>
                <div className='flex flex-wrap justify-center gap-2'>
                  <a
                    href='https://metamask.io/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors'
                  >
                    🦊 MetaMask
                  </a>
                  <a
                    href='https://www.coinbase.com/wallet'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors'
                  >
                    🔷 Coinbase Wallet
                  </a>
                </div>
              </div>
            )}
          </div>

          {isConnecting && (
            <div className='mt-6 flex items-center justify-center'>
              <div className='animate-pulse flex items-center space-x-2'>
                <div className='w-4 h-4 bg-blue-600 rounded-full animate-bounce'></div>
                <span className='text-gray-600 dark:text-gray-300'>
                  Connecting...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            By connecting a wallet, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderSelectModal;
