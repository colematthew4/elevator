import assert from 'assert';
import { Given, When, Then, defineParameterType, World, Before, BeforeAll, After } from "@cucumber/cucumber";
import { ElevatorSimulator, ElevatorDirection } from "../../src/elevator";

// @ts-ignore
import chalk from 'chalk';
const colorizer = new chalk.Instance()

const AndGiven = Given;
// const AndWhen = When;
// const AndThen = Then;

type InitialElevatorRequest = {
  fromFloor: number;
}
type ElevatorRequest = {
  direction: ElevatorDirection;
  toFloor: number;
};

defineParameterType({
  name: 'numericList',
  regexp: /((\d(, )?)+)/,
  transformer: l => JSON.parse(`[${l}]`),
});

type ElevatorTest = World & {
  elevator: ElevatorSimulator;
  requests: Record<string, InitialElevatorRequest | ElevatorRequest>;
  expectedStops: number[];
};

Before(function (scenario) {
  console.log(colorizer.green(scenario.pickle.name));
});

Given('the elevator can reach {int} floors', function (
  this: ElevatorTest, floorCount: number
) {
  this.elevator = new ElevatorSimulator({ floorCount });
});

Given('the elevator is at floor {int}', function (this: ElevatorTest, floor: number) {
  this.elevator.state.floor = floor;
});

AndGiven('{word} is on floor {int}', function (
  this: ElevatorTest, user: string, floor: number
) {
  if (this.requests == null) {
    this.requests = {};
  }

  this.requests[user] = { fromFloor: floor };
});

When('{word} requests to go {word} to floor {int} at time {int}', function (
  this: ElevatorTest, user: string, direction: ElevatorDirection, toFloor: number, time: number
) {
  if (this.requests == null) {
    this.requests = {};
  }

  const request = {
    ...(this.requests[user] as InitialElevatorRequest),
    direction,
    toFloor,
    // time,
  };
  this.requests[user] = request;
  this.elevator.request(time, request);
});

Then('the elevator stops at floors {numericList}', function (this: ElevatorTest, stops: number[]) {
  // this.expectedStops = [];
  // for (
  //   let i = 1,
  //     floors = stops[0] !== this.elevator.state.floor
  //       ? [this.elevator.state.floor, ...stops]
  //       : stops;
  //   i < floors.length;
  //   i++
  // ) {
  //   const window = (floors[i] > floors[i - 1])
  //     ? Array.from({ length: floors[i] - floors[i - 1] + 1 }, (_, idx) => floors[i - 1] + idx)
  //     : Array.from({ length: floors[i - 1] - floors[i] + 1 }, (_, idx) => floors[i - 1] - idx);

  //   // if (this.expectedStops[this.expectedStops.length - 1] === window[0]) {
  //   //   window.shift();
  //   // }

  //   this.expectedStops.push(...window);
  // }
  this.expectedStops = stops;

  const simulation = this.elevator.simulate();
  // console.log(colorizer.green('**********'));
  console.log(JSON.stringify(simulation, null, 2));
  // console.log(this.expectedStops);

  const actualStops = simulation
    // .filter(({ direction }) => direction !== 'stop')
    .map(({ floor }) => floor);
  assert.deepStrictEqual(actualStops, this.expectedStops);
});

/*
if stateDir == up
  if aDir == bDir == up
    return minFloor(a, b)
  if aDir == bDir == down
    return maxFloor(a, b)
  if aDir != bDir
    return isUp(a, b)
if stateDir == down
  if aDir == bDir == up
    return minFloor(a, b)
  if aDir == bDir == down
    return maxFloor(a, b)
  if aDir != bDir
    return isDown(a, b)



if aDir == bDir == up
  return minFloor(a, b)
if aDir == bDir == down
  return maxFloor(a, b)
if aDir != bDir
  if stateDir == up
    return isUp(a, b)
  if stateDir == down
    return isDown(a, b)
*/
