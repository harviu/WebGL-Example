
////////////////////////////Variables/////////////////////////////

const canvas = document.getElementById("myCanvas");
let gl;
let shaderProgram;
let shadowshaderProgram;
let vertexPositionBuffer;
let vertexIndexBuffer; 

let light_vector = [1.0,1.0,1.0,1.0];  //use parallel light
var mat_ambient = [0.3, 0, 0, 1]; 
var mat_diffuse= [1, 0, 0, 1]; 
var mat_specular = [.9, .9, .9,1]; 
var mat_shine = [50]; 
let light_color = [1,1,1,1];
const object_list = []

const SHADOW_MAP_SIZE = 1024;
let depthTexture;
let depthFBO; 


var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create();  // model matrix
var pMatrix = mat4.create();  //projection matrix 
var nMatrix = mat4.create();  // normal matrix
const lightProjection = mat4.create();
const lightView = mat4.create();
const lightSpaceMatrix = mat4.create();

let horizontal = 0.0;
let vertical = 0.0;

let debugSetup; 

function initShadowShaders () {
    shadowshaderProgram = gl.createProgram();

    var fragmentShader = getShader(gl, "depth-fs");
    var vertexShader = getShader(gl, "depth-vs");

    gl.attachShader(shadowshaderProgram, vertexShader);
    gl.attachShader(shadowshaderProgram, fragmentShader);
    gl.linkProgram(shadowshaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function webGLStart() {
    initGL(canvas);
    initShaders();
    initShadowShaders();
    debugSetup = setupDepthMapDebug();   // call once

    gl.enable(gl.DEPTH_TEST); 

    // for depth texture
    depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.DEPTH_COMPONENT16,     
        SHADOW_MAP_SIZE,
        SHADOW_MAP_SIZE,
        0,
        gl.DEPTH_COMPONENT,       
        gl.UNSIGNED_SHORT,     
        null
      );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    depthFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    // end for depth texture

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");	
    shaderProgram.uLightSpaceMatrix = gl.getUniformLocation(shaderProgram, "uLightSpaceMatrix");	
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

    shaderProgram.light_vectorUniform = gl.getUniformLocation(shaderProgram, "light_vector");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.light_colorUniform = gl.getUniformLocation(shaderProgram, "light_color");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    setupObjects();

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    document.addEventListener('mousedown', onDocumentMouseDown,false); 

    drawScene();
    drawScene();
}

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl2");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function setupObjects() {
    // drawing the land 
    mat_ambient = [0.8,0.8,0.8, 1]; 
    mat_diffuse= [0.0, 0.0, 0.0, 1]; 
    mat_specular = [.0, .0, .0, 1]; 
    mat_shine = [50]; 

    mat4.identity(mMatrix);	
    mat4.translate(mMatrix,mMatrix,[0,-2.45,0])
    mat4.scale(mMatrix,mMatrix,[1000,0.1,1000])

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCube(1),
        mMatrix: mat4.clone(mMatrix)
    })

    // drawing Torii
    // wood part
    mat_ambient = [0.4, 0, 0, 1]; 
    mat_diffuse= [0.7, 0, 0, 1]; 
    mat_specular = [.75, .75, .75,1]; 
    mat_shine = [50]; 

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[-2,-2,0]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCylinder(0.18,0.25,4),
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[2,-2,0]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCylinder(0.18,0.25,4),
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[0,1.3,0]);
    mMatrix = mat4.scale(mMatrix,mMatrix,[5.3/0.2,1,1]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCube(0.2),
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[0,2.09,0]);
    mMatrix = mat4.scale(mMatrix,mMatrix,[5.6/0.2,0.9,1.8]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCube(0.2),
        mMatrix: mat4.clone(mMatrix)
    })
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[2,1.37,0]);
    mMatrix = mat4.scale(mMatrix,mMatrix,[0.6/0.2,0.7,0.9]);
    
    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCube(0.2),
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[-2,1.37,0]);
    mMatrix = mat4.scale(mMatrix,mMatrix,[0.6/0.2,0.7,0.9]);
    
    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCube(0.2),
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[0,1.7,0]);
    mMatrix = mat4.scale(mMatrix,mMatrix,[4,6.1,1]);
    
    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: generateCube(0.1),
        mMatrix: mat4.clone(mMatrix)
    })

    //black wood part
    mat_ambient = [0, 0, 0, 1]; 
    mat_diffuse= [0.15, 0.15, 0.15, 1]; 
    mat_specular = [1, 1, 1,1]; 
    mat_shine = [5]; 

    vi = generateCylinder(0.3,0.3,0.5);
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[-2,-2.5,0]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[2,-2.5,0]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })

    vi = generateCube(0.2);
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[0,2.15,0]);
    mMatrix = mat4.scale(mMatrix,mMatrix,[6/0.2,0.7,2]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })

    
    // stone part
    mat_ambient = [0.15, 0.15, 0.15, 1]; 
    mat_diffuse= [111/255, 121/255, 124/255, 1]; 
    mat_specular = [1, 1, 1,1]; 
    mat_shine = [75]; 

    vi = generateSphere(0.4);
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[1.8,-2.1,-2.5]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[-1.8,-2.1,-2.5]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })

    vi = generateSphere(0.25);
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[1.8,-1.7,-2.5]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })

    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[-1.8,-1.7,-2.5]);

    object_list.push({
        mat_ambient: [...mat_ambient],
        mat_diffuse: [...mat_diffuse],
        mat_specular: [...mat_specular],
        mat_shine: [...mat_shine],
        vi: [...vi],
        mMatrix: mat4.clone(mMatrix)
    })
}

///////////////////////////////////////////////////////////////

function drawScene() {
    let vi; //vector containing geometric information

    
    // first pass: render the scene from the light's perspective
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO);
    gl.viewport(0, 0, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shadowshaderProgram);

    // Set up shared uniforms
    mat4.ortho(lightProjection, -10, 10, -10, 10, 1, 50);

    const lightPos = vec3.fromValues(light_vector[0] * 10, light_vector[1] * 10, light_vector[2] * 10);
    const target = vec3.fromValues(0, 0, 0);
    const up = vec3.fromValues(0, 1, 0);

    mat4.lookAt(lightView, lightPos, target, up);
  
    mat4.multiply(lightSpaceMatrix, lightProjection, lightView);

    for (let i = 0; i < object_list.length; i++) {
        vi = object_list[i].vi;
        mat_ambient = object_list[i].mat_ambient;
        mat_diffuse = object_list[i].mat_diffuse;
        mat_specular = object_list[i].mat_specular;
        mat_shine = object_list[i].mat_shine;
        mMatrix = mat4.clone(object_list[i].mMatrix);
        drawDepthmap(vi[0],vi[1],vi[2]);
    }
    // showDepthMap(depthTexture, debugSetup);    // visualize result
    
    /// second pass: render the scene from the light's perspective ///
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shaderProgram);

    mat4.identity(mMatrix);	
    mat4.identity(vMatrix);

    // set up the projection matrix
    mat4.perspective(pMatrix, glMatrix.toRadian(60), 1.0, 0.1, 20); 

    // modify vMatrix
    vMatrix = mat4.translate(vMatrix,vMatrix,[0,0,-9]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,-vertical,[1,0,0]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,-horizontal,[0,1,0]);

    for (let i = 0; i < object_list.length; i++) {
        vi = object_list[i].vi;
        mat_ambient = object_list[i].mat_ambient;
        mat_diffuse = object_list[i].mat_diffuse;
        mat_specular = object_list[i].mat_specular;
        mat_shine = object_list[i].mat_shine;
        mMatrix = mat4.clone(object_list[i].mMatrix);
        drawBuffer(vi[0],vi[1],vi[2]);
    }

}

///////////////////////////////////////////////////////////////

