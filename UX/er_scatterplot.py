from matplotlib import pyplot as plt

import matplotlib.markers as m
from matplotlib import patches

import numpy as np

PATCH_RADIUS = 0.1
PATCH_COLORS = {"blue": "#004488", "yellow": "#DDAA33", "red": "#BB5566"}  # Paul Tol High Contrast
EDGE_COLOR = "#000000"
TEXT_COLOR = "#FFFFFF"

tasks = ["Create desired room layout", "Place stacks of chairs", "Place chairs", "Delete chairs*", 
         "Move a chair*", "Move groups of chairs", "Rotate a chair", "Rotate the room", 
         "Save and reload layout", "Neither Easy Nor Hard"]

expected_means = [5.25, 6,   4.75, 5,    5,    4.75, 4.5, 5.75, 6.5, 5]
actual_means =   [4,    6.5, 5.25, 6.75, 6.75, 6.25, 6,   4.25, 5.5, 5.25]
colors = [PATCH_COLORS["blue"]] * 4 + [PATCH_COLORS["red"]] * 4 + [PATCH_COLORS["yellow"]] * 2
letters = "ABCDEFGHIJ"

class LetterPatch(patches.Circle):
    def __init__(self, xy, letter, color, *args, **kwargs):
        """
        Circular patch containing the specifying letter. Uses code from the answer to:
        https://stackoverflow.com/questions/62466362/how-to-use-a-cutom-marker-in-matplotlib-with-text-inside-a-shape
        """
        patches.Circle.__init__(self, xy, radius=PATCH_RADIUS, facecolor=color, edgecolor=EDGE_COLOR, alpha=0.5)

        self.xy = xy
        self.letter = letter

    def add_to_ax(self, ax):
        ax.add_patch(self)
        offset = (0.25, 0.25) if self.letter not in ["I", "J"] else (0.375, 0.25)
        ax.annotate(self.letter, xycoords=self, xy=offset, color=TEXT_COLOR, fontsize=10, weight="bold")

# Jitter matching coordinates
import random
random.seed(0)
expected_means[3] += random.random() * 0.1
actual_means[3] += random.random() * 0.1
expected_means[4] += random.random() * 0.1
actual_means[4] += random.random() * 0.1

fig, ax = plt.subplots(figsize=(5, 5))
ax.set(xlim= (3.75, 7), ylim= (3.75, 7))

letter_patches = []

for i, (x, y) in enumerate(zip(expected_means, actual_means)):
    patch = LetterPatch((x, y), letters[i], colors[i])
    patch.add_to_ax(ax)
    letter_patches.append(patch)

ax.set_xlabel("Mean predicted ease")
ax.set_ylabel("Mean actual ease")
ax.set_title("Expected and actual task ease")
fig.legend(letter_patches, tasks, loc="center right")

plt.show()
