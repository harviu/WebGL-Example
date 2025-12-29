# Exercise 8: 2D Viewing

In this exercise, you need to implement the view transformation for a 2D scene. You will use the example `2d_viewing.html` for this exercise.

## New Codes

This example `2d_viewing.html` is changed from the soldier example you see before. I made some fun changes.

Because this exercise is about viewing and camera, we need to setup some environment in the world, so that we can easily see the camera move. This code generate a pebble road using randomly placed stone objects. 

```JS
stones = new ObjectWebGL();
for (let i = 0; i < 500; i++) {
    const x = Math.random() * 1000 - 250;
    const y = Math.random() * 180;
    const width = Math.random() * 20 + 10;
    const height = Math.random() * 15 + 5;
    // scale the stones so that faraway stones look smaller
    const scale = 1 - (y / 250);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    stones.shapes.push(new Shape(setRectangle(scaledWidth, scaledHeight), setTranslationMatrix(x, y), [0.5, 0.5, 0.5, 1]));
}
```

To setup the viewing and projection, we need to pass view and projection matrix to the vertex shader. So, the code is changed:

```C
    attribute vec2 aPosition;
    uniform mat3 mMatrix;
    uniform mat3 vMatrix;
    uniform mat3 pMatrix;
    void main() {
        vec3 hPosition = vec3(aPosition, 1.0);
        gl_Position = vec4(pMatrix * vMatrix * mMatrix * hPosition, 1.0); 
        gl_PointSize = 5.0;
    }
```

This should now be self-explanatory. **Note that the MVP matrix is multiplied in the order of PVM.** In JS code, we should also prepare the pass `pMatrix` and `vMatrix`. We first create a `cMatrix` for the camera, then translate the camera to look at the center of the world. `vMatrix` is the inverse of `cMatrix`. We do not implement the inversion ourselves. Instead a library called glMatrix is used here.

```JS
// Initialize identity matrix
let cMatrix = mat3.create();
// make camera look at the center of the canvas
// glMatrix library does post-multiplication by default
// So, C = C * T(250, 250)
mat3.translate(cMatrix, cMatrix, [250, 250]);
let vMatrix = mat3.create();
mat3.invert(vMatrix, cMatrix);
gl.uniformMatrix3fv(vMatrixLocation, false, vMatrix);
```

glMatrix is imported by:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>
```
It is a JS library focused on matrix operators for WebGL applications. Before, we made functions to initialize identity matrix and do 2D transformation. Now, you can use functions from the library as I showed in the code snippets. You can find the documentation for glMatrix [here](https://glmatrix.net/docs/).

Projection matrix is also changed, because we are projecting from view space to NDC space now.

## Tasks

1. The first task for this exercise is to implement the camera translation. The keys for translation is already defined. You need to implement the code:
    ```JS
    else if (e.key == '['){
        // TODO: move camera left
    }
    else if (e.key == ']'){
        // TODO: move camera right      
    }
    ```
    The idea is to first translate the `cMatrix` and then invert `cMatrix` to get `vMatrix`. Do not forget to update the `vMatrix` by calling `gl.uniformMatrix3fv`

2. In side-scrolling games, when the character move, usually the camera is moved with the character. Can you change the code to achieve that effect?

3. Similar to camera translation, implement camera rotation and zooming. You can design key strokes as you like.

Finally, submit your modified code to BlackBoard.