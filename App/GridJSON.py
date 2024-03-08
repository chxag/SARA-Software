from dataclasses import dataclass
from typing import List
import json

@dataclass
class Chair:
    location: str
    rotation: int
    chairs: List[int]

class Stack: 
    location: str
    rotation: int
    stacks: List[int]

@dataclass
class Dimension:
    rows: int
    columns: int

@dataclass
class Grid:
    dimensions: Dimension
    robot: str
    stacks: List[Stack]
    chairs: List[Chair]
    obstacles: List[str]

    def __post_init__(self):
        self.stacks = [Stack(**stack) for stack in self.stacks]
        self.chairs = [Chair(**chair) for chair in self.chairs]
        self.dimensions = Dimension(**self.dimensions)
