# Exercise 11: Normal Vector

You will setup the normal vectors for a 3D cube in this exercise, which will prepare you for the 3D object lighting. Please use the example `lighting.html`. 

## Tasks

This exercise will get you familiar with setting up normal vectors and normal matrices. In [exercise 9](3d_transformation.md), we have implemented the rotation transformation for the 3D cube. In this exercise, we want to first set up the normal vectors for the cube and calculate normal matrix given the corresponding modeling matrix.

1. Setting up the normal vectors for 3D cube. In the `3d_cube.html` code, we represent the cube using 8 vertices. However, this is not enough if we want to accurately specify the normal vectors for 3D cube, because one vertex is shared by 3 faces and these three faces have different normal vectors. You can see this in the diagram:

    <img src="img/cube_normal_vector.png" alt="A 3D cube diagram with normal vectors" width="350"/>

    One solution is to duplicate the vertex for the triangles. In this example, we duplicate the triangle three times for the top, left, and back faces. This needs to be done for each face, so, instead of 8 vertices, we need to specify 36 vertices for the cube. I have already made this change in the example code.

    The task for you is to add the normal vectors for each vertex. Then, similar to vertex positions, use buffers to pass the normal vectors to the shader program.

2. The second task is to calculate the normal matrix using $N = (M^{-1})^T$. $M$ should be first converted to a 3x3 matrix before the calculation. You can find glMatrix functions to do it. And then, the new normal vector can be calculated as $\bold{n}'=N\bold{n}$. For the exercise, we will just create a dummy normal vector to test the normal matrix:
    ```JS
    let normal = vec3.fromValues(0,0,1);
    ```
    The new normal vector needs to be normalized to have unit magnitude after the applying the normal matrix.

    Test the correctness of the normal matrix by printing out the new and old normal vector before and after applying the normal matrix. Try applying rotation, scaling, and translation to the modeling matrix $M$. Think whether these transformations will also change the normal vector direction or not. Verify your answer by comparing the new and old normal vectors. Report your answers in your submission.

    The code to pass the normal matrix to shader programs is already there, you will use the normal matrix in the lighting exercise.


### Submission

Submit your modified code and the report to BlackBoard.
