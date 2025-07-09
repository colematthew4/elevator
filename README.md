## Problem Description

Design a simulator for an elevator control system. You may assume (for now) that the building has ten
floors and only one elevator car. In the elevator lobby on each floor there are two buttons, one to call
the elevator in the Up direction and one for the Down direction. When the passenger enters the elevator
car, they press a button to indicate their desired destination floor.

It should model user interactions from outside the elevator (pressing up/down buttons) and inside the
elevator (pressing a button for a floor). To simplify the design, assume that the elevator moves up (or
down) one floor per time unit. The process of opening and closing the doors, and passengers entering
and exiting the elevator car, happens instantaneously (takes no time).

We will provide you test cases that involve multiple user requests spaced out in time and ask that you
demonstrate how your elevator responds to those requests. Here is an example test case:
- The elevator car begins at the lobby (floor 1).
- At time 0, a user on floor 3 presses the “Down” request button. Their destination is floor 2.
- At time 1, a user on floor 10 presses the “Down” request button. Their destination is floor 1.

It is up to you to determine how to serve those requests, but we expect the simulator to output the
current state of the elevator at each “tick” of time. It might look something like:
`{ time: 1, direction: Up, floor: 2 }`

We also expect the simulator to process passengers embarking/disembarking based on requested
stops - simulating the passenger entering the elevator, pressing an internal floor button and ultimately
departing at their destination floor.

We’ll have you walk through your code and the underlying assumptions you made and then run a few
additional test scenarios. Time permitting, we will discuss how you would alter your approach as new
requirements or constraints are added, such as multiple cars, express elevators, service floors, etc.

## Requirements

- defaults to 10 floor building, single elevator
- user can request an elevator to go down or up
- user selects floor after elevator is requested
- elevator moves 1 floor per Unit of Time (UoT)
  - opening/closing doors, entering/exiting elevator takes no UoT
- retrieve elevator state at current UoT

### Questions/Assumptions

- can a user select a higher floor if they requested the elevator to go down?
  - ❌ skip for now
- can a user access all floors?
  - baseline, yes
  - subject to change
- can UoT pass with no action from the elevator?
  - no, UoT describes the movements of the elevator, not a "clock"
- how do we simulate UoT in order to queue up user actions?
  - ✅ default to pass one UoT per second
- should user actions for *requesting an elevator* and *selecting the floor* be separate?
  - they don't take UoT, so that implies they can be combined
  - what if user requests an elevator, but never enters the elevator?
- how to prioritize multiple requests?
  - ✅ by direction, then closest floor
  - how to prioritize ties?
    - currently floor 5, simultaneous requests for (down, floor 3) and (up, floor 7)
      - if we prioritize up, other requests could come on higher floors to go down and can pass through the whole building
      - if we prioritize down, can serve potential up requests from lower floors
    - currently floor 3, simultaneous requests for (up, floor 1) and (down, floor 5)
      - is it more important for users to leave building or enter it?
    - ✅ in case of equal distance floors, prioritize higher floors

### Scenarios

<!-- elevator handles successive up requests
req = { up, 3 to 7 }                    state = { floor: 1, to: [3, 7] }
req = { up, 4 to 5 }                    state = { floor: 2, to: [3, 4, 5, 7] }
                                        state = { floor: 3, to: [4, 5, 7] }
                                        state = { floor: 4, to: [5, 7] }
                                        state = { floor: 5, to: [7] }
                                        state = { floor: 6, to: [7] }
                                        state = { floor: 7, to: [] }
-->
<!-- elevator handles an up request followed by a down request
req = { up, 5 to 7 }                    state = { floor: 10, to: [5, 7] }
                                        state = { floor: 9, to: [5, 7] }
req = { dn, 9 to 7 }                    state = { floor: 8, to: [5, 7, 9, 7] }
                                        state = { floor: 7, to: [5, 7, 9, 7] }
                                        state = { floor: 6, to: [5, 7, 9, 7] }
                                        state = { floor: 5, to: [7, 9, 7] }
                                        state = { floor: 6, to: [7, 9, 7] }
                                        state = { floor: 7, to: [9, 7] }
                                        state = { floor: 8, to: [9, 7] }
                                        state = { floor: 9, to: [7] }
                                        state = { floor: 8, to: [7] }
                                        state = { floor: 7, to: [] }
-->
<!-- elevator handles a down request followed by an up request
req = { dn, 7 to 5 }                    state = { floor: 10, to: [7, 5] }
                                        state = { floor: 9, to: [7, 5] }
req = { up, 7 to 9 }                    state = { floor: 8, to: [7, 5, 7, 9] }
                                        state = { floor: 7, to: [5, 7, 9] }
                                        state = { floor: 6, to: [5, 7, 9] }
                                        state = { floor: 5, to: [7, 9] }
                                        state = { floor: 6, to: [7, 9] }
                                        state = { floor: 7, to: [9] }
                                        state = { floor: 8, to: [9] }
                                        state = { floor: 9, to: [] }
