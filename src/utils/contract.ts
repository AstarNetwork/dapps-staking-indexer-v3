import * as ss58 from "@subsquid/ss58";
import { SmartContract } from "../types/v1";

export function getContractAddress(smartContract: SmartContract): string {
  return smartContract.__kind === "Evm"
    ? smartContract.value
    : getSs58Address(smartContract.value);
}

export function getSs58Address(address: string): string {
  return ss58.codec("astar").encode(address);
}
