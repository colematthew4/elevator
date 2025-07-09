// @ts-ignore
import chalk from 'chalk';
import { ElevatorDirection, ElevatorState } from './elevator';

export function hasReceivedRequest(state: ElevatorState): boolean {
  return !!state.direction;
}

type ElevatorStateOutput = ElevatorState;
export function createNewRequestOutput(state: ElevatorState, direction: ElevatorDirection): ElevatorStateOutput {
  state.direction = direction;
  return { ...state };
}

export function createMovementOutput(state: ElevatorState, direction: ElevatorDirection): ElevatorStateOutput {
  state.direction = direction;
  state.floor += direction === 'up' ? 1 : -1;
  state.time++;
  return { ...state };
}

export function moveElevatorInDirection(state: ElevatorState, direction: ElevatorDirection) {
  return !hasReceivedRequest(state)
    ? createNewRequestOutput(state, direction)
    : createMovementOutput(state, direction);
}

export function isServingRequest(state: ElevatorState): boolean {
  return state.direction === 'up' || state.direction === 'down';
}

const colorizer = new chalk.Instance()
export function debug(arg: any, label = '**********') {
  // console.log(colorizer.green(label), JSON.stringify(arg, null, 2));
}
