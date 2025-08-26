"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
// UPDATED: Import AreaChart and Area, but keep Line for the indicator
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Copy,
  QrCode,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";

// Mock data remains the same...
const rwaTokens = [
  {
    id: "AWAP",
    name: "Awesome App", 
    symbol: "$AWAP",
    price: 5.25,
    change24h: 0.15,
    changePercent: 13.6,
    high24h: 5.32,
    low24h: 5.08,
    marketCap: 1250000,
    volume24h: 85430,
    logo: "/awesome-app-logo.png",
    rsi: 68.5,
    macd: 0.025,
    ma20: 5.18,
    ma50: 5.12,
  },
  {
    id: "SYOS",
    name: "Synergy OS",
    symbol: "$SYOS", 
    price: 4.50,
    change24h: -0.25,
    changePercent: -9.1,
    high24h: 4.80,
    low24h: 4.25,
    marketCap: 1500000,
    volume24h: 234560,
    logo: "/synergy-os-logo.png",
    rsi: 32.1,
    macd: -0.15,
    ma20: 4.62,
    ma50: 4.78,
  },
  {
    id: "QLEAP",
    name: "Quantum Leap",
    symbol: "$QLEAP",
    price: 3.75,
    change24h: 0.25,
    changePercent: 16.7,
    high24h: 4.0,
    low24h: 3.2,
    marketCap: 875000,
    volume24h: 156780,
    logo: "/quantum-leap-logo.png",
    rsi: 72.3,
    macd: 0.15,
    ma20: 3.62,
    ma50: 3.48,
  },
  {
    id: "DFORGE",
    name: "DeForger Platform",
    symbol: "$DFORGE",
    price: 4.85,
    change24h: 0.35,
    changePercent: 5.1,
    high24h: 5.2,
    low24h: 4.48,
    marketCap: 1100000,
    volume24h: 198450,
    logo: "/deforger-logo.png",
    rsi: 58.7,
    macd: 0.08,
    ma20: 4.71,
    ma50: 4.66,
  },
];

const generateChartData = (tokenIds: string[], timeframe: string) => {
  const dataPoints =
    timeframe === "1H"
      ? 60
      : timeframe === "24H"
      ? 24
      : timeframe === "7D"
      ? 7
      : 30;
  const data = [];

  for (let i = 0; i < dataPoints; i++) {
    const point: any = {
      time: `${i}${timeframe === "1H" ? "m" : timeframe === "24H" ? "h" : "d"}`,
    };

    tokenIds.forEach((tokenId) => {
      const token = rwaTokens.find((t) => t.id === tokenId);
      if (token) {
        const basePrice = token.price;
        const volatility =
          tokenId === "SYOS" ? 0.8 : tokenId === "QLEAP" ? 0.6 : 0.4;
        point[tokenId] = basePrice + (Math.random() - 0.5) * volatility;
        point[`${tokenId}_ma20`] = token.ma20 + (Math.random() - 0.5) * 0.2;
        point[`${tokenId}_volume`] =
          (token.volume24h * (0.8 + Math.random() * 0.4)) / dataPoints;
      }
    });

    data.push(point);
  }
  return data;
};

// Mock user data
const userHoldings = [
  { project: "Awesome App", token: "$AWAP", amount: 250.0, value: 312.5 },
  { project: "Synergy OS", token: "$SYOS", amount: 50.0, value: 1250.0 },
];

const recentTrades = [
  { date: "2024-01-15", type: "Buy", amount: 100, price: 1.2, total: 120.0 },
  { date: "2024-01-14", type: "Sell", amount: 50, price: 1.18, total: 59.0 },
  { date: "2024-01-13", type: "Buy", amount: 200, price: 1.15, total: 230.0 },
];

const timeframes = ["1H", "24H", "7D", "1M", "1Y", "ALL"];

interface RWAExchangePageProps {
  onBack?: () => void;
}

export function RWAExchangePage({ onBack }: RWAExchangePageProps) {
  const [selectedToken, setSelectedToken] = useState(rwaTokens[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24H");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [depositAddress] = useState(
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  );
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [comparisonTokens, setComparisonTokens] = useState<string[]>([
    selectedToken.id,
  ]);
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [marketCapFilter, setMarketCapFilter] = useState({ min: "", max: "" });
  const [filteredTokens, setFilteredTokens] = useState(rwaTokens);

  const applyFilters = () => {
    let filtered = rwaTokens;

    if (priceFilter.min) {
      filtered = filtered.filter(
        (token) => token.price >= Number.parseFloat(priceFilter.min)
      );
    }
    if (priceFilter.max) {
      filtered = filtered.filter(
        (token) => token.price <= Number.parseFloat(priceFilter.max)
      );
    }
    if (marketCapFilter.min) {
      filtered = filtered.filter(
        (token) => token.marketCap >= Number.parseFloat(marketCapFilter.min)
      );
    }
    if (marketCapFilter.max) {
      filtered = filtered.filter(
        (token) => token.marketCap <= Number.parseFloat(marketCapFilter.max)
      );
    }

    setFilteredTokens(filtered);
  };

  const clearFilters = () => {
    setPriceFilter({ min: "", max: "" });
    setMarketCapFilter({ min: "", max: "" });
    setFilteredTokens(rwaTokens);
  };

  const toggleTokenComparison = (tokenId: string) => {
    if (comparisonTokens.includes(tokenId)) {
      setComparisonTokens(comparisonTokens.filter((id) => id !== tokenId));
    } else if (comparisonTokens.length < 4) {
      setComparisonTokens([...comparisonTokens, tokenId]);
    }
  };

  const chartData = generateChartData(comparisonTokens, selectedTimeframe);
  const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const chartConfig = comparisonTokens.reduce((acc, tokenId, index) => {
    const token = rwaTokens.find((t) => t.id === tokenId);
    if (token) {
      acc[tokenId] = {
        label: token.symbol,
        color: colors[index % colors.length],
      };
    }
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover-text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <h1 className="text-3xl font-bold gradient-text">
          Project RWA Exchange
        </h1>
      </div>

      {/* Main Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (takes up more space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Token Selector */}
          <Card className="glass">
            <CardContent className="p-6">
              <Label
                htmlFor="token-select"
                className="text-sm font-medium mb-2 block"
              >
                Primary Token
              </Label>
              <Select
                value={selectedToken.id}
                onValueChange={(value) => {
                  const token = filteredTokens.find((t) => t.id === value);
                  if (token) {
                    setSelectedToken(token);
                    // Also update comparison token if it was the only one selected
                    if (comparisonTokens.length <= 1) {
                      setComparisonTokens([token.id]);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Search Project Token" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-2xl">
                  {filteredTokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      <div className="flex items-center gap-2 ">
                        <img
                          src={token.logo || "/placeholder.svg"}
                          alt={token.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>
                          {token.name} ({token.symbol})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Selected Token Header */}
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <img
                  src={selectedToken.logo || "/placeholder.svg"}
                  alt={selectedToken.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedToken.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedToken.symbol}
                  </p>
                </div>
                {comparisonTokens.length > 1 && (
                  <div className="ml-auto">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Comparing {comparisonTokens.length} tokens
                    </Badge>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Price</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedToken.price)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">24h Change</p>
                  <p
                    className={`text-lg font-semibold flex items-center gap-1 ${
                      selectedToken.changePercent > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedToken.changePercent > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {selectedToken.changePercent.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">24h High</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedToken.high24h)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">24h Low</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedToken.low24h)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Market Cap</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedToken.marketCap)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volume (24h)</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedToken.volume24h)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ====================================================================== */}
          {/* CHART SECTION - MODIFIED                        */}
          {/* ====================================================================== */}
          <Card className="glass">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Price Chart
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  {timeframes.map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={
                        selectedTimeframe === timeframe ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={
                        selectedTimeframe === timeframe
                          ? "gradient-primary text-white"
                          : ""
                      }
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {/* USE AREA CHART */}
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} stroke="#374151" />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      stroke="#9CA3AF"
                    />
                    <YAxis tickLine={false} axisLine={false} stroke="#9CA3AF" />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    {/* DEFINE GRADIENTS DYNAMICALLY */}
                    <defs>
                      {comparisonTokens.map((tokenId, index) => (
                        <linearGradient
                          key={`gradient-${tokenId}`}
                          id={`fill-${tokenId}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={colors[index % colors.length]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={colors[index % colors.length]}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    {/* MAP TO AREA COMPONENTS */}
                    {comparisonTokens.map((tokenId, index) => (
                      <Area
                        key={tokenId}
                        dataKey={tokenId}
                        type="natural"
                        fill={`url(#fill-${tokenId})`}
                        fillOpacity={0.4}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        name={rwaTokens.find((t) => t.id === tokenId)?.symbol}
                      />
                    ))}
                    {/* KEEP LINE FOR TECHNICAL INDICATOR */}
                    {showTechnicalIndicators &&
                      comparisonTokens.length === 1 && (
                        <Line
                          type="monotone"
                          dataKey={`${comparisonTokens[0]}_ma20`}
                          stroke="#F59E0B"
                          strokeWidth={1.5}
                          strokeDasharray="5 5"
                          dot={false}
                          name="MA(20)"
                        />
                      )}
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

              {comparisonTokens.length > 1 && (
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
                  {comparisonTokens.map((tokenId, index) => {
                    const token = rwaTokens.find((t) => t.id === tokenId);
                    if (!token) return null;
                    return (
                      <div key={tokenId} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                        <span className="text-sm">{token.symbol}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(token.price)}
                        </span>
                        <Badge
                          variant={
                            token.changePercent > 0 ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {token.changePercent > 0 ? "+" : ""}
                          {token.changePercent.toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Filters & Actions) - NO CHANGES HERE */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters Panel */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Filters & Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Price Range (USD)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Min"
                    value={priceFilter.min}
                    onChange={(e) =>
                      setPriceFilter((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="text-xs"
                  />
                  <Input
                    placeholder="Max"
                    value={priceFilter.max}
                    onChange={(e) =>
                      setPriceFilter((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Market Cap Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Min"
                    value={marketCapFilter.min}
                    onChange={(e) =>
                      setMarketCapFilter((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="text-xs"
                  />
                  <Input
                    placeholder="Max"
                    value={marketCapFilter.max}
                    onChange={(e) =>
                      setMarketCapFilter((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={applyFilters}
                  size="sm"
                  className="gradient-primary text-white flex-1"
                >
                  Apply
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                >
                  Clear
                </Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="technical-indicators"
                    checked={showTechnicalIndicators}
                    onCheckedChange={(checked) =>
                      setShowTechnicalIndicators(Boolean(checked))
                    }
                  />
                  <Label htmlFor="technical-indicators" className="text-sm">
                    Show Technical Indicators
                  </Label>
                </div>

                <Label className="text-sm font-medium">
                  Compare Tokens (Max 4)
                </Label>
                <div className="space-y-2 mt-2">
                  {filteredTokens.map((token) => (
                    <div key={token.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`compare-${token.id}`}
                        checked={comparisonTokens.includes(token.id)}
                        onCheckedChange={() => toggleTokenComparison(token.id)}
                        disabled={
                          !comparisonTokens.includes(token.id) &&
                          comparisonTokens.length >= 4
                        }
                      />
                      <Label
                        htmlFor={`compare-${token.id}`}
                        className="text-xs flex items-center gap-2"
                      >
                        <img
                          src={token.logo || "/placeholder.svg"}
                          alt={token.name}
                          className="w-4 h-4 rounded-full"
                        />
                        {token.symbol}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {showTechnicalIndicators && (
                <div className="pt-4 border-t border-border/50">
                  <Label className="text-sm font-medium mb-2 block">
                    Technical Analysis
                  </Label>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>RSI (14):</span>
                      <Badge
                        variant={
                          selectedToken.rsi > 70
                            ? "destructive"
                            : selectedToken.rsi < 30
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedToken.rsi.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>MACD:</span>
                      <Badge
                        variant={
                          selectedToken.macd > 0 ? "default" : "destructive"
                        }
                      >
                        {selectedToken.macd > 0 ? "+" : ""}
                        {selectedToken.macd.toFixed(3)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>MA(20):</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(selectedToken.ma20)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MA(50):</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(selectedToken.ma50)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Panel */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Trade {selectedToken.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="buy">Buy/Sell</TabsTrigger>
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="pt-4">
                  <Tabs defaultValue="buy-tab" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="buy-tab">Buy</TabsTrigger>
                      <TabsTrigger value="sell-tab">Sell</TabsTrigger>
                    </TabsList>

                    <TabsContent value="buy-tab" className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="buy-amount">
                          Amount ({selectedToken.symbol})
                        </Label>
                        <Input
                          id="buy-amount"
                          type="number"
                          placeholder="0.00"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Total (USD)</Label>
                        <p className="text-lg font-semibold">
                          {formatCurrency(
                            (Number.parseFloat(buyAmount) || 0) *
                              selectedToken.price
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available Balance: $500.00 USD
                      </p>
                      <Button className="w-full gradient-primary text-white">
                        Buy {selectedToken.symbol}
                      </Button>
                    </TabsContent>

                    <TabsContent value="sell-tab" className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="sell-amount">
                          Amount ({selectedToken.symbol})
                        </Label>
                        <Input
                          id="sell-amount"
                          type="number"
                          placeholder="0.00"
                          value={sellAmount}
                          onChange={(e) => setSellAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Total (USD)</Label>
                        <p className="text-lg font-semibold">
                          {formatCurrency(
                            (Number.parseFloat(sellAmount) || 0) *
                              selectedToken.price
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available Balance: 250.00 {selectedToken.symbol}
                      </p>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Sell {selectedToken.symbol}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="deposit" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Deposit ICP to your DeForger wallet to begin trading.
                  </p>
                  <div>
                    <Label>Wallet Address</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={depositAddress}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button size="icon" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="withdraw-address">
                      Destination Address
                    </Label>
                    <Input
                      id="withdraw-address"
                      placeholder="Enter ICP address"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdraw-amount">Amount (ICP)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available to Withdraw: 45.5 ICP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Withdrawal fee: 0.001 ICP
                  </p>
                  <Button className="w-full gradient-primary text-white">
                    Withdraw Funds
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Holdings and History - NO CHANGES HERE */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* My RWA Holdings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>My RWA Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userHoldings.map((holding, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div>
                    <p className="font-medium">{holding.project}</p>
                    <p className="text-sm text-muted-foreground">
                      {holding.token}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatNumber(holding.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(holding.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrades.map((trade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div>
                    <p className="font-medium">{trade.date}</p>
                    <p
                      className={`text-sm ${
                        trade.type === "Buy" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.type} {trade.amount} {selectedToken.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(trade.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(trade.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
