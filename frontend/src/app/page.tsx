"use client";

import { useState, useEffect } from 'react';

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
  bubblemaps_url: string;
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
  const [showHeading, setShowHeading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeading(true), 500);
    return () => clearTimeout(timer);
  }, []);

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
      if (response.status === 422) {
        setError('Invalid BSC address. Enter a valid BSC address');
      } else if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch data');
        }
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Network error or invalid address');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F0A] to-[#1A2E1A] text-white flex flex-col relative">
      {/* Subtle gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-900/10 to-transparent animate-pulse"></div>
      {/* Radar-like glow pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-green-400/50 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-green-400/50 to-transparent"></div>
        <div className="absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
      </div>

      {/* Header */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-10 z-10">
        <h1
          className="text-xl sm:text-2xl md:text-[22px] font-bold text-[#00FF88] hover:text-[#00FFA0] transition-colors duration-300"
          style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '0.7px' , fontWeight: 900}}
        >
          BSC Radar
        </h1>
      </div>

       {/*Buy $RDR Button*/}
      <div className="absolute top-4 sm:top-8 right-10 sm:right-40 z-10">
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#00FF88] hover:bg-[#00FFA0] text-black font-semibold rounded-lg transition-colors duration-300"
        >
          Buy $RDR
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative z-20 py-10 overflow-y-auto">
        {/* Main Heading */}
        <h2
          className={`font-black text-white text-center leading-tight mb-6 transition-opacity duration-1000 ${showHeading ? 'opacity-100' : 'opacity-0'}`}
          style={{
            fontFamily: 'Archivo Black, sans-serif',
            lineHeight: '2em',
            fontSize: 'clamp(1.5rem, 5vw, 4rem)'
          }}
        >
          Built for degens who need quick info on tokens.
        </h2>

        {/* Subheading */}
        <p
          className="font-normal text-[#D0FFD8] text-center mb-10"
          style={{
            fontFamily: 'Inter, Poppins, sans-serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
          }}
        >
          Fastest way to get necessary leads for BSC tokens.
        </p>

        {/* Search Box */}
        <div className="w-full max-w-md md:max-w-[420px] mb-8">
          <div className="relative flex">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00FF88] text-xl z-10">
              🔍
            </div>
            <input
              type="text"
              placeholder="Enter BSC token address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 h-13 pl-12 pr-32 py-3 bg-black/30 border border-[#00FF88] rounded-xl text-white placeholder-[#A0A0A0] focus:outline-none focus:shadow-[0_0_10px_#00FF88] transition-all duration-300 text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-[#00FF88] hover:bg-[#00FFA0] text-black font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-md mx-auto p-4 bg-red-900/50 border border-red-400 rounded-xl animate-bounce mb-8">
            <p className="text-red-300 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* DexScreener Embed */}
        {data && (
          <div className={`w-full max-w-7xl mx-auto animate-fade-in-up ${refreshing ? 'animate-pulse' : ''} mt-8 px-4 sm:px-6 lg:px-8`}>
            <div className="bg-black/30 p-4 sm:p-6 rounded-xl border border-[#00FF88]/30 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00FF88]">
                  💎 {data.name} ({data.symbol})
                </h2>
                <button
                  onClick={() => handleSearch(true)}
                  disabled={refreshing}
                  className="px-3 py-1 bg-[#00FF88] hover:bg-[#00FFA0] text-black rounded text-sm transition-colors flex items-center"
                >
                  {refreshing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-1"></div>
                  ) : (
                    '🔄'
                  )}
                  Refresh
                </button>
              </div>

              {/* DexScreener Embed */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-[#00FF88]/30 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#00FF88]">📊 DexScreener Analysis</h3>
                  <a
                    href={`https://dexscreener.com/bsc/${data.pair_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#00FF88] hover:bg-[#00FFA0] text-black rounded text-sm transition-colors"
                  >
                    View Full Page ↗
                  </a>
                </div>
                <div className="relative w-full">
                  <iframe
                    src={`https://dexscreener.com/bsc/${data.pair_address}?embed=1&theme=dark`}
                    width="100%"
                    height="500"
                    className="rounded-lg border border-[#00FF88]/20"
                    style={{ minHeight: '500px' }}
                  ></iframe>
                </div>
              </div>

              {/* Bubblemaps Chart */}
              {data.bubblemaps_url && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-[#00FF88]/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#00FF88]">🫧 Holder Distribution(Bubblemaps)</h3>
                    <a
                      href={data.bubblemaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#00FF88] hover:bg-[#00FFA0] text-black rounded text-sm transition-colors"
                    >
                      View Full Page ↗
                    </a>
                  </div>
                  <div className="relative w-full overflow-hidden">
                    <iframe
                      src={data.bubblemaps_url}
                      width="100%"
                      height="500"
                      className="rounded-lg border border-[#00FF88]/20"
                      style={{ minHeight: '500px' }}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);
}
