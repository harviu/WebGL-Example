# Exercise 2: Primitives

This exercise will get you used to WebGL primitives. The code example we are using is `primitives.html`. The overall code structure is similar to the hello world example.

The canvas is split into four spaces. I showed an example of drawing the four vertices of a rectangle in the top-left corner. Your task is:

- Use line primitive to draw the rectangle boundaries on the top-right. You can use either LINES, LINE_STRIP, or LINE_LOOP
- Use gl.TRIANGLES to draw a filled rectangle on the bottom-left.
- Use gl.TRIANGLE_STRIP to draw a filled rectangle on the bottom-right.

Submit your modified code to BB.

>When submitting the code, you can leave out the `setupShader.js` file. I will use my copy of the file to test your code. So, do not make any change to `setupShader.js`.