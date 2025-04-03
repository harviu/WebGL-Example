import numpy as np
import matplotlib.pyplot as plt
from noise import pnoise2  # Perlin noise

# Marble color function – maps value to RGB
def marble_color(value):
    # Normalize sine value to [0, 1]
    norm = (value + 1) / 2
    return plt.cm.viridis(norm)  # You can use other colormaps too

# Boring marble pattern
def boring_marble(x, y):
    return marble_color(np.sin(y))

# Turbulence function using summed Perlin noise
def turbulence_perlin(x, y, scale=0.5):
    value = pnoise2(x * scale, y * scale, 1) * 0.5 + 0.5
    return value

def turbulence_multi_scale(x, y, octaves=4, scale=0.5):
    value = 0.0
    for _ in range(octaves):
        value += pnoise2(x * scale, y * scale) * 0.5 + 0.5
        scale /= 2
    return value

def turbulence_white(x, y, scale = 1):
    return (np.random.rand()) - 0.5 * 2 * scale

# Marble pattern function with turbulence
def marble(x, y):
    t = turbulence_multi_scale(x, y) * 2
    return marble_color(np.sin(y + t))  # Scaling turbulence for effect

# Image size
width, height = 500, 500
x = np.linspace(0, 10 * np.pi, width)
y = np.linspace(0, 10 * np.pi, height)
X, Y = np.meshgrid(x, y)

# Generate colors
image = np.zeros((height, width, 4))  # RGBA
for i in range(height):
    for j in range(width):
        image[i, j] = marble(X[i, j], Y[i, j])

# Display image
plt.imshow(image)
plt.axis('off')
plt.title('Marble Pattern')
plt.show()