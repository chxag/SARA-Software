from dataclasses import dataclass
from typing import List
import json

@dataclass
class Chair:
    location: str
    rotation: int
    chairs: List[int]


@dataclass
class Dimension:
    rows: int
    columns: int

@dataclass
class Grid:
    dimensions: Dimension
    robot: str
    stacks: List[Chair]
    obstacles: List[str]

    def __post_init__(self):
        self.stacks = [Chair(**chair) for chair in self.stacks]
        self.dimensions = Dimension(**self.dimensions)
