# Exercise 3: 2D Coordinate System

We are still looking at the same `hello_world.html` example we used before for this exercise.

## Coordinate Space Change

The triangle is directly defined in the NDC space for the Hello World example, but you do not like this space when you are creating the objects. You find it is natural to define all axes from 0 to 100. So you make a new "mind space". The bottom-left corner of this space is [0, 0], top-right corner is [100, 100]. Can you convert the triangle (
    (0.0,  0.5), 
    (-0.5, -0.5), 
    (0.5, -0.5) ) we defined in the Hello World example to this new "mind space"? Show your steps of calculation in the submission

## Drawing in the mind Space

Now, in the mind space, make another triangle of your choice. In order to render this space using WebGL, you need to convert this triangle back to the NDC space. This conversion can be done in the application stage.

> Doing that transformation in the vertex shader is more efficient but also more difficult. So we will learn that later.

Modify `hello_world.html` and add a function called `m2ndc`. This function takes as input an array of vertices in the mind space and returns a new array of indices in the NDC space. You can either hard-code the dimensions of the mind space or make it as other parameters.

> You will need to learn the basics of JavaScript to write this function. JavaScript syntax is similar to C/C++, but the variable typing is similar to Python.

Then, use this new function and render the triangle you make in the mind space.

> Remember that, the array need to be converted to float32 before sending to vertex shader buffer.

## Submission

Submit your answer to the coordinate space change question and your modified code to BlackBoard.

