"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Ticker,
  TickerIcon,
  TickerPrice,
  TickerPriceChange,
  TickerSymbol,
} from "@/components/ui/shadcn-io/ticker";

interface MarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  imageUrl: string;
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(261, 100%, 70%)",
  },
  volume: {
    label: "Volume",
    color: "hsl(261, 100%, 70%)",
  },
};

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIcpData() {
      try {
        setIsLoading(true);
        setError(null);

        const [marketDetailsResponse, chartDataResponse] = await Promise.all([
          fetch(
            "https://api.coingecko.com/api/v3/coins/internet-computer?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
          ),
          fetch(
            "https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=10&interval=daily"
          ),
        ]);

        if (!marketDetailsResponse.ok || !chartDataResponse.ok) {
          throw new Error("Failed to fetch data from CoinGecko API");
        }

        const marketDetails = await marketDetailsResponse.json();
        const chartDetails = await chartDataResponse.json();

        setMarketData({
          price: marketDetails.market_data.current_price.usd,
          marketCap: marketDetails.market_data.market_cap.usd,
          volume24h: marketDetails.market_data.total_volume.usd,
          priceChange24h: marketDetails.market_data.price_change_percentage_24h,
          imageUrl: marketDetails.image.small,
        });

        const formattedChartData = chartDetails.prices.map(
          (pricePoint: number[], index: number) => ({
            date: new Date(pricePoint[0]).toISOString(),
            price: pricePoint[1],
            volume: chartDetails.total_volumes[index][1],
          })
        );
        setChartData(formattedChartData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchIcpData();
  }, []); 

  if (isLoading) {
    return <div>Loading Market Data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/40 flex items-center justify-center p-6">
          {marketData && (
            <Ticker className="text-xl">
              <TickerIcon src={marketData.imageUrl} symbol="ICP" />
              <TickerSymbol symbol="ICP" />
              <TickerPrice price={marketData.price} />
              <TickerPriceChange change={marketData.priceChange24h} isPercent />
            </Ticker>
          )}
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Market Cap</CardDescription>
            <CardTitle className="text-2xl">
              {marketData?.marketCap.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total market value</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>24h Volume</CardDescription>
            <CardTitle className="text-2xl">
              {marketData?.volume24h.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total trading volume
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader>
            <CardTitle>Price Chart (10 Days)</CardTitle>
            <CardDescription>
              ICP token price over the last 10 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  domain={["dataMin", "dataMax"]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="price"
                  type="monotone"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader>
            <CardTitle>Trading Volume (10 Days)</CardTitle>
            <CardDescription>
              Daily trading volume over the last 10 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
