import React, { useState, useEffect } from 'react'
import { ChevronDown, Network, TrendingUp, BarChart3 } from 'lucide-react'
import { NETWORK_CONFIGS } from '../../lib/networks'
import VolumeChart from './VolumeChart'

// Import blockchain logos
import polygonLogo from '../../assests/polygon-matic-logo.svg'
import baseLogo from '../../assests/base-logo.svg'
import sepoliaLogo from '../../assests/sepolia-logo.svg'
import bnbLogo from '../../assests/bnb-logo.svg'
import zetachainLogo from '../../assests/zetachain-logo.svg'
import somniaLogo from '../../assests/somnia.svg'
import liskLogo from '../../assests/lisk-logo.svg'
import citreaLogo from '../../assests/citrea-logo.svg'

const NetworkSelector = ({ currentBlockchain, onBlockchainChange }) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedTimeframe, setSelectedTimeframe] = useState('7') // Default to 7 days

    // Time period options - only reliable ones
    const timeframes = [
        { value: '1', label: '1 Day', days: 1 },
        { value: '7', label: '7 Days', days: 7 },
        { value: '30', label: '1 Month', days: 30 },
        { value: '365', label: '1 Year', days: 365 },
        { value: '1825', label: '5 Years', days: 1825 }
    ]

    // Function to get the correct logo based on blockchain
    const getBlockchainLogo = (blockchain) => {
        switch (blockchain) {
            case 'polygon': return polygonLogo
            case 'base': return baseLogo
            case 'sepolia': return sepoliaLogo
            case 'bnb': return bnbLogo
            case 'zetachain': return zetachainLogo
            case 'somnia': return somniaLogo
            case 'lisk': return liskLogo
            case 'citrea': return citreaLogo
            default: return baseLogo
        }
    }

    // Get all available blockchains for network selection
    const availableBlockchains = Object.keys(NETWORK_CONFIGS).map(blockchainId => ({
        id: blockchainId,
        name: NETWORK_CONFIGS[blockchainId].name,
        symbol: NETWORK_CONFIGS[blockchainId].symbol,
        config: NETWORK_CONFIGS[blockchainId],
        logo: getBlockchainLogo(blockchainId)
    }))

    const currentNetwork = availableBlockchains.find(b => b.id === currentBlockchain)
    const currentTimeframe = timeframes.find(t => t.value === selectedTimeframe)

    const handleNetworkSelect = (blockchainId) => {
        onBlockchainChange(blockchainId)
        setShowDropdown(false)
    }

    const handleTimeframeChange = (timeframe) => {
        setSelectedTimeframe(timeframe)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.network-dropdown')) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showDropdown])

    return (
        <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-400/20 rounded-xl blur opacity-75"></div>
                <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 md:p-8">
                    
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                            <div className="inline-flex items-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-400/20 border border-purple-500/30 justify-center bg-neutral-950 backdrop-blur-3xl">
                                <Network className="text-purple-400" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-white font-geist">Network Selection</h2>
                            <p className="text-xs text-gray-400">Choose blockchain & view market data</p>
                        </div>
                    </div>

                    {/* Network Dropdown Selector */}
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        {/* Network Dropdown */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select Network
                            </label>
                            <div className="relative network-dropdown">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-full flex items-center justify-between gap-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-lg px-4 py-3 hover:border-neutral-600 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {currentNetwork && (
                                            <>
                                                <img 
                                                    src={currentNetwork.logo} 
                                                    alt={currentNetwork.name}
                                                    className="w-6 h-6 flex-shrink-0"
                                                />
                                                <div className="flex items-center gap-2 text-left">
                                                    <span className="text-white font-medium">
                                                        {currentNetwork.config.networks.testnet.name}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">
                                                        {currentNetwork.symbol} Network
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu - Grid Layout */}
                                {showDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800/95 backdrop-blur-sm border border-neutral-700 rounded-lg shadow-xl z-50 p-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {availableBlockchains.map((blockchain) => {
                                                const isSelected = currentBlockchain === blockchain.id
                                                const networkConfig = blockchain.config.networks.testnet

                                                return (
                                                    <button
                                                        key={blockchain.id}
                                                        onClick={() => handleNetworkSelect(blockchain.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                                            isSelected 
                                                                ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' 
                                                                : 'bg-neutral-700/30 border-neutral-600 hover:border-neutral-500 hover:bg-neutral-700/50'
                                                        }`}
                                                    >
                                                        <img 
                                                            src={blockchain.logo} 
                                                            alt={blockchain.name}
                                                            className="w-8 h-8 flex-shrink-0"
                                                        />
                                                        <div className="flex-1 text-left min-w-0">
                                                            <div className="text-white font-medium text-sm truncate">
                                                                {networkConfig.name}
                                                            </div>
                                                            <div className="text-gray-400 text-xs">
                                                                {blockchain.symbol}
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Time Period Selector */}
                        <div className="flex-1 min-w-0">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Chart Time Period
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {timeframes.map((timeframe) => (
                                    <button
                                        key={timeframe.value}
                                        onClick={() => handleTimeframeChange(timeframe.value)}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                            selectedTimeframe === timeframe.value
                                                ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
                                                : 'bg-neutral-800/50 border-neutral-600 text-gray-400 hover:border-neutral-500'
                                        }`}
                                    >
                                        {timeframe.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {timeframes.find(t => t.value === selectedTimeframe)?.description}
                            </div>
                        </div>
                    </div>

                    {/* Volume Chart - Always visible */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Price & Volume Analytics
                                </h3>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-purple-400 font-medium">
                                    {currentTimeframe?.label}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {currentTimeframe?.description}
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800/20 border border-neutral-600/50 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-center gap-8 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-purple-400 font-medium">Trading Volume (Purple Line)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-400 font-medium">Token Price (Green Line)</span>
                                </div>
                            </div>
                        </div>
                        <VolumeChart 
                            blockchain={currentBlockchain}
                            timeframe={selectedTimeframe}
                            networkName={currentNetwork?.config.networks.testnet.name}
                        />
                    </div>

                    {/* Current Network Info */}
                    <div className="mt-6 p-4 bg-neutral-800/30 border border-neutral-600 rounded-lg">
                        <div className="flex items-center gap-3">
                            {currentNetwork && (
                                <>
                                    <img 
                                        src={currentNetwork.logo} 
                                        alt={currentNetwork.name}
                                        width={24} 
                                        height={24} 
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            <span className='text-purple-400'>Active Network:</span> {currentNetwork.config.networks.testnet.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Your wallet works seamlessly across all networks
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NetworkSelector