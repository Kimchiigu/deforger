import { ActorSubclass, HttpAgentOptions } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import {
  createActor as createBackendActor,
  canisterId as backendCanisterId,
} from "@/src/declarations/backend";

import {
  _SERVICE as BackendService,
} from "@/src/declarations/backend/backend.did";

type CreateActorFn<T> = (
  canisterId: string | Principal,
  options?: { agentOptions?: HttpAgentOptions }
) => ActorSubclass<T>;

export const makeActor = <T>(
  canisterId: string,
  createActor: CreateActorFn<T>
): ActorSubclass<T> => {
  return createActor(canisterId, {
    agentOptions: {
      host: "http://127.0.0.1:4943",
    },
  });
};

export function makeBackendActor(): ActorSubclass<BackendService> {
  return makeActor(backendCanisterId, createBackendActor);
}
