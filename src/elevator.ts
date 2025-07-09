import { PriorityQueue } from "@datastructures-js/priority-queue";
import { createNewRequestOutput, hasReceivedRequest, isServingRequest, debug, moveElevatorInDirection } from "./utils";

export type ElevatorDirection = 'up' | 'down';
export type ElevatorStateDirection = ElevatorDirection | 'stop';
type ElevatorRequest = {
  direction: ElevatorDirection;
  fromFloor: number;
  toFloor: number;
};
type ElevatorRequestTimeType = ElevatorRequest & {
  id: string;
  time: number;
};
type ElevatorRequestProgress = Pick<ElevatorRequest, 'direction'> & {
  id: string;
  floor: number;
}

export class ElevatorState {
  time: number;
  direction: ElevatorStateDirection;
  floor: number;

  constructor({ time = 0, direction, floor = 1 }: {
    time?: number;
    direction?: ElevatorStateDirection;
    floor?: number;
  } = {}) {
    this.time = time;
    this.direction = direction;
    this.floor = floor;
  }
}

export class ElevatorSimulator {
  floorCount: number;
  state: ElevatorState;
  requests: ElevatorRequestTimeType[];

  constructor({ floorCount = 10, initialState = new ElevatorState(), requests = [] }: {
    floorCount?: number;
    initialState?: ElevatorState;
    requests?: ElevatorRequestTimeType[];
  } = {}) {
    this.floorCount = floorCount;
    this.state = initialState;
    this.requests = requests;
  }

  request(time: number, req: ElevatorRequest): boolean {
    if (
      this.state.time > time ||
      req.toFloor > this.floorCount ||
      req.fromFloor <= 0 || req.toFloor <= 0 ||
      (req.direction === 'up' && req.fromFloor >= req.toFloor) ||
      (req.direction === 'down' && req.fromFloor <= req.toFloor)
    ) {
      // console.warn('L59: Invalid Request', { req }, this.requests);
      return false;
    }

    const id = `i${this.requests.length}t${time}f${req.fromFloor}-${req.toFloor}`;
    if (this.requests.some((req) => req.id === id)) {
      // console.warn('L65: Invalid Request', { id, req }, this.requests);
      return false;
    }

    return Boolean(this.requests.push({
      ...req,
      id,
      time,
    }));
  }

  simulate(): ElevatorState[] {
    if (!this.requests.length) {
      // no requests, so don't move
      return [];
    }

    const output: ElevatorState[] = [];
    const insideRequestMap: Map<string, ElevatorRequestProgress> = new Map();
    let prevState: ElevatorRequestProgress; // TODO - hacky way to capture elevator state prior to queue re-prioritizing

    const queue = new PriorityQueue<ElevatorRequestProgress>((a, b) => {
      let result = -1; // no swap

      if (a.direction === b.direction) {
        result = a.direction === 'up'
          ? a.floor - b.floor     // "sort" floors ascending when going up
          : b.floor - a.floor;    // "sort" floors descending when going down
      } else if (
        // if elevator is already going down and a = up, b = down, prioritize down
        // unless the request is for a floor higher than we are currently at
        (this.state.direction === 'down' && b.direction === 'down' && b.floor < this.state.floor) ||
        // special case of this implementation, where we are between ticks in order to grab new user input
        // like above, if we were going down and a = up, b = down, prioritize down
        (this.state.direction === 'stop' && b.direction === 'down' && prevState?.direction === 'down')
      ) {
        result = 1; // swap
      }
      return result;
    });

    do {
      // console.group(colorizer.green(`********** T${this.state.time} **********`));

      // if time to process requests, queue it
      while (this.state.time === this.requests[0]?.time) {
        const req = this.requests.shift();
        queue.enqueue({
          id: req.id,
          direction: req.direction,
          floor: req.fromFloor,
        });
        insideRequestMap.set(req.id, {
          id: req.id,
          direction: req.direction,
          floor: req.toFloor,
        });
        debug({ queue: queue.toArray() }, 'queueing request');
      }

      const req = queue.front();
      // tick away until you get a request
      if (!req && this.requests.length > 0) {
        // if elevator has been given any requests
        if (hasReceivedRequest(this.state)) {
          this.state.direction = isServingRequest(this.state)
            ? 'stop'
            : this.state.direction;
        }

        output.push({ ...this.state });
        debug({ req, state: this.state, output });
        this.state.time++;
        // console.groupEnd();
        continue;
      }

      debug({ req, state: this.state });

      // landed on a requested floor
      if (this.state.floor === req.floor) {
        if (!isServingRequest(this.state)) {
          // elevator wasn't serving a request, so immediately start it in requested direction
          output.push(createNewRequestOutput(this.state, req.direction));
          debug({ req, state: this.state, output });
          this.state.time++;
        } else {
          // elevator has reached a requested floor
          this.state.direction = 'stop';
        }

        // process user floor selection
        if (insideRequestMap.has(req.id)) {
          prevState = insideRequestMap.get(req.id);
          queue.enqueue({ ...prevState });
          insideRequestMap.delete(prevState.id);
        }
        prevState = queue.dequeue();
      } else if (this.state.floor < req.floor) {
        // move up
        output.push(moveElevatorInDirection(this.state, 'up'));
        debug({ req, state: this.state, output });
      } else if (this.state.floor > req.floor) {
        // move down
        output.push(moveElevatorInDirection(this.state, 'down'));
        debug({ req, state: this.state, output });
      }

      // console.groupEnd();
    } while (!queue.isEmpty() || this.requests.length > 0);

    return output;
  }
}