function drawDepthmap(v, index, n) {
    let temp = initBuffer(v,index,n);
    v = temp[0];
    index = temp[1];
    n = temp[2];

    const uModel = gl.getUniformLocation(shadowshaderProgram, "uModel");
    gl.uniformMatrix4fv(uModel, false, mMatrix);

    const uLightSpaceMatrix = gl.getUniformLocation(shadowshaderProgram, "uLightSpaceMatrix");
    gl.uniformMatrix4fv(uLightSpaceMatrix, false, lightSpaceMatrix);

    const depthPosition = gl.getAttribLocation(shadowshaderProgram, "aPosition");
    gl.enableVertexAttribArray(depthPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, v);
    gl.vertexAttribPointer(depthPosition, v.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); 
    gl.drawElements(gl.TRIANGLES, index.numItems, gl.UNSIGNED_SHORT, 0);
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


function generateSphere(radius, nSlice=20,nStack=20){
    // set up transform matrix before calling this function
    let v = [];
    let index = [];
    let n = [];
    let aStep=2*Math.PI/nSlice;
    let bStep=Math.PI/(nStack+1);
    let a;
    let b;

    //input vertices
    for (let i = 0;i<nSlice;i++){
        a = i*aStep;
        for (let j = 0;j<nStack;j++){
            b = (j+1)*bStep-Math.PI/2;
            v.push(radius*Math.cos(a)*Math.cos(b));
            v.push(radius*Math.sin(b));
            v.push(radius*Math.sin(a)*Math.cos(b));

            n.push(Math.cos(a)*Math.cos(b));
            n.push(Math.sin(b));
            n.push(Math.sin(a)*Math.cos(b));
        }
    }

    v.push(0);v.push(radius);v.push(0);
    v.push(0);v.push(-radius);v.push(0);
    n.push(0);n.push(1);n.push(0);
    n.push(0);n.push(-1);n.push(0);
    let topI = nSlice*nStack;
    let bottomI = topI+1;

    //input index
    for (let i = 0;i<nSlice;i++){
        let start = i*nStack;
        let next = (i+1)%nSlice*nStack;
        index.push(bottomI);index.push(start);index.push(next);
        index.push(start+nStack-1);index.push(topI);index.push(next+nStack-1);
        for(let j =0;j<nStack-1;j++){
            index.push(start+j);index.push(next+j);index.push(next+j+1);
            index.push(start+j);index.push(start+j+1);index.push(next+j+1);
        }
    }

    return [v,index,n];
    
}

function generateCube(size){
    // set up transform matrix before calling this function
    const s = size / 2;

    // Vertices: 8 corners of the cube
    const v = [
        // Back face
        -s, -s, -s,   s, -s, -s,   s,  s, -s,   -s,  s, -s,
        // Front face
        -s, -s,  s,   -s,  s,  s,   s,  s,  s,    s, -s,  s,
        // Left face
        -s, -s, -s,   -s,  s, -s,   -s,  s,  s,   -s, -s,  s,
        // Right face
         s, -s, -s,    s, -s,  s,    s,  s,  s,    s,  s, -s,
        // Top face
        -s,  s, -s,    s,  s, -s,    s,  s,  s,   -s,  s,  s,
        // Bottom face
        -s, -s, -s,   -s, -s,  s,    s, -s,  s,    s, -s, -s,
      ];
    
      const n = [
        // Back face
         0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
        // Front face
         0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
        // Left face
        -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
        // Right face
         1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
        // Top face
         0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
        // Bottom face
         0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
      ];
    
      const index = [
        0, 1, 2,   0, 2, 3,      // back
        4, 5, 6,   4, 6, 7,      // front
        8, 9,10,   8,10,11,      // left
        12,13,14,  12,14,15,     // right
        16,17,18,  16,18,19,     // top
        20,21,22,  20,22,23      // bottom
      ];

    return [v,index,n];
}

function generateCylinder(tRadius,bRadius,height, nSlice=20,nStack=20){
    // set up transform matrix before calling this function
    let v = [];
    let index = [];
    let n = [];
    let aStep=2*Math.PI/nSlice;
    let hStep=height/(nStack+1);
    let rStep = (tRadius-bRadius)/(nStack+1);

    //input vertices
    for (let i = 0;i<nSlice;i++){
        let a = i*aStep;
        for (let j = 0;j<nStack+2;j++){
            let h = hStep * j;
            let delR = rStep *j;
            v.push((bRadius+delR)*Math.cos(a));
            v.push(h);
            v.push((bRadius+delR)*Math.sin(a));

            n.push(Math.cos(a));
            n.push((tRadius-bRadius)/height);
            n.push(Math.sin(a));
        }
    }

    //input index
    for (let i = 0;i<nSlice;i++){
        let start = i*(nStack+2);
        let next = (i+1)%nSlice*(nStack+2);
        index.push(0);index.push(start);index.push(next);
        index.push(nStack+1);index.push(start+nStack+1);index.push(next+nStack+1);
        for(let j =0;j<nStack+1;j++){
            index.push(start+j);index.push(next+j);index.push(next+j+1);
            index.push(start+j);index.push(start+j+1);index.push(next+j+1);
        }
    }

    return [v,index,n];
}

function initBuffer(v,index,n){
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

    return ([vertexPositionBuffer,vertexIndexBuffer,vertexNormalBuffer]);
}

function drawBuffer(v,index,n){
    let temp = initBuffer(v,index,n);
    v = temp[0];
    index = temp[1];
    n = temp[2];

    mat4.multiply(nMatrix,vMatrix,mMatrix);
	nMatrix = mat4.invert(nMatrix, nMatrix);
    nMatrix = mat4.transpose(nMatrix, nMatrix);

    gl.uniform4f(shaderProgram.light_vectorUniform,light_vector[0], light_vector[1], light_vector[2],1.0); 
    gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
    gl.uniform4f(shaderProgram.light_colorUniform, light_color[0], light_color[1], light_color[2], 1.0); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.uLightSpaceMatrix, false, lightSpaceMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);	
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uShadowMap"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, v);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, v.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, n);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, n.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); 
    gl.drawElements(gl.TRIANGLES, index.numItems, gl.UNSIGNED_SHORT, 0);

}


function setupDepthMapDebug() {
    // Compile shaders
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;
  
    const fsSource = `
      precision mediump float;
      uniform sampler2D uDepthMap;
      varying vec2 vTexCoord;
      void main() {
        float depth = texture2D(uDepthMap, vTexCoord).r;
        gl_FragColor = vec4(vec3(depth), 1.0);
      }`;
  
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }
  
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  
    const debugProgram = gl.createProgram();
    gl.attachShader(debugProgram, vs);
    gl.attachShader(debugProgram, fs);
    gl.linkProgram(debugProgram);
  
    const quadVerts = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
  
    const quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
  
    return {
      program: debugProgram,
      vbo: quadVBO
    };
  }
  
  function showDepthMap(depthTexture, debugSetup) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    gl.useProgram(debugSetup.program);
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.uniform1i(gl.getUniformLocation(debugSetup.program, "uDepthMap"), 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, debugSetup.vbo);
    const posLoc = gl.getAttribLocation(debugSetup.program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }