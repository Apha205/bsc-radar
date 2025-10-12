"use client";

import { useState } from 'react';

interface Holder {
  address: string;
  amount: string;
  percentage: string;
}

interface TokenData {
  name: string;
  symbol: string;
  contract_address: string;
  verified: boolean;
  liquidity: string;
  volume: string;
  market_cap: string;
  holders: string;
  liquidity_lock: string;
  website: string;
  socials: { twitter?: string; telegram?: string };
  creator: string;
  creation_date: string;
  top_holders: Holder[];
  pair_address: string;
  updated_at: string;
}

const formatNumber = (num: string | number) => {
  const n = parseFloat(num.toString());
  if (isNaN(n)) return num.toString();
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

export default function Home() {
  const [address, setAddress] = useState('');
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = async (isRefresh = false) => {
    if (!address) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError('');
      setData(null);
    }

    try {
      const response = await fetch('http://localhost:8000/api/token-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error or invalid address');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-pulse opacity-30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.1)_0%,_transparent_70%)] animate-pulse"></div>
      {/* Futuristic boxes */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-green-400/20 animate-pulse rounded-lg hover:border-green-400/60 hover:scale-110 hover:rotate-12 transition-all duration-500"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 border border-blue-400/20 animate-pulse rounded-lg hover:border-blue-400/60 hover:scale-110 hover:-rotate-12 transition-all duration-500"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-purple-400/20 animate-pulse rounded-lg hover:border-purple-400/60 hover:scale-110 hover:rotate-45 transition-all duration-500"></div>
      <div className="absolute bottom-1/3 right-1/3 w-20 h-20 border border-cyan-400/20 animate-pulse rounded-lg hover:border-cyan-400/60 hover:scale-110 hover:rotate-90 transition-all duration-500"></div>
      <div className="relative z-10 w-full max-w-6xl animate-fade-in">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-green-400 mb-2 drop-shadow-lg hover:scale-105 transition-transform duration-300">BSC Radar</h1>
          <h2 className="text-lg md:text-xl font-semibold text-white hover:text-green-200 transition-colors duration-300">🚀 Fastest way to track BSC tokens in real time!</h2>
        </header>
        <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-green-400/20 mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter BSC token contract address (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 p-3 bg-gray-800 border-2 border-green-400/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                '🔍'
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-400 rounded-xl animate-bounce">
              <p className="text-red-300 font-semibold">⚠️ {error}</p>
            </div>
          )}
          {data && (
            <div className={`mt-8 animate-fade-in-up ${refreshing ? 'animate-pulse' : ''}`}>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-green-400/30 relative">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-green-400">
                    💎 {data.name} ({data.symbol})
                  </h2>
                  <button
                    onClick={() => handleSearch(true)}
                    disabled={refreshing}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded text-sm transition-colors flex items-center"
                  >
                    {refreshing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    ) : (
                      '🔄'
                    )}
                    Refresh
                  </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">Market Cap</div>
                    <div className="text-lg font-bold">{formatNumber(data.market_cap)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">Liquidity</div>
                    <div className="text-lg font-bold">{formatNumber(data.liquidity)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">24h Volume</div>
                    <div className="text-lg font-bold">{formatNumber(data.volume)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">Holders</div>
                    <div className="text-lg font-bold">{data.holders}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-gray-300">Contract Address:</span>
                    <code className="bg-gray-700 px-2 py-1 rounded ml-2 block mt-1 text-sm break-all">{data.contract_address}</code>
                  </div>
                  <div>
                    <span className="text-gray-300">Creator:</span>
                    <span className="ml-2 text-sm">{data.creator}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Creation Date:</span>
                    <span className="ml-2 text-sm">{data.creation_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Socials:</span>
                    <div className="flex space-x-4 mt-2">
                      {data.website && (
                        <a href={data.website} className="text-green-400 hover:text-green-300 text-sm flex items-center" target="_blank" rel="noopener noreferrer">
                          🌐 Website
                        </a>
                      )}
                      {data.socials?.telegram && (
                        <a href={data.socials.telegram} className="text-blue-400 hover:text-blue-300 text-sm flex items-center" target="_blank" rel="noopener noreferrer">
                          <img src="https://tse4.mm.bing.net/th/id/OIP.xi-mrr_FvrjQyJIblVOHRQHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Telegram" className="w-4 h-4 mr-1" />
                          Telegram
                        </a>
                      )}
                      {data.socials?.twitter && (
                        <a href={data.socials.twitter} className="text-blue-500 hover:text-blue-400 text-sm flex items-center" target="_blank" rel="noopener noreferrer">
                          <img src="https://tse2.mm.bing.net/th/id/OIP.cGEsElhgME4kutfUbbKZ0gAAAA?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" alt="X" className="w-4 h-4 mr-1" />
                          X
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="relative">
                  <iframe
                    src={`https://www.tradingview.com/widgetembed/?symbol=BINANCE:${data.symbol}BNB&interval=D&hidesidetoolbar=1&theme=dark&symboledit=1&saveimage=0`}
                    width="100%"
                    height="600"
                    className="rounded-lg border border-green-400/20"
                  ></iframe>
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-gray-300">
                    Live Chart
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
