from dataclasses import dataclass
from typing import List
import json

@dataclass
class Chair:
    location: str
    rotation: int

class Stack: 
    location: str
    rotation: int
    chairs: List[Chair]

@dataclass
class Dimension:
    rows: int
    columns: int

@dataclass
class Grid:
    dimensions: Dimension
    robot: str
    stacks: List[Stack]
    obstacles: List[str]

    def __post_init__(self):
        self.stacks = [Stack(location=stack['location'], rotation=stack['rotation'], chairs=[Chair(**chair) for chair in stack['chair']]) for stack in self.stacks]
        self.dimensions = Dimension(**self.dimensions)
