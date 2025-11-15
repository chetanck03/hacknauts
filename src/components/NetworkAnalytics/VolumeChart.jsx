import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const VolumeChart = ({ blockchain, timeframe, networkName }) => {
  const [volumeData, setVolumeData] = useState(null)
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // CoinGecko ID mapping for different blockchains
  const coingeckoMapping = {
    base: 'ethereum',
    polygon: 'matic-network',
    sepolia: 'ethereum',
    bnb: 'binancecoin',
    zetachain: 'zetachain',
    somnia: 'ethereum', // Fallback to ETH
    lisk: 'ethereum',
    citrea: 'bitcoin'
  }

  // Fetch volume and price data from CoinGecko API
  const fetchVolumeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiKey = import.meta.env.VITE_COINGECKO_API_KEY
      const coingeckoId = coingeckoMapping[blockchain] || 'ethereum'
      
      // Use daily interval for all timeframes to ensure reliability
      const interval = 'daily'

      const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${timeframe}&interval=${interval}${apiKey ? `&x_cg_demo_api_key=${apiKey}` : ''}`
      
      console.log('Fetching data from:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.total_volumes && data.prices) {
        setVolumeData(data.total_volumes)
        setPriceData(data.prices)
      } else {
        throw new Error('Invalid data format received')
      }
      
    } catch (error) {
      console.error('Error fetching volume data:', error)
      setError(error.message)
      
      // Generate mock data as fallback
      const mockData = generateMockData(parseInt(timeframe))
      setVolumeData(mockData.volumes)
      setPriceData(mockData.prices)
    } finally {
      setLoading(false)
    }
  }

  // Generate mock data for fallback
  const generateMockData = (days) => {
    const volumes = []
    const prices = []
    const now = Date.now()
    const interval = 24 * 60 * 60 * 1000 // Always use daily intervals
    const points = Math.min(days, 30) // Limit to 30 points max for better performance

    let basePrice = Math.random() * 100 + 50
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - (i * interval)
      const volume = Math.random() * 1000000000 + 500000000
      
      // Add some price volatility
      basePrice += (Math.random() - 0.5) * (basePrice * 0.05) // Reduced volatility
      basePrice = Math.max(basePrice, 1)
      
      volumes.push([timestamp, volume])
      prices.push([timestamp, basePrice])
    }
    
    return { volumes, prices }
  }

  useEffect(() => {
    fetchVolumeData()
  }, [blockchain, timeframe])

  const getChartData = () => {
    if (!volumeData || !priceData) return null

    const labels = volumeData.map(([timestamp]) => {
      const date = new Date(timestamp)
      if (timeframe === '1') {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit'
        })
      } else if (parseInt(timeframe) <= 30) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        })
      }
    })

    const volumes = volumeData.map(([, volume]) => volume / 1000000) // Convert to millions
    const prices = priceData.map(([, price]) => price)

    return {
      labels,
      datasets: [
        {
          label: 'Volume (M USD)',
          data: volumes,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 1,
          pointHoverRadius: 4,
          borderWidth: 2,
          yAxisID: 'y',
          // Tooltip color box - fully colored purple
          pointBackgroundColor: 'rgb(139, 92, 246)',
          pointBorderColor: 'rgb(139, 92, 246)'
        },
        {
          label: 'Price (USD)',
          data: prices,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 1,
          pointHoverRadius: 4,
          borderWidth: 2,
          yAxisID: 'y1',
          // Tooltip color box - fully colored green
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: 'rgb(34, 197, 94)'
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'line'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Volume: $${context.parsed.y.toFixed(2)}M`
            } else {
              return `Price: $${context.parsed.y.toFixed(2)}`
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.6)',
          font: {
            size: 10
          },
          maxTicksLimit: 8
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(139, 92, 246, 0.8)',
          font: {
            size: 10
          },
          callback: function(value) {
            return '$' + value.toFixed(0) + 'M'
          }
        },
        title: {
          display: true,
          text: 'Volume (M USD)',
          color: 'rgba(139, 92, 246, 0.8)',
          font: {
            size: 11
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(34, 197, 94, 0.8)',
          font: {
            size: 10
          },
          callback: function(value) {
            return '$' + value.toFixed(2)
          }
        },
        title: {
          display: true,
          text: 'Price (USD)',
          color: 'rgba(34, 197, 94, 0.8)',
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgba(139, 92, 246, 1)',
        hoverBorderColor: 'white',
        hoverBorderWidth: 2
      }
    }
  }

  if (loading) {
    return (
      <div className="h-80 bg-neutral-800/30 border border-neutral-600 rounded-lg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3"></div>
        <p className="text-gray-400 text-sm">Loading volume data for {networkName}...</p>
      </div>
    )
  }

  if (error && !volumeData) {
    return (
      <div className="h-80 bg-neutral-800/30 border border-neutral-600 rounded-lg flex flex-col items-center justify-center">
        <div className="text-red-400 mb-2">⚠️</div>
        <p className="text-gray-400 text-sm text-center">
          Failed to load data: {error}
        </p>
        <button 
          onClick={fetchVolumeData}
          className="mt-3 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  const chartData = getChartData()

  return (
    <div className="bg-neutral-800/30 border border-neutral-600 rounded-lg p-4">
      {error && (
        <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ This timeframe data is not available right now. Showing sample data instead.
          </p>
        </div>
      )}
      
      <div className="h-80">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-gray-500 mb-2">📊</div>
            <p className="text-gray-400 text-sm">No data available</p>
          </div>
        )}
      </div>
      
      {volumeData && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">24h Trading Volume</p>
            <p className="text-purple-400 font-bold text-lg">
              ${(volumeData[volumeData.length - 1][1] / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Current Price</p>
            <p className="text-green-400 font-bold text-lg">
              ${priceData[priceData.length - 1][1].toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolumeChart