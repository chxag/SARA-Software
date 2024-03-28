"""
Based on Expectation Ratings discussed in, and the scatterplot from Figure 8.14 of, Chapter 8 of
Quantifying the User Experience: Practical Statistics for User Research, second ed.
 - Scatterplot in Figure 8.14 gave idea of centering graph on data, and starting axis labels and title
 - Tullis & Albert. (referenced in this chapter as the source of the ER quadrant idea) 
   use different quadrants; chose to center on the middle of the figure or mean of the data instead as 
   it gives a more informative visual for our positively skewed data
"""

from matplotlib import pyplot as plt
from matplotlib import patches

SHOW_QUADRANT_LINES = True
USE_OLD_DATA = False

if USE_OLD_DATA:
    COLORS = {"blue": "#004488", "yellow": "#DDAA33", "red": "#BB5566"}  # Paul Tol High Contrast
else:
    COLORS = {"blue": "#4477AA", "yellow": "#CCBB44", "red": "#EE6677", "green" : "#228833"}  # Paul Tol Bright

PATCH_RADIUS = 0.1
EDGE_COLOR = "#000000"
TEXT_COLOR = "#FFFFFF"
letters = "ABCDEFGHIJ"

tasks = ["Create desired room layout", "Place stacks of chairs", "Place chairs", "Delete chairs", 
         "Move a chair", "Move groups of chairs", "Rotate a chair", "Rotate the room", 
         "Save and reload layout", "Use Theatre Style Template"]
patch_colors = [COLORS["blue"]] * 4 + [COLORS["red"]] * 4 + [COLORS["yellow"]] * 2

if USE_OLD_DATA:
    # Data from the 4 user tests preceding Demo 3
    expected_means = [5.25, 6,   4.75, 5,    5,    4.75, 4.5, 5.75, 6.5, 5]
    actual_means =   [4,    6.5, 5.25, 6.75, 6.75, 6.25, 6,   4.25, 5.5, 5.25]
    
    # Jitter the matching coordinates
    import random
    random.seed(0)  # Ensure always same position
    expected_means[3] += random.random() * 0.1
    actual_means[3] += random.random() * 0.1
    expected_means[4] += random.random() * 0.1
    actual_means[4] += random.random() * 0.1
    # Add asterisks to jittered tasks (to point to a note explaining jitter in the containing document)
    tasks[3] += "*"
    tasks[4] += "*"
else:
    # Data from all 5 user tests
    expected_means = [5.4, 6.2, 5,   5.2, 5.2, 4.8, 4.4, 5.6, 6.4, 5.2]
    actual_means =   [3.6, 6.4, 5.4, 6.6, 6,   5.4, 5.8, 4.4, 5,   4.8]

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

# Create square figure and scale axes around datapoints
fig, ax = plt.subplots(figsize=(5, 5))
if USE_OLD_DATA: 
    ax.set(xlim= (3.75, 7), ylim= (3.75, 7)) 
else:
    pass
    ax.set(xlim= (3, 7), ylim= (3, 7)) 

# Places coloured lettered patches at each datapoint
letter_patches = []
for i, (x, y) in enumerate(zip(expected_means, actual_means)):
    patch = LetterPatch((x, y), letters[i], patch_colors[i])
    patch.add_to_ax(ax)
    letter_patches.append(patch)

# Figure labels and legend
ax.set_xlabel("Mean predicted ease")
ax.set_ylabel("Mean actual ease")
ax.set_title("Expected and actual task ease")
fig.legend(letter_patches, tasks, loc="center right")

# Quadrant lines (idea from Tullis & Albert)
if SHOW_QUADRANT_LINES:
    if USE_OLD_DATA:
        # Incomplete as quadrants were instead manually put on feature for presentation
        center = 5.5  # Middle of range 4-7
    else:
        center = 5.34  # Mean of datapoints
        plt.annotate("Promote this", (3.9, 6.125), weight="bold", color=COLORS["green"])
        plt.annotate("Don't touch this", (5.6, 6.125), weight="bold", color=COLORS["green"])
        plt.annotate("Big opportunity", (3.785, 4.1), weight="bold", color=COLORS["yellow"])
        plt.annotate("Fix this fast", (5.735, 4.1), weight="bold", color=COLORS["red"])

    plt.plot([1,7], [center, center], color=EDGE_COLOR)
    plt.plot([center, center], [1,7], color=EDGE_COLOR)

plt.show()
