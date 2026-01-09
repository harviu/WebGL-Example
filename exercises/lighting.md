# Exercise 13: Lighting

You will implement Gouraud shading in this exercise. Use `lighting.html` as the example code. You should have already specify the normal vectors in [exercise 11](normal_vector.md).

## Understanding the Code

I have already defined the shading coefficients in the example code:
```JS
const Ka = [1.0, 0.0, 0.0]; 
const Kd = [0.8, 0.0, 0.0]; 
const Ks = [1.0, 1.0, 1.0]; 
const shininess = 32.0; // coefficient n for specular component
const lightPosition = [0.0, 0.0, 3.0];
const eyePosition = [0.0, 0.0, 5.0];
const I = [1.0, 1.0, 1.0];
const Ia = [0.1, 0.1, 0.1];
```
There name should be pretty self-explanatory. If you forget what they are, you can go to the slides and find out the definition.

These coefficients are passed to the vertex shader for the calculation. The code to do this is similar to how we pass MVP matrices before. They are just tedious work so I finished them for you in the example code. The only caveat here is that you should use the matching function to the shader code variable type to pass the parameters.
```JS
// Shading parameters locations
const shininessLocation = gl.getUniformLocation(program, "shininess");
const lightPositionLocation = gl.getUniformLocation(program, "lightPosition");
const eyePositionLocation = gl.getUniformLocation(program, "eyePosition");
const ILocation = gl.getUniformLocation(program, "I");
const IaLocation = gl.getUniformLocation(program, "Ia");
const KaLocation = gl.getUniformLocation(program, "Ka");
const KdLocation = gl.getUniformLocation(program, "Kd");
const KsLocation = gl.getUniformLocation(program, "Ks");
// pass shading parameters to shader
gl.uniform1f(shininessLocation, shininess); // use uniform1f for float
gl.uniform3fv(lightPositionLocation, lightPosition); // use uniform3fv for vec3
gl.uniform3fv(eyePositionLocation, eyePosition);
gl.uniform3fv(ILocation, I);
gl.uniform3fv(IaLocation, Ia);
gl.uniform3fv(KaLocation, Ka);
gl.uniform3fv(KdLocation, Kd);
gl.uniform3fv(KsLocation, Ks);
```

These should build the skeleton code for you to implement the Gouraud shading. Next is your turn to actually implement that in the vertex shader.

## Task

Implement the Gourand shading in the vertex shader following the equations from the slides. Some reminder for you before you start coding:
- Eye positions and light positions are defined in the world space. So to calculate the L, R, and E vectors, object position and N should also be transformed to world space first.
- Be careful about the vector direction when calculating $N \cdot L$ and $R \cdot E$. The cosine value will be negative if the vector direction is wrong.
- You can use GLSL built-in function `reflect` to calculate $R$ vector. This function assumes incident light is pointing to the object.
- You can use `max(dot(R, E), 0.0)` to ensure $cos^n(\phi)$ is always positive. Think of when it will be negative and what will happen in that case.

After finishing everything, submit your code to BB.