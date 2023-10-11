import {sts, Result, Option, Bytes, BitSequence} from './support'

export const SmartContract: sts.Type<SmartContract> = sts.closedEnum(() => {
    return  {
        Evm: H160,
        Wasm: AccountId32,
    }
})

export const H160 = sts.bytes()

export type SmartContract = SmartContract_Evm | SmartContract_Wasm

export interface SmartContract_Evm {
    __kind: 'Evm'
    value: H160
}

export interface SmartContract_Wasm {
    __kind: 'Wasm'
    value: AccountId32
}

export type AccountId32 = Bytes

export type H160 = Bytes

export const AccountId32 = sts.bytes()
