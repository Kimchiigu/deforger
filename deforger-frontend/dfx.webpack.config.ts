import { resolve } from "path";

/**
 * Defines the structure for canister ID data, mapping a network name (like 'local' or 'ic')
 * to the canister's principal ID string.
 * @example { "local": "bkyz2-fmaaa-aaaaa-qaaaq-cai", "ic": "b77ix-eeaaa-aaaaa-qaada-cai" }
 */
type CanisterIdData = {
  [network: string]: string,
};

/**
 * Defines the structure of the canister_ids.json file, mapping a canister name
 * to its network-specific ID data.
 */
type CanisterIds = {
  [canisterName: string]: CanisterIdData,
};

let localCanisters: CanisterIds | undefined;
let prodCanisters: CanisterIds | undefined;
let canisters: CanisterIds | undefined;

/**
 * Reads canister IDs from the .dfx folder and the project root,
 * determines the current network, and sets the canister ID environment
 * variables accordingly for the Next.js application.
 */
export function initCanisterIds(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    localCanisters = require(resolve(".dfx", "local", "canister_ids.json"));
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    prodCanisters = require(resolve("canister_ids.json"));
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  const network =
    process.env.DFX_NETWORK ??
    (process.env.NODE_ENV === "production" ? "ic" : "local");

  console.info(`initCanisterIds: network=${network}`);

  canisters = network === "local" ? localCanisters : prodCanisters;

  if (canisters) {
    for (const canisterName in canisters) {
      const canisterId = canisters[canisterName][network];
      if (canisterId) {
        process.env[`NEXT_PUBLIC_${canisterName.toUpperCase()}_CANISTER_ID`] =
          canisterId;
      }
    }
  }
}

export const DFXWebPackConfig = {
  initCanisterIds,
};

export default DFXWebPackConfig;
