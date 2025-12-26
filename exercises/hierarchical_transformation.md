# Exercise 6: Hierarchical Transformation

This exercise will use `soldier.html` as example. I suggest avoid using AI for exercises, as you are learning fundamentals in exercises.

## Matrix Multiplication

The first task you need to finish is to the function `multiplyMatrix3x3(a, b)`. You are not able to see anything before correctly complete this function. There are only two lines missing and I have the comments in the code to guide you. Remember the column-major order means the matrix is flattened to 1d in the oder: 1st-column, 2nd-column ...

After you finish the task, you should be able to see a soldier holding a sword at the bottom-left corder of the canvas.

## Understanding the Code

This example is slightly different than the examples before. In the vertex shader. I explain the differences in the comments:

```C
attribute vec2 aPosition;
uniform mat3 mMatrix; // mMatrix is the composited transformation matrix
uniform mat3 pMatrix; // pMatrix (projection matrix) converts objects from "mind space" to NDC

void main() {
    vec3 hPosition = vec3(aPosition, 1.0);
    gl_Position = vec4(pMatrix * mMatrix * hPosition, 1.0); 
    gl_PointSize = 5.0;
}
```

In the fragment shader, instead of hard-coding the color, we use a variable `uColor`. This allows us to pass an color variable from JavaScript code to fragment shader so that different objects have different colors.

I created a helper function to draw different objects. It takes vertices, composited matrix, and color, pass them to shaders, and call the `drawArrays` function.

```JS
function drawObject(positions, mMatrix, color) {
    // pass vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // pass vMatrix and color
    gl.uniformMatrix3fv(mMatrixLocation, false, new Float32Array(mMatrix));
    gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);
    
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}
```
