from matplotlib import pyplot as plt
from matplotlib.patches import Patch

tasks = ["Create desired room layout", "Place stacks of chairs", "Place chairs", "Delete chairs*", 
         "Move a chair*", "Move groups of chairs", "Rotate a chair", "Rotate the room", 
         "Save and reload layout", "Use Theatre Style template"]
colours = ["#A01813", "#D11807", "#E94C1F", "#F57634",
           "#125A56", "#00767B", "#238F9D", "#42A7C6",
           "#FFB954", "#F9D576"]  # Paul Tol colours from Sunset scheme (https://personal.sron.nl/~pault/)

expected_means = [5.25, 6,   4.75, 5,    5,    4.75, 4.5, 5.75, 6.5, 5]
actual_means =   [4,    6.5, 5.25, 6.75, 6.75, 6.25, 6,   4.25, 5.5, 5.25]

#labels = ["🅐","🅑","🅒","🅓","🅔","🅕","🅖","🅗","🅘","🅙"]
# print(sum(actual_means) / 10)

# jitter matching coordinates
import random
random.seed(0)
expected_means[3] += random.random() * 0.1
actual_means[3] += random.random() * 0.1
expected_means[4] += random.random() * 0.1
actual_means[4] += random.random() * 0.1

fig, ax = plt.subplots(figsize=(7,4))
ax.scatter(expected_means, actual_means, c=colours)

# letters = "abcdefghij"
# for i in range(len(expected_means)):
#     ax.annotate(letters[i], (expected_means[i], actual_means[i]), xytext=(-3 ,-3), textcoords="offset points")

ax.set_xlabel("Expected mean")
ax.set_ylabel("Actual mean")
ax.set_title("Expected and actual task difficulty")
fig.legend([Patch(hatch="o", color=colour) for colour in colours], tasks, 7)

plt.show()
