# Exercise 9: 3D Transformation

This exercise focuses on 3D transformations. Please use the example `3d_cube.html`.

## Understand the Code

This is our first 3D example. First, I want to show some differences between 2D and 3D.
1. Of course, now the vertices are 3D vectors and transformation matrices are 4x4 matrices. This change is reflected both to the JavaScript and shader code
2. I am using `drawElements` for this example, however, `drawElements` is not limited to 3D.We need to create an index array to specify which vertices we are using:
    ```JS
    const vertices = new Float32Array([
        0.5,  0.5,  -.5,  // right, top,    far // where is the vertex in the cube
        -0.5,  0.5,  -.5, // left,  top,    far
        -0.5, -0.5,  -.5, // left,  bottom, far
        0.5, -0.5,  -.5,  // right, bottom, far
        0.5,  0.5,  .5,   // right, top,    near
        -0.5,  0.5,  .5,  // left,  top,    near
        -0.5, -0.5,  .5,  // left,  bottom, near
        0.5, -0.5,  .5    // right, bottom, near
    ]);
    // index has to be unsigned short integer
    const indices = new Uint16Array([
        0,1,2, // far face // this means using 0th, 1st, and 2nd vertex to draw a triangle
        0,2,3, // far face
        0,3,7, // right face
        0,7,4, // right face
        6,2,3, // bottom face
        6,3,7, // bottom face
        5,1,2, // left face
        5,2,6, // left face
        5,1,0, // top face
        5,0,4, // top face
        5,6,7, // near face
        5,7,4  // near face
    ]);
    ```
    Index buffer is also created differently by using `gl.ELEMENT_ARRAY_BUFFER`:
    ```JS
    const index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    ```
3. MVP matrices are made. Right now, view and projection matrices are just dummy identity matrices. We are going to change that in next exercise.

## Tasks

The purpose of this exercise is to get you used to 3D transformations and glMatrix library. I already imported the library in the example code. You need to implement the key events for WASD and QE to rotate the cube. W/S will rotate the cube up and down, A/D left and right, Q/E CCW and CW. Think of what rotation axis you should use for these rotations. If you want to rotate around x axis, the glMatrix function call is:
```JS
mat4.rotateX(out_matrix, in_matrix, degree);
```
Remember in 3D, your transformation matrix is 4x4 (mat4). 

Finish this task and submit to BlackBoard.


