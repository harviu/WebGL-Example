//////////////////////////////////////////////////////////////////
//
//  An example to show you how to set up to draw a 3D cube
//  This is the first example you will need to set up a camera, and the model, view, and projection matrices 
//
//  Credit: Han-Wei Shen (shen.94@osu.edu)
//  Edited by: Haoyu Li

var draw_type = 2;

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;

////////////////    Initialize VBO  ////////////////////////

function initBuffers() {
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
         0.5,  0.5,  -.5,
        -0.5,  0.5,  -.5, 
        -0.5, -0.5,  -.5,
         0.5, -0.5,  -.5,
         0.5,  0.5,  .5,
        -0.5,  0.5,  .5, 
        -0.5, -0.5,  .5,
         0.5, -0.5,  .5
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 8;

    var indices = [0,1,2, 0,2,3, 0,3,7, 0,7,4, 6,2,3,6,3,7,5,1,2,5,2,6,5,1,0,5,0,4,5,6,7,5,7,4];
    squareVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    squareVertexIndexBuffer.itemSize = 1;
    squareVertexIndexBuffer.numItems = 36;

    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    var colors = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 0.0, 0.0	    
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 3;
    squareVertexColorBuffer.numItems = 8;
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

const vMatrix = mat4.create(); // view matrix
const mMatrix = mat4.create(); // model matrix
const mvMatrix = mat4.create(); // modelview matrix
const pMatrix = mat4.create(); // projection matrix
var Z_angle = 0.0;

function setMatrixUniforms() {
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);	
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

///////////////////////////////////////////////////////////////

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, glMatrix.toRadian(60), 1.0, 0.1, 100); // set up the projection matrix 

    mat4.identity(vMatrix);
    mat4.lookAt(vMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]); // set up the view matrix

    mat4.identity(mMatrix);

    console.log('Z angle = ' + Z_angle);
    mat4.rotate(mMatrix, mMatrix, degToRad(Z_angle), [0, 1, 1]); // set up the model matrix

    mat4.multiply(mvMatrix, vMatrix, mMatrix); // mvMatrix = vMatrix * mMatrix

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);

    setMatrixUniforms(); // pass the matrices to the shader

    if (draw_type == 1) gl.drawArrays(gl.LINE_LOOP, 0, squareVertexPositionBuffer.numItems);	
    else if (draw_type == 0) gl.drawArrays(gl.POINTS, 0, squareVertexPositionBuffer.numItems);
    else if (draw_type == 2) gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

///////////////////////////////////////////////////////////////

var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

function onDocumentMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function onDocumentMouseMove(event) {
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    var diffX = mouseX - lastMouseX;
    var diffY = mouseY - lastMouseY;

    Z_angle += diffX / 5;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    drawScene();
}

function onDocumentMouseUp(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    initGL(canvas);

    gl.enable(gl.DEPTH_TEST);

    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
    program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");

    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.addEventListener('mousedown', onDocumentMouseDown, false);

    drawScene();
}


function BG(red, green, blue) {

    gl.clearColor(red, green, blue, 1.0);
    drawScene(); 

} 

function redraw() {
    Z_angle = 0; 
    drawScene();
}
    

function geometry(type) {

    draw_type = type;
    drawScene();

} 
