# Exercise 12: Visibility

This exercise focuses on 3D Viewing and Transformation. Please use the example `3d_cube.html`. Please use the exercise 10 result codes where you finished the view and projection for this exercise.

## Tasks

The purpose of this exercise is to show how z-buffer algorithm works in WebGL. After the last exercise, you are able to render a 3D cube with viewing and projection. Now, create another 3D cube that either blocks the current cube or is blocked by the current cube. To allow depth check you will need to add these two lines:

```JS
// enables depth check
gl.enable(gl.DEPTH_TEST); 
// show the fragment if the z value is smaller
gl.depthFunc(gl.LESS);
```

### Submission

Submit your modified code to BlackBoard.
