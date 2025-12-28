# Exercise 7: Color Interpolation

In this exercise, we will use the example code `color_interpolation.html`.

## Understanding the code

Opening the example, you will see a rainbow-colored triangle on the canvas. As we introduced in the lecture, the three vertices are assigned color red, green, and blue. The pixel colors are interpolated by the fragment shader.

Similar to passing vertex positions, we use a buffer to pass color array from CPU to GPU:

```JS
// Set up color data
const color = new Float32Array([
    1,0,0,1,  // Color 1
    0,1,0,1,  // Color 2
    0,0,1,1,  // Color 3
]);
// vertex color buffer
const color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
const vertex_color_location = gl.getAttribLocation(program, 'vColor');
gl.vertexAttribPointer(vertex_color_location, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vertex_color_location);
gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
```

The code is almost the same. However, because colors are 4D vectors (RGBA, A stands for opacity), in the line 
```JS
gl.vertexAttribPointer(vertex_color_location, 4, gl.FLOAT, false, 0, 0);
```
the second argument should be changed from 2 to 4 to match the vector dimensionality.

### Shaders

There is also some change to the shader code. In the vertex shader, we create a new variable called vColor (vertex color). The color array is directly passed to this variable.

```C
attribute vec2 aPosition;
attribute vec4 vColor; // per-vertex color
varying vec4 fColor; // per-fragment color

void main() {
    fColor = vColor;
    gl_Position = vec4(aPosition, 0, 1.0);
    gl_PointSize = 5.0;
}
```

We have another new variable `fColor` with keyword `varying`. This keyword is to denote the attributes that need to be interpolated from per-vertex attribution to per-fragment variable. By setting `fColor = vColor`, we are telling the pipeline to interpolate the vertex color to fragment color.

In the fragment shader, we need to have the same variable fColor created to match the one from vertex shader:

```C
precision mediump float;
varying vec4 fColor; // per-fragment color

void main() {
    gl_FragColor = fColor;
}
```

Finally, `gl_FragColor = fColor` is using the interpolated per-fragment color as the final fragment color. `gl_FragColor` is the WebGL reserved variable to hold the output of the final fragment color.

## Tasks

1. The first task you need to do is to calculate the edge equations for the three edges of the triangle. Use the vertex positions of the triangle from the example code. After getting the edge equations, state whether positive or negative of each equation means the point resides inside the triangle.

2. There is a white dot drawn inside the screen, use the barycentric coordinate interpolation from the slides to interpolate the color at the location of the white dot. You can modify the code to do the interpolation and assign the new interpolated color to the dot. If your calculation is correct, the dot should blend into the background color of the triangle. 

After finishing the tasks, submit your calculation results from task 1 and the modified code the interpolated color from task 2 to BlackBoard