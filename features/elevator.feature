Feature: Elevator
  An elevator that goes up and down.

  Background:
    Given the elevator can reach 10 floors

  Scenario: Elevator handles one immediate request
    Given the elevator is at floor 1
    And userA is on floor 3
    When userA requests to go down to floor 2 at time 0
    # Then the elevator stops at floors 3, 2
    Then the elevator stops at floors 1, 2, 3, 2

  Scenario: Elevator handles a late request
    Given the elevator is at floor 1
    And userA is on floor 3
    When userA requests to go down to floor 2 at time 3
    # Then the elevator stops at floors 3, 2
    Then the elevator stops at floors 1, 1, 1, 1, 2, 3, 2

  Scenario: Elevator completes a request and waits for another
    Given the elevator is at floor 1
    And userA is on floor 1
    And userB is on floor 2
    When userA requests to go up to floor 2 at time 0
    And userB requests to go up to floor 5 at time 5
    # Then the elevator stops at floors 1, 2, 5
    Then the elevator stops at floors 1, 2, 2, 2, 2, 2, 3, 4, 5

  Scenario: Elevator handles successive down requests
    Given the elevator is at floor 1
    And userA is on floor 3
    And userB is on floor 10
    When userA requests to go down to floor 2 at time 0
    And userB requests to go down to floor 1 at time 1
    # Then the elevator stops at floors 10, 3, 2, 1
    Then the elevator stops at floors 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1

  Scenario: Elevator handles successive up requests
    Given the elevator is at floor 1
    And userA is on floor 3
    And userB is on floor 4
    When userA requests to go up to floor 7 at time 0
    And userB requests to go up to floor 5 at time 1
    # Then the elevator stops at floors 3, 4, 5, 7
    Then the elevator stops at floors 1, 2, 3, 4, 5, 6, 7

  Scenario: Elevator handles an up request followed by a down request
    Given the elevator is at floor 10
    And userA is on floor 5
    And userB is on floor 9
    When userA requests to go up to floor 7 at time 0
    And userB requests to go down to floor 7 at time 2
    # Then the elevator stops at floors 5, 7, 9, 7
    Then the elevator stops at floors 10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 8, 7

  Scenario: Elevator handles a down request followed by an up request
    Given the elevator is at floor 10
    And userA is on floor 7
    And userB is on floor 7
    When userA requests to go down to floor 5 at time 0
    And userB requests to go up to floor 9 at time 2
    # Then the elevator stops at floors 7, 5, 7, 9
    Then the elevator stops at floors 10, 9, 8, 7, 6, 5, 6, 7, 8, 9

  Scenario: Elevator handles simultaneous up and down requests
    Given the elevator is at floor <start>
    And userA is on floor <userAFrom>
    And userB is on floor <userBFrom>
    When userA requests to go <userADir> to floor <userATo> at time <time>
    And userB requests to go <userBDir> to floor <userBTo> at time <time>
    # Then the elevator stops at floors 7, 9, 3, 1
    Then the elevator stops at floors <answer>
  Examples:
    | start | userAFrom | userATo | userADir | userBFrom | userBTo | userBDir | time | answer                                |
    | 5     | 7         | 9       | up       | 3         | 1       | down     | 0    | 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1 |
    | 5     | 5         | 7       | up       | 5         | 8       | up       | 0    | 5, 6, 7, 8                            |
    | 5     | 5         | 1       | down     | 5         | 3       | down     | 0    | 5, 4, 3, 2, 1                         |

  Scenario: Elevator handles a stream of requests
    Given the elevator is at floor 2
    And userA is on floor 7
    And userB is on floor 3
    And userC is on floor 8
    And userD is on floor 3
    When userA requests to go up to floor 9 at time 0
    And userB requests to go down to floor 1 at time 1
    And userC requests to go down to floor 2 at time 2
    And userD requests to go up to floor 6 at time 10
    # Then the elevator stops at floors 7, 9, 8, 3, 2, 1, 3, 6
    Then the elevator stops at floors 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6
