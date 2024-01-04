import {sts, Result, Option, Bytes, BitSequence} from './support'

export const ForcingType: sts.Type<ForcingType> = sts.closedEnum(() => {
    return  {
        Era: sts.unit(),
        Subperiod: sts.unit(),
    }
})

export type ForcingType = ForcingType_Era | ForcingType_Subperiod

export interface ForcingType_Era {
    __kind: 'Era'
}

export interface ForcingType_Subperiod {
    __kind: 'Subperiod'
}

export const Subperiod: sts.Type<Subperiod> = sts.closedEnum(() => {
    return  {
        BuildAndEarn: sts.unit(),
        Voting: sts.unit(),
    }
})

export type Subperiod = Subperiod_BuildAndEarn | Subperiod_Voting

export interface Subperiod_BuildAndEarn {
    __kind: 'BuildAndEarn'
}

export interface Subperiod_Voting {
    __kind: 'Voting'
}

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
