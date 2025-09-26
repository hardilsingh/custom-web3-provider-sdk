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
export declare const ProviderSelectModal: React.FC<ProviderSelectModalProps>;
export default ProviderSelectModal;
