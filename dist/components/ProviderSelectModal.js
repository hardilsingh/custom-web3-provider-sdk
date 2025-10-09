"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderSelectModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const walletIcons = {
    metamask: '🦊',
    coinbase: '🔷',
    trustwallet: '🛡️',
    gala: '🎮',
    rabby: '🐰',
    brave: '🦁',
    phantom: '👻',
};
const ProviderSelectModal = ({ isOpen, onClose, providers, onSelectProvider, isConnecting = false, error, clearError, }) => {
    if (!isOpen)
        return null;
    // Handle escape key press
    react_1.default.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);
    // Focus trap - focus on first interactive element
    react_1.default.useEffect(() => {
        if (isOpen) {
            const modal = document.querySelector('[role="dialog"]');
            const focusableElements = modal?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements?.[0];
            firstElement?.focus();
        }
    }, [isOpen]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'modal-overlay', role: 'presentation', children: [(0, jsx_runtime_1.jsx)("div", { className: 'modal-backdrop', onClick: onClose, "aria-hidden": 'true' }), (0, jsx_runtime_1.jsxs)("div", { className: 'modal-content', role: 'dialog', "aria-modal": 'true', "aria-labelledby": 'modal-title', "aria-describedby": 'modal-description', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'flex items-center justify-between p-6 border-b border-gray-200', children: [(0, jsx_runtime_1.jsx)("h2", { id: 'modal-title', className: 'text-2xl font-bold gradient-text', children: "Connect Wallet" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: 'p-2 hover:bg-gray-100 rounded-full transition-colors', "aria-label": 'Close modal', children: (0, jsx_runtime_1.jsx)("svg", { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: 'p-6', children: [error && ((0, jsx_runtime_1.jsx)("div", { className: 'mb-4 p-4 bg-red-50 border border-red-200 rounded-lg', role: 'alert', "aria-live": 'assertive', children: (0, jsx_runtime_1.jsxs)("div", { className: 'flex items-center', children: [(0, jsx_runtime_1.jsx)("div", { className: 'text-red-600 mr-3', "aria-hidden": 'true', children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("div", { className: 'flex-1', children: (0, jsx_runtime_1.jsx)("p", { className: 'text-red-800 text-sm font-medium', children: error.message }) }), clearError && ((0, jsx_runtime_1.jsx)("button", { onClick: clearError, className: 'ml-3 text-red-600 hover:text-red-800', "aria-label": 'Clear error', children: "\u2715" }))] }) })), (0, jsx_runtime_1.jsx)("p", { id: 'modal-description', className: 'text-gray-600 mb-6', children: "Choose a wallet to connect to your dApp" }), (0, jsx_runtime_1.jsx)("div", { className: 'space-y-3', role: 'list', "aria-label": 'Available wallet providers', children: providers.length > 0 ? (providers.map(provider => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => onSelectProvider(provider.name), disabled: isConnecting, className: 'w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group', role: 'listitem', "aria-label": `Connect to ${provider.name} wallet${provider.isConnected ? ' (currently connected)' : ''}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: 'flex items-center space-x-4', children: [(0, jsx_runtime_1.jsx)("div", { className: 'text-2xl', children: walletIcons[provider.name] || '💰' }), (0, jsx_runtime_1.jsxs)("div", { className: 'text-left', children: [(0, jsx_runtime_1.jsx)("div", { className: 'font-semibold text-gray-900 dark:text-white capitalize', children: provider.name }), (0, jsx_runtime_1.jsx)("div", { className: 'text-sm text-gray-500 dark:text-gray-400', children: provider.version || 'Unknown version' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: 'flex items-center space-x-2', children: [provider.isConnected && ((0, jsx_runtime_1.jsx)("span", { className: 'text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full', children: "Connected" })), (0, jsx_runtime_1.jsx)("svg", { className: 'w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 5l7 7-7 7' }) })] })] }, provider.name)))) : ((0, jsx_runtime_1.jsxs)("div", { className: 'text-center py-12', children: [(0, jsx_runtime_1.jsx)("div", { className: 'text-6xl mb-4', children: "\uD83D\uDD0D" }), (0, jsx_runtime_1.jsx)("h3", { className: 'text-lg font-medium text-gray-900 dark:text-white mb-2', children: "No wallets detected" }), (0, jsx_runtime_1.jsx)("p", { className: 'text-gray-500 dark:text-gray-400 mb-6', children: "Please install a crypto wallet to continue" }), (0, jsx_runtime_1.jsxs)("div", { className: 'flex flex-wrap justify-center gap-2', children: [(0, jsx_runtime_1.jsx)("a", { href: 'https://metamask.io/', target: '_blank', rel: 'noopener noreferrer', className: 'inline-flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors', children: "\uD83E\uDD8A MetaMask" }), (0, jsx_runtime_1.jsx)("a", { href: 'https://www.coinbase.com/wallet', target: '_blank', rel: 'noopener noreferrer', className: 'inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors', children: "\uD83D\uDD37 Coinbase Wallet" })] })] })) }), isConnecting && ((0, jsx_runtime_1.jsx)("div", { className: 'mt-6 flex items-center justify-center', role: 'status', "aria-live": 'polite', "aria-label": 'Connecting to wallet', children: (0, jsx_runtime_1.jsxs)("div", { className: 'animate-pulse flex items-center space-x-2', children: [(0, jsx_runtime_1.jsx)("div", { className: 'w-4 h-4 bg-blue-600 rounded-full animate-bounce', "aria-hidden": 'true' }), (0, jsx_runtime_1.jsx)("span", { className: 'text-gray-600 dark:text-gray-300', children: "Connecting..." })] }) }))] }), (0, jsx_runtime_1.jsx)("div", { className: 'p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800', children: (0, jsx_runtime_1.jsx)("p", { className: 'text-xs text-gray-500 dark:text-gray-400 text-center', children: "By connecting a wallet, you agree to our Terms of Service and Privacy Policy" }) })] })] }));
};
exports.ProviderSelectModal = ProviderSelectModal;
exports.default = exports.ProviderSelectModal;
