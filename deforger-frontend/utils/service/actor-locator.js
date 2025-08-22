import {
  createActor as createBackendActor,
  canisterId as backendCanisterId,
} from "../../src/declarations/backend";

export const makeActor = (canisterId, createActor) => {
  return createActor(canisterId, {
    agentOptions: {
      host: "http://127.0.0.1:4943",
    },
  });
};

export function makeBackendActor() {
  return makeActor(backendCanisterId, createBackendActor);
}
