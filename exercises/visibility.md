# Exercise 12: Visibility

This exercise focuses z-buffer depth check. Please use the example `3d_cube.html`. Please use the [exercise 10](./3d_viewing_projection.md) result codes where you finished the view and projection for this exercise.

## Tasks

The purpose of this exercise is to show how z-buffer algorithm works in WebGL. After the last exercise, you are able to render a 3D cube with viewing and projection. Now, removing the following two lines, then, rotate the cube to see the effect of turning off the depth check. Think why the 3D cube is rendered differently and submit your explanation to BlackBoard.

```JS
// enables depth check
gl.enable(gl.DEPTH_TEST); 
// show the fragment if the z value is smaller
gl.depthFunc(gl.LESS);
```
