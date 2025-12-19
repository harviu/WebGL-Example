// Get the WebGL canvas element from the DOM, webgl-canvas is the id of the canvas element
const canvas = document.getElementById('webgl-canvas');
// Retrieve the WebGL rendering context (Object containing WebGL API) from the canvas
const gl = canvas.getContext('webgl');

// Check if WebGL is supported by the browser
if (!gl) {
    alert('WebGL not supported!');
    throw new Error('WebGL not supported');
}

// Create and compile a shader from source code
// Parameters:
//   gl - WebGL context
//   type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
//   source - shader source code as a string
function createShader(gl, type, source) {
    // Create a new shader object of the specified type
    const shader = gl.createShader(type);
    // Set the shader's source code
    gl.shaderSource(shader, source);
    // Compile the shader source code
    gl.compileShader(shader);

    // Check if compilation was successful
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Compile the vertex and fragment shader from its source code
// vertexShaderSource and fragmentShaderSource are defined in the HTML file
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create a new shader program to link shaders together
const program = gl.createProgram();
// Attach the compiled vertex and fragment shader to the program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
// Link the shaders into a complete program
gl.linkProgram(program);

// Check if program linking was successful
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking failed: ', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
// Set the program as the active shader program for rendering
gl.useProgram(program);

// Later in other application code, we can use the "program" object for rendering