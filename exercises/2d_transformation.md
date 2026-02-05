# Exercise 4: 2D Transformation

You will practice building 2D transformation matrices in this exercise. We are using `rotation.html` as the example code. I suggest avoid using AI for exercises, as you are learning fundamentals in exercises.

## Code Explanation

First I will introduce the new components in this code.

### Function to build the matrix

Here is an example to build the 2D rotation matrix given the radius of rotation. This is simply following the slides to build a 3x3 matrix.

```JS
function setRotationMatrix(rad){
    const cosAngle = Math.cos(rad);
    const sinAngle = Math.sin(rad);
    // Transposed rotation matrix!!!
    return rotationMatrix = new Float32Array([
            cosAngle,  sinAngle, 0.0,
            -sinAngle, cosAngle, 0.0,
            0.0,       0.0,      1.0
        ]);
}
```

You may notice this matrix is **transposed** compared to the matrix in the slides. The matrix we have in the slides is:
```JS
// rotation matrix in the slides, notice the different location of -sin
[
    cosAngle, -sinAngle, 0.0,
    sinAngle,  cosAngle, 0.0,
    0.0,       0.0,      1.0
]
```
This is because WebGL stores the matrix in the column order, i.e., the matrix is stored as: first column, second column, and third column. So the matrix appears to be transposed if we write it in rows. Make sure in other matrices, you are writing the matrix in the correct order.

### Vertex shader

The vertex shader is changed for the first time in this exercise. To apply transformation, we need to multiply the transformation matrix with the vertices. This can either be done using CPU or GPU.
- If we multiply the matrix in CPU, we are doing that in application stage (JS code).
- If we multiply the matrix in GPU, we need to do that in geometry stage (vertex shader).

The whole point of WebGL is to use GPU to do the expensive geometry and raster calculation, which includes transformation. So, we are doing that in vertex shader.

```C
// Vertex shader
attribute vec2 aPosition;
// a new variable for transformation matrix
// mat3 means it is a 3x3 matrix
// uniform means the variable is the same for all vertices
// (we are apply the the same matrix for all vertices of the triangle)
uniform mat3 transform_matrix;

void main() {
    // expending vertex position to (x, y, 1)
    vec3 hPosition = vec3(aPosition, 1.0);
    // multiplication
    vec3 transformed_position = transform_matrix * hPosition;
    // use the new vertex as the transformation result
    gl_Position = vec4(transformed_position.x, transformed_position.y, 0, 1.0);
}
```

We also need to pass the transformation matrix from JS to vertex shader. We first creates a buffer for transformation matrix.

```JS
const transform_matrix = gl.getUniformLocation(program, "transform_matrix");
```

And then, this passes the constructed matrix to vertex shader:

```JS
// transform_matrix is the buffer we created
// The second argument must be false, it means if we are transposing the matrix or not
// WebGL does not support this so it is always false
// rotationMatrix is the matrix we want to pass to vertex shader
gl.uniformMatrix3fv(transform_matrix, false, rotationMatrix);
```

### Input Box

I also created a input box in this example. The box is first built in the html:

```HTML
<!-- style describes where to put the input box (CSS) -->
<div style="text-align: left; margin-top: 10px;">
    <!-- We use id to refer to this input box later -->
    <input id="angleInput" type="number" placeholder="Enter angle in degrees" />
</div>
```

In JavaScript code, we add an event listener for the input box, so that every time the value is changed, we update the canvas to draw the rotated triangle.

```JS
const input = document.getElementById("angleInput");
input.addEventListener("input", () => {
    // "|| 0" handles when the input is not a number
    const angle = parseFloat(input.value) || 0;
    render(angle);
});
```

## Tasks

Similar to the rotation example, could you add translation and scaling functionality to this example? You can hard-code $t_x, t_y, s_x, s_y$. Or, if you want to practice your front-end development skill, you can try adding input boxes for them. 

>Hint: You could only perform one kind of transformation (rotation, translation, or scaling) when the input is updated by swapping the matrices. We will discuss transformation composition later.

After finishing, submit your code to BlackBoard.