import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";

import {
  idlFactory as backendIdlFactory,
  canisterId as backendCanisterId,
} from "@/declarations/backend";

import { _SERVICE as BackendService } from "@/declarations/backend/backend.did";

const createAgent = () => {
  const host =
    process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
      ? "http://127.0.0.1:4943"
      : "https://icp-api.io";

  const agent = new HttpAgent({ host });

  if (process.env.NEXT_PUBLIC_DFX_NETWORK === "local") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  return agent;
};

const agent = createAgent();

export const backendActor: ActorSubclass<BackendService> = Actor.createActor(
  backendIdlFactory,
  {
    agent,
    canisterId: backendCanisterId,
  }
);
