# Exercise 10: 3D Viewing and Projection

This exercise focuses on 3D Viewing and Transformation. Please use the example `3d_cube.html`.
You have read this code in the last exercise, and we said that we setup identity view and projection matrices as a placeholder.

## Tasks

### Setting up the view matrix and orthographical projection.
Set you camera at the world coordinate $(0,0,3)$, looking at the world origin $(0,0,0)$, up direction is world coordinate y direction: $(0,1,0)$. Use glMatrix `mat4.LookAt` function to set the vMatrix. After setting the view matrix, the cube is not visible. This is normal because we have not updated the projection matrix.

Then, set a orthographical projection matrix. Left/bottom and right/top planes are -1 and 1 respectively. The near plane is 1, far plane is 10. You can use `mat4.ortho` function to set the pMatrix. Use the equation from the class to calculate the projection matrix by hand. Show your steps in the the submission. After the calculation, print out your pMatrix using `console.log` and verify if your calculation is correct or not. After setting the projection matrix, you should be able to see the cube again.

Edit the view matrix parameters and answer:

- Move the camera to (0,0,4). What will happen in the scene? Explain the reason.
- Make the camera look at (1,0,0). What will happen in the scene? Explain the reason.
- Change the up direction to (1,1,0). What will happen in the scene? Explain the reason.

### Camera control

Edit the code to setup the pan and tilt control of the camera using arrow keys. Panning means rotate the camera left and right. Tilting meas rotate the camera up and down. Here is a [video](https://www.youtube.com/watch?v=iAZvLA_K94w&t=1s) to explain what is camera pan and tilt.

> Remember from the class, if you want to apply $C'=C*M$ to the camera matrix, you should apply $V'=M^{-1} V$ to the view matrix.

### Perspective Projection

Similar to orthographical projection, setup a pMatrix for perspective projection with $FOV_y = 45\degree$, $aspect = 1$, $near=1$, $far=10$. Use `mat4.perspective` to setup the matrix. Use the equation from the class to calculate the pMatrix by hand and verify your result with the function output.


Edit the perspective projection parameters and answer:

- Change the $FOV_y$ to $60\degree$. What will happen in the scene? Explain the reason.
- Change the aspect ratio to 2. What will happen in the scene? Explain the reason.

### Submission

Submit your final code and answers to the above questions to BlackBoard.
