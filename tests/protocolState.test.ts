import {
  getPeriodForBlock,
  getPeriodForEra,
} from "../src/mapping/protocolState";

beforeAll(() => {
  process.env.V3_FIRST_BLOCK = "5335615";
  process.env.V3_PERIOD_LENGTH = "50400";
  process.env.V3_FIRST_ERA = "4303";
  process.env.V3_ERAS_PER_PERIOD = "21";
});

test("calculates proper period for block", () => {
  expect(getPeriodForBlock(6293215)).toBe(20);
  expect(getPeriodForBlock(6293214)).toBe(19);
});

test("calculates proper period for era", () => {
  expect(getPeriodForEra(4681)).toBe(19);
  expect(getPeriodForEra(4702)).toBe(20);
});
