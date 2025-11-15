# Network Analytics Components

This folder contains components for blockchain network selection with integrated volume analytics and price charts.

## Components

### NetworkSelector.jsx
Main component that replaces the grid-based network selection with:
- **Dropdown Network Selector**: Clean dropdown interface for selecting blockchain networks
- **Volume Chart Toggle**: Button to show/hide analytics charts
- **Time Period Selection**: Choose from 1 Day, 7 Days, 1 Month, 1 Year, 5 Years
- **Integrated Analytics**: Seamlessly combines network selection with volume data

### VolumeChart.jsx
Chart component that displays:
- **Volume Data**: Trading volume in millions USD
- **Price Data**: Token/coin price in USD
- **Dual Y-Axis**: Volume on left, price on right
- **Multiple Timeframes**: 1hr intervals for 1 day, daily for longer periods
- **Real-time Data**: Fetches from CoinGecko API with fallback to mock data

## Features

### 🔄 Network Selection
- Dropdown interface replacing the previous grid layout
- Visual network indicators with logos
- Smooth transitions and hover effects
- Persistent network selection

### 📊 Volume Analytics
- Real-time trading volume from CoinGecko API
- Price correlation charts
- Multiple timeframe options:
  - **1 Day**: Hourly intervals
  - **7 Days**: Daily intervals  
  - **1 Month**: Daily intervals
  - **1 Year**: Daily intervals
  - **5 Years**: Daily intervals

### 🎨 Professional UI
- Consistent with application theme
- Loading states and error handling
- Responsive design for all screen sizes
- Interactive tooltips and legends

## API Integration

### CoinGecko Mapping
```javascript
const coingeckoMapping = {
  base: 'ethereum',
  polygon: 'matic-network', 
  sepolia: 'ethereum',
  bnb: 'binancecoin',
  zetachain: 'zetachain',
  somnia: 'ethereum',
  lisk: 'ethereum',
  citrea: 'bitcoin'
}
```

### Environment Variables
Uses `VITE_COINGECKO_API_KEY` from environment configuration.

### Fallback Data
If API fails, generates realistic mock data to ensure functionality.

## Usage

### In TransactionPage.jsx
```jsx
import NetworkSelector from '../NetworkAnalytics/NetworkSelector'

<NetworkSelector 
  currentBlockchain={currentBlockchain}
  onBlockchainChange={handleBlockchainChange}
/>
```

### Time Periods
- **1 Day**: Shows hourly data points for detailed intraday analysis
- **7 Days**: Daily data points for weekly trends
- **1 Month**: Daily data points for monthly analysis  
- **1 Year**: Daily data points for yearly trends
- **5 Years**: Daily data points for long-term analysis

## Chart Features

### Interactive Elements
- Hover tooltips showing exact values
- Dual-axis display (volume + price)
- Responsive scaling
- Professional crypto market styling

### Data Display
- Volume in millions USD ($XXXm)
- Price in USD ($XX.XX)
- Latest values displayed below chart
- Error handling with retry functionality

## Integration Benefits

1. **Space Efficient**: Dropdown saves vertical space compared to grid
2. **Enhanced Functionality**: Adds volume analytics without cluttering UI
3. **Professional Appearance**: Matches crypto market standards
4. **User Experience**: Toggle charts on/off as needed
5. **Data-Driven**: Real market data for informed decisions

This implementation transforms the basic network selection into a comprehensive analytics dashboard while maintaining the clean, professional appearance of the WalletX application.