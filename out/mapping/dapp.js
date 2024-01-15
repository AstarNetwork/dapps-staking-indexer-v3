"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStakersCount = exports.updateBeneficiary = exports.updateOwner = exports.unregisterDapp = exports.registerDapp = void 0;
const model_1 = require("../model");
const utils_1 = require("../utils");
const typeorm_1 = require("typeorm");
function registerDapp(event) {
    return new model_1.Dapp({
        dappId: event.args.dappId,
        id: (0, utils_1.getContractAddress)(event.args.smartContract),
        owner: (0, utils_1.getSs58Address)(event.args.owner),
        state: model_1.DappState.Registered,
        registeredAt: BigInt(event.block.timestamp ?? 0),
        registrationBlockNumber: event.block.height,
        stakersCount: 0,
    });
}
exports.registerDapp = registerDapp;
async function unregisterDapp(ctx, event) {
    const dapp = await getDapp(ctx, event.args.smartContract);
    if (dapp) {
        dapp.state = model_1.DappState.Unregistered;
        dapp.unregisteredAt = BigInt(event.block.timestamp ?? 0);
        dapp.unregistrationBlockNumber = event.block.height;
        return dapp;
    }
    else {
        ctx.log.warn(`${event.name}:: Dapp ${event.args.address} not found.`);
    }
    return undefined;
}
exports.unregisterDapp = unregisterDapp;
async function updateOwner(ctx, event) {
    const dapp = await getDapp(ctx, event.args.smartContract);
    if (dapp) {
        dapp.owner = (0, utils_1.getSs58Address)(event.args.newOwner);
        return dapp;
    }
    else {
        ctx.log.warn(`${event.name}:: Dapp ${event.args.address} not found.`);
    }
    return undefined;
}
exports.updateOwner = updateOwner;
async function updateBeneficiary(ctx, event) {
    const dapp = await getDapp(ctx, event.args.smartContract);
    if (dapp) {
        dapp.beneficiary = (0, utils_1.getSs58Address)(event.args.beneficiary);
        return dapp;
    }
    else {
        ctx.log.warn(`${event.name}:: Dapp ${event.args.address} not found.`);
    }
    return undefined;
}
exports.updateBeneficiary = updateBeneficiary;
async function updateStakersCount(entities, dapp, dappAggregated, stakersCountAggregated, event, day, stake, ctx) {
    const newSubperiod = await ctx.store.findOneBy(model_1.Subperiod, {
        timestamp: BigInt(day),
    });
    if (newSubperiod && newSubperiod.type === "Voting") {
        return;
    }
    if (stakersCountAggregated) {
        const entity = entities.StakersCountAggregatedDailyToUpdate.find((e) => e.id === day.toString());
        if (entity) {
            entity.stakersCount = stakersCountAggregated.stakersCount + dapp.stakersCount;
        }
        else {
            stakersCountAggregated.stakersCount = +dapp.stakersCount;
            entities.StakersCountAggregatedDailyToUpdate.push(stakersCountAggregated);
        }
    }
    else {
        const entity = entities.StakersCountAggregatedDailyToInsert.find((e) => e.id === day.toString());
        if (entity) {
            entity.stakersCount = dapp.stakersCount;
        }
        else {
            entities.StakersCountAggregatedDailyToInsert.push(new model_1.StakersCountAggregatedDaily({
                id: day.toString(),
                blockNumber: event.block.height,
                stakersCount: dapp.stakersCount,
            }));
        }
    }
    if (dappAggregated) {
        const entity = entities.StakersCountToUpdate.find((e) => e.timestamp === BigInt(day) && e.dappAddress === stake.dappAddress);
        if (entity) {
            entity.stakersCount = dapp.stakersCount;
        }
        else {
            dappAggregated.stakersCount = dapp.stakersCount;
            entities.StakersCountToUpdate.push(dappAggregated);
        }
    }
    else {
        const entity = entities.StakersCountToInsert.find((e) => e.timestamp === BigInt(day) && e.dappAddress === stake.dappAddress);
        if (entity) {
            entity.stakersCount = dapp.stakersCount;
        }
        else {
            entities.StakersCountToInsert.push(new model_1.DappAggregatedDaily({
                id: event.id,
                timestamp: BigInt(day),
                dappAddress: stake.dappAddress,
                stakersCount: dapp.stakersCount,
            }));
        }
    }
}
async function handleStakersCount(ctx, stake, entities, event) {
    const dapp = await ctx.store.findOneBy(model_1.Dapp, { id: stake.dappAddress });
    const stakes = await ctx.store.findBy(model_1.Stake, {
        dappAddress: stake.dappAddress,
        stakerAddress: stake.stakerAddress,
        expiredAt: (0, typeorm_1.IsNull)(),
    });
    stakes.push(stake); // Current stake is not yet in the db.
    const day = (0, utils_1.getFirstTimestampOfTheDay)(event.block.timestamp ?? 0);
    const dappAggregated = await ctx.store.findOneBy(model_1.DappAggregatedDaily, {
        timestamp: BigInt(day),
        dappAddress: stake.dappAddress,
    });
    const stakersCountAggregated = await ctx.store.findOneBy(model_1.StakersCountAggregatedDaily, {
        id: day.toString(),
    });
    const totalStake = stakes.reduce((a, b) => a + b.amount, 0n);
    if (dapp &&
        (stakes.length === 1 || (stakes.length > 1 && totalStake === stake.amount))) {
        // user stakes the first time or stakes again after un-staking everything before.
        dapp.stakersCount++;
        stakersCountAggregated && stakersCountAggregated.stakersCount++;
        updateStakersCount(entities, dapp, dappAggregated, stakersCountAggregated, event, day, stake, ctx);
        return dapp;
    }
    else if (dapp && totalStake === 0n) {
        // user un-stakes everything.
        dapp.stakersCount--;
        stakersCountAggregated && stakersCountAggregated.stakersCount--;
        updateStakersCount(entities, dapp, dappAggregated, stakersCountAggregated, event, day, stake, ctx);
        return dapp;
    }
    else if (dapp) {
        // user stakes again after un-staking some amount.
        updateStakersCount(entities, dapp, dappAggregated, stakersCountAggregated, event, day, stake, ctx);
    }
    return undefined;
}
exports.handleStakersCount = handleStakersCount;
async function getDapp(ctx, dappAddress) {
    const address = (0, utils_1.getContractAddress)(dappAddress);
    const dapp = await ctx.store.findOneBy(model_1.Dapp, { id: address });
    return dapp;
}
