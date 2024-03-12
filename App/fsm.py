from enum import Enum

class State(Enum):
    Start = 0
    At_Stack = 1
    Carrying_Chair = 2
    At_Chair_Position = 3
    Placed_Chair = 4
    End = 5

def control_loop_placing(state):
    match state:
        case State.Start:
            state = move_to_stack()
        case State.At_Stack:
            state = take_chair_from_stack()
        case State.Carrying_Chair:
            state = move_to_chair_position(position)
        case State.At_Chair_Position:
            state = place_chair()
        case State.Placed_Chair:
            if remaining_chairs > 0:
                state = move_to_stack()
            else:
                state = State.End
        case State.End:
            terminate()
    control_loop_placing(state)  # recurse

def control_loop_stacking(state):
    match state:
        case State.Start:
            state = move_to_chair_position(position)
        case State.At_Chair_Position:
            state = pick_up_chair()
        case State.Carrying_Chair:
            state = move_to_stack()
        case State.At_Stack:
            state = stack_chair()
        case State.Placed_Chair:
            if unstacked_chairs > 0:
                state = move_to_chair_position(position)
            else:
                state = State.End
        case State.End:
            terminate()
    control_loop_placing(state)  # recurse
