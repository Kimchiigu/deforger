import type { NextConfig } from "next";
import { EnvironmentPlugin } from "webpack";
import DFXWebPackConfig from "./dfx.webpack.config";

DFXWebPackConfig.initCanisterIds();

const nextConfig: NextConfig = {
  output: "export",
  webpack: (config, { isServer }) => {
    // Make DFX_NETWORK environment variable available to the browser
    // with a default value of "local"
    config.plugins = config.plugins ?? [];
    config.plugins.push(
      new EnvironmentPlugin({
        DFX_NETWORK: "local",
      })
    );

    return config;
  },
  transpilePackages: [
    "react-syntax-highlighter",
    "react-syntax-highlighter/dist/cjs/styles/prism",
  ],
};

console.log("✅ next.config.js loaded successfully!");

export default nextConfig;
