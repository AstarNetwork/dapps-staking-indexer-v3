"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ss58 = require("@subsquid/ss58");
const typeorm_store_1 = require("@subsquid/typeorm-store");
const model_1 = require("./model");
const types_1 = require("./types");
const processor_1 = require("./processor");
function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}
// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor_1.processor.run(new typeorm_store_1.TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
    let stakingEvents = [];
    for (let block of ctx.blocks) {
        for (let event of block.events) {
            if (event.name == types_1.events.dappsStaking.bondAndStake.name) {
                let decoded;
                if (types_1.events.dappsStaking.bondAndStake.v4.is(event)) {
                    let [account, contract, amount] = types_1.events.dappsStaking.bondAndStake.v4.decode(event);
                    decoded = {
                        account,
                        contractAddr: contract.value,
                        amount
                    };
                }
                else {
                    ctx.log.error(`Unknown runtime version for a BondAndState event`);
                    continue;
                }
                console.log('BondAndStake', decoded); // replace with event processing code
                if (event.block.timestamp) {
                    let s = new model_1.StakingEvent({
                        id: event.id,
                        userAddress: decoded.account,
                        transaction: model_1.UserTransactionType.BondAndStake,
                        contractAddress: decoded.contractAddr,
                        amount: decoded.amount,
                        timestamp: BigInt(event.block.timestamp.valueOf()),
                        blockNumber: BigInt(block.header.height),
                    });
                    console.log('BondAndStake', s); // replace with event processing code
                    stakingEvents.push(s);
                }
            }
            else if (event.name == types_1.events.dappsStaking.nominationTransfer.name) {
                let decoded;
                if (types_1.events.dappsStaking.nominationTransfer.v17.is(event)) {
                    let [account, origin, amount, target] = types_1.events.dappsStaking.nominationTransfer.v17.decode(event);
                    decoded = {
                        account,
                        originAddr: origin.value,
                        amount,
                        targetAddr: target.value
                    };
                }
                else {
                    ctx.log.error(`Unknown runtime version for a NominationTransfer event`);
                    continue;
                }
                console.log('NominationTransfer', decoded); // replace with event processing code
                if (event.block.timestamp) {
                    let s = new model_1.StakingEvent({
                        id: event.id,
                        userAddress: ss58.codec('astar').encode(decoded.account),
                        transaction: model_1.UserTransactionType.NominationTransfer,
                        contractAddress: ss58.codec('astar').encode(decoded.targetAddr),
                        amount: decoded.amount,
                        timestamp: BigInt(event.block.timestamp.valueOf()),
                        blockNumber: BigInt(block.header.height),
                    });
                    console.log('NominationTransfer', s); // replace with event processing code
                    stakingEvents.push(s);
                }
            }
            else if (event.name == types_1.events.dappsStaking.unbondAndUnstake.name) {
                let decoded;
                if (types_1.events.dappsStaking.unbondAndUnstake.v12.is(event)) {
                    let [account, contract, amount] = types_1.events.dappsStaking.unbondAndUnstake.v12.decode(event);
                    decoded = {
                        account,
                        contractAddr: contract.value,
                        amount,
                    };
                }
                else {
                    ctx.log.error(`Unknown runtime version for an UnbondAndUnstake event`);
                    continue;
                }
                console.log('UnbondAndUnstake', decoded); // replace with event processing code
                if (event.block.timestamp) {
                    let s = new model_1.StakingEvent({
                        id: event.id,
                        userAddress: ss58.codec('astar').encode(decoded.account),
                        transaction: model_1.UserTransactionType.UnbondAndUnstake,
                        contractAddress: ss58.codec('astar').encode(decoded.contractAddr),
                        amount: decoded.amount,
                        timestamp: BigInt(event.block.timestamp.valueOf()),
                        blockNumber: BigInt(block.header.height),
                    });
                    console.log('UnbondAndUnstake', s); // replace with event processing code
                    stakingEvents.push(s);
                }
            }
        }
    }
    await ctx.store.insert(stakingEvents);
});