-->
<!-- elevator handles simultaneous up and down requests
req = { up, 7 to 9 }, { dn, 3 to 1 }    state = { floor: 5, to: [7, 9, 3, 1] }
                                        state = { floor: 6, to: [7, 9, 3, 1] }
                                        state = { floor: 7, to: [9, 3, 1] }
                                        state = { floor: 8, to: [9, 3, 1] }
                                        state = { floor: 9, to: [3, 1] }
                                        state = { floor: 8, to: [3, 1] }
                                        state = { floor: 7, to: [3, 1] }
                                        state = { floor: 6, to: [3, 1] }
                                        state = { floor: 5, to: [3, 1] }
                                        state = { floor: 4, to: [3, 1] }
                                        state = { floor: 3, to: [1] }
                                        state = { floor: 2, to: [1] }
                                        state = { floor: 1, to: [] }
-->
<!-- elevator handles a stream of requests
req = { up, 7 to 9 }                    state = { floor: 2, to: [7, 9] }
req = { dn, 3 to 1 }                    state = { floor: 3, to: [7, 9, 3, 1] }
req = { dn, 8 to 2 }                    state = { floor: 4, to: [7, 9, 8, 3, 2, 1] }
                                        state = { floor: 5, to: [7, 9, 8, 3, 2, 1] }
                                        state = { floor: 6, to: [7, 9, 8, 3, 2, 1] }   * put extra req here?
                                        state = { floor: 7, to: [9, 8, 3, 2, 1] }
                                        state = { floor: 8, to: [9, 8, 3, 2, 1] }
                                        state = { floor: 9, to: [8, 3, 2, 1] }
                                        state = { floor: 8, to: [3, 2, 1] }
                                        state = { floor: 7, to: [3, 2, 1] }
req = { up, 3 to 6 }                    state = { floor: 6, to: [3, 2, 1, 3, 6] }
                                        state = { floor: 5, to: [3, 2, 1, 3, 6] }
                                        state = { floor: 4, to: [3, 2, 1, 3, 6] }
                                        state = { floor: 3, to: [2, 1, 3, 6] }
                                        state = { floor: 2, to: [1, 3, 6] }
                                        state = { floor: 1, to: [3, 6] }
                                        state = { floor: 2, to: [3, 6] }
                                        state = { floor: 3, to: [6] }
                                        state = { floor: 4, to: [6] }   * put extra req here?
                                        state = { floor: 5, to: [6] }
                                        state = { floor: 6, to: [] }
-->
<!-- elevator handles successive down requests
req = { dn, from: 3, to: 2 }            state = { floor: 1, to: [3, 2] }
req = { dn, from: 10, to: 1 }           state = { floor: 2, to: [3, 2] }
                                        state = { floor: 3, to: [10, 3, 2, 1] }
                                        state = { floor: 4, to: [10, 3, 2, 1] }
                                        state = { floor: 5, to: [10, 3, 2, 1] }
                                        state = { floor: 6, to: [10, 3, 2, 1] }
                                        state = { floor: 7, to: [10, 3, 2, 1] }
                                        state = { floor: 8, to: [10, 3, 2, 1] }
                                        state = { floor: 9, to: [10, 3, 2, 1] }
                                        state = { floor: 10, to: [3, 2, 1] }
                                        state = { floor: 9, to: [3, 2, 1] }
                                        state = { floor: 8, to: [3, 2, 1] }
                                        state = { floor: 7, to: [3, 2, 1] }
                                        state = { floor: 6, to: [3, 2, 1] }
                                        state = { floor: 5, to: [3, 2, 1] }
                                        state = { floor: 4, to: [3, 2, 1] }
                                        state = { floor: 3, to: [2, 1] }
                                        state = { floor: 2, to: [1] }
                                        state = { floor: 1, to: [] }
-->

### Architecture/Design

- "event loop" to collect elevator states
- state machine to keep track of where elevator is
- given the ability to serve multiple requests of same directionality, a priority queue seems ideal to "sort" the elevator stops

#### event loop

```
while `request queue` is not empty
  check queue for new requests
  if on same floor as outside request
    begin serving outside request
    log state
    next tick

  if reached floor of outside request
    queue inside request
  if reached floor of inside request
    log state
    next tick

  if (out/in)side request is above current floor
    move up
    log state
    next tick
  else if (out/in)side request is below current floor
    move down
    log state
    next tick
```

#### floor request prioritization

```
if elevator moving up
  if A and B are requests to go up
    select min floor of A and B
  if A and B are requests to go down
    prioritize up requests
  if A and B are in opposite directions
    prioritize whichever is up
if elevator moving down
  if A and B are requests to go up
    prioritize down requests
  if A and B are requests to go down
    select max floor of A and B
  if A and B are in opposite directions
    prioritize whichever is down
```
