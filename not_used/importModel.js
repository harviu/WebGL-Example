//////////////////////////////////////////////////////////////////
/*
    An example to show how to import 3D models to WebGL
    Made use of GLTF file loader from Three.js
    The loaded file is rendered using raw WebGL
    Lowe model is from: https://sketchfab.com/3d-models/lowe-89d9428ad93f45989373266110440559
    More GLB format models can be found on https://sketchfab.com/

    Author: Haoyu Li (lihao@gvsu.edu)
*/


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

////////////////////////////Variables/////////////////////////////

const canvas = document.getElementById("myCanvas");
let gl;
let shaderProgram;
let vertexPositionBuffer;
let vertexNormalBuffer;
let vertexIndexBuffer; 
let vertexTexCoordsBuffer;

let light_vector = [1.0,1,1,1];  //use parallel light
var mat_ambient = [0.3, 0, 0, 1]; 
var mat_diffuse= [1, 0, 0, 1]; 
var mat_specular = [.9, .9, .9,1]; 
var mat_shine = [50]; 
let light_color = [1,1,1,1];

var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create();  // model matrix
var mvMatrix = mat4.create();  // modelview matrix
var pMatrix = mat4.create();  //projection matrix 
var nMatrix = mat4.create();  // normal matrix
let horizontal = 0.0;
let vertical = 0.0;
let model = null; // variable to hold the loaded model


//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {

    shaderProgram = gl.createProgram();

    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

}


    ///////////////////////////////////////////////////////////////

var lastMouseX = 0;
let lastMouseY = 0;

    ///////////////////////////////////////////////////////////////

function onDocumentMouseDown( event ) {
    event.preventDefault();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    // document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    lastMouseX = mouseX;
    lastMouseY = mouseY; 

}

function onDocumentMouseMove( event ) {
    var mouseX = event.clientX;
    var mouseY = event.clientY; 

    var diffX = mouseX - lastMouseX;
    var diffY = mouseY - lastMouseY;


    // if(Math.abs(diffX)>5 ||Math.abs(diffY)>5){
        horizontal = horizontal + diffX/100;
        vertical = vertical +diffY/200;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        drawScene();
    // }
}

function onDocumentMouseUp( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

///////////////////////////Helper functions////////////////////////////////////////

function initBuffer(v,index,n, uv){
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = v.length;

    vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(n), gl.STATIC_DRAW);
    vertexNormalBuffer.itemSize = 3;
    vertexNormalBuffer.numItems = n.length;  

    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer); 	
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);  
    vertexIndexBuffer.itemsize = 3;
    vertexIndexBuffer.numItems = index.length; 

    if (uv) {
        vertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
        vertexTexCoordsBuffer.itemSize = 2;
        vertexTexCoordsBuffer.numItems = uv.length;
    }
    return ([vertexPositionBuffer,vertexIndexBuffer,vertexNormalBuffer,vertexTexCoordsBuffer]);
}

function drawBuffer(v,index,n, uv){
    mat4.multiply(mvMatrix, vMatrix,mMatrix);  // mvMatrix = vMatrix * mMatrix and is the modelview Matrix 
    mat4.multiply(nMatrix, vMatrix,mMatrix);
	nMatrix = mat4.invert(nMatrix, nMatrix);
    nMatrix = mat4.transpose(nMatrix, nMatrix);

    gl.uniform4f(shaderProgram.light_vectorUniform,light_vector[0], light_vector[1], light_vector[2],1.0); 
    gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
    gl.uniform4f(shaderProgram.light_colorUniform, light_color[0], light_color[1], light_color[2], 1.0); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);	
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, v);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, n);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    if (uv){
        gl.bindBuffer(gl.ARRAY_BUFFER, uv);
        gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, vertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); 
    gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


// Load GLB model
const loader = new GLTFLoader();
await loader.load('lowe.glb', (gltf) => {
    model = gltf.scene;

    initGL(canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST); 

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");	

    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

    shaderProgram.light_vectorUniform = gl.getUniformLocation(shaderProgram, "light_vector");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.light_colorUniform = gl.getUniformLocation(shaderProgram, "light_color");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
    


    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    document.addEventListener('mousedown', onDocumentMouseDown,false); 

    drawScene(); 

}, undefined, (error) => {
    console.error('Error loading model:', error);
});


function drawScene() {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(vMatrix);

    // set up the projection matrix
    mat4.perspective(pMatrix, glMatrix.toRadian(60), 1.0, 0.1, 500); // changed to glMatrix version 2

    vMatrix = mat4.translate(vMatrix,vMatrix,[0,0,-4]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,vertical,[1,0,0]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,horizontal,[0,1,0]);

    drawModel(model);
}

function drawModel(model){
    mat4.identity(mMatrix);	
    model.traverse((child) => {
        // Apply the model's world matrix to the mMatrix
        if (child.isMesh) {
            // fix the relative positions by applying the model to world matrix from the file
            mat4.set(mMatrix, ...child.matrixWorld.elements)

            // loading vertex attributes
            const geometry = child.geometry;
            const position = geometry.attributes.position.array;
            const normal = geometry.attributes.normal.array;
            const index = geometry.index.array;
            const uv = geometry.attributes.uv.array;

            // load texture if needed
            const texture = child.material.map;
            if (texture) { 
                const sampleTexture = gl.createTexture();
                sampleTexture.image = texture.source.data;
                gl.bindTexture(gl.TEXTURE_2D, sampleTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sampleTexture.image);

                // Check if the image has power-of-2 dimensions
                if (isPowerOf2(texture.image.width) && isPowerOf2(texture.image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    // Set texture parameters for non-power-of-2 textures
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }        
                gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
                gl.bindTexture(gl.TEXTURE_2D, sampleTexture);    // bind the texture object to the texture unit 
                gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader 
            }

            const buffers = initBuffer(position, index, normal, uv);
            drawBuffer(buffers[0], buffers[1], buffers[2], buffers[3]);
        }

    });
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}