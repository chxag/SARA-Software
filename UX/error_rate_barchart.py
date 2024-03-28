from matplotlib import pyplot as plt
from matplotlib.patches import Patch

CHAIR_OR_ACCESSIBILITY_ERROR = True

COLORS = {"yellow" : "#EECC66", "red" : "#EE99AA", "blue" : "#6699CC"}

if CHAIR_OR_ACCESSIBILITY_ERROR:
    title = "Chair Placement Error Rate"
    data = [(8/48), (42/48), (20/27), 0, (30/60)]
else:
    title = "Stack and Chair Accessibility Error Rate"
    data = [0, (55/64), (2/37), 0, (74/80)]

# Plot Bars with Error Rate for each user
fig, ax = plt.subplots(figsize=(6, 6))
plt.bar(x=0.5, height=data[0], width=1, color=COLORS["yellow"])
plt.bar(x=1.5, height=data[1], width=1, color=COLORS["red"])
plt.bar(x=2.5, height=data[2], width=1, color=COLORS["yellow"])
plt.bar(x=3.5, height=data[3], width=1, color=COLORS["yellow"])
plt.bar(x=4.5, height=data[4], width=1, color=COLORS["blue"])

# Scale Plot
plt.ylim(0, 1)
plt.xlim(0, 5)

# Label Axes
plt.title(title)
plt.ylabel("Error Rate (%)")
plt.xlabel("New Users                                  Repeat Users         ")
plt.xticks([0.5, 1.5, 2.5, 3.5, 4.5], [1, 2, 3, 4, 5])
ax.legend([Patch(color=colour) for colour in COLORS.values()], ["Google Chrome", "Safari", "Internet Explorer"], loc="upper left")

# Plot Dividing Line
plt.plot([2, 2], [0, 1], color="black")

plt.show()
