
//////////////////////////////////////////////////////////////////
//
//  An example that shows you how to do 2D texture mapping 
//  Make sure you change the browser setting so that you can open a local file 
//
//  Han-Wei Shen (shen.94@osu.edu)
//  
//  Edited by: Haoyu Li (lihao@gvsu.edu)

    var gl;
    var shaderProgram;
    var use_texture = 1; 
    var canvas;

 // set up the parameters for lighting 
  var light_ambient = [0,0,0,1]; 
  var light_diffuse = [.8,.8,.8,1];
  var light_specular = [1,1,1,1]; 
  var light_pos = [0,0,0,1];   // eye space position 
  var bump_strength = 1.0;
  var dim_x = 512, dim_y = 512;

  var mat_ambient = [0, 0, 0, 1]; 
  var mat_diffuse= [1, 1, 1, 1]; 
  var mat_specular = [.9, .9, .9,1]; 
  var mat_shine = [100]; 


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

//////////////////////////////////////////////////////////////////////////////

var sampleTexture; 
var source = "earth.png";

function initTextures() {
    sampleTexture = gl.createTexture();
    sampleTexture.image = new Image();
    sampleTexture.image.onload = function() { handleTextureLoaded(sampleTexture); }
    sampleTexture.image.src = source;
    console.log("loading texture....") 
}

function handleTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    dim_x = texture.image.width;
    dim_y = texture.image.height;

    // Check if the image has power-of-2 dimensions
    if (isPowerOf2(texture.image.width) && isPowerOf2(texture.image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // Set texture parameters for non-power-of-2 textures
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    console.log("Texture loaded:", sampleTexture.image.src);
    drawScene();
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

/////////////////////////////////////////////////////////////////////////////

var squareVertexPositionBuffer;
var squareVertexNormalBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;
var squareVertexTangentBuffer;

var sqvertices = [];
var sqtangents = [];
var sqnormals = []; 
var sqindices = [];
var sqcolors = [];
var sqTexCoords=[]; 

function InitSquare()
{
        sqvertices = [
            0.5,  0.5,  0,
	        -0.5,  0.5,  0, 
	        -0.5, -0.5, 0,
 	        0.5, -0.5,  0,
        ];
	    sqindices = [0,1,2, 0,2,3]; 
        sqnormals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];    
        sqtangents = [
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
        ];    
        // Texture coordinates for the corners of the square.
        sqTexCoords = [
            0.0,0.0,
            1.0,0.0,
            1.0,1.0,
            0.0,1.0
        ]; 
}


function initSQBuffers() {

        InitSquare(); 
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqvertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        squareVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqnormals), gl.STATIC_DRAW);
        squareVertexNormalBuffer.itemSize = 3;
        squareVertexNormalBuffer.numItems = 4; 

        squareVertexTangentBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqtangents), gl.STATIC_DRAW);
        squareVertexTangentBuffer.itemSize = 3;
        squareVertexTangentBuffer.numItems = 4; 

        squareVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqTexCoords), gl.STATIC_DRAW);
        squareVertexTexCoordsBuffer.itemSize = 2;
        squareVertexTexCoordsBuffer.numItems = 4; 

	    squareVertexIndexBuffer = gl.createBuffer();	
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sqindices), gl.STATIC_DRAW);  
        squareVertexIndexBuffer.itemsize = 1;
        squareVertexIndexBuffer.numItems = 6;  

}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

    var mMatrix = mat4.create();  // model matrix
    var vMatrix = mat4.create(); // view matrix
    var pMatrix = mat4.create();  //projection matrix
    var nMatrix = mat4.create();  // normal matrix
    var Z_angle = 0.0;

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);	
    }

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }

    ///////////////////////////////////////////////////////////////

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, glMatrix.toRadian(60), 1.0, 0.1, 100); // changed to glMatrix version 2

        mat4.lookAt(vMatrix,[0,0,2], [0,0,0], [0,1,0]);	// set up the view matrix, multiply into the modelview matrix

        mat4.identity(mMatrix);	
	
//      console.log('Z angle = '+ Z_angle); 
        mat4.rotate(mMatrix, mMatrix, degToRad(Z_angle), [0, 1, 1]);   // now set up the model matrix

        mat4.identity(nMatrix); 
        mat4.multiply(nMatrix, nMatrix, vMatrix);
        mat4.multiply(nMatrix, nMatrix, mMatrix); 	
        mat4.invert(nMatrix, nMatrix);
        mat4.transpose(nMatrix, nMatrix); 

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");


        gl.uniform4f(shaderProgram.light_posUniform,light_pos[0], light_pos[1], light_pos[2], light_pos[3]); 	
        gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
        gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
        gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
        gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 
        gl.uniform1f(shaderProgram.bump_strengthUniform, bump_strength); 
        gl.uniform1f(shaderProgram.dim_x, dim_x); 
        gl.uniform1f(shaderProgram.dim_y, dim_y); 

        gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
        gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
        gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2],1.0); 

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
	    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, squareVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
 
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTangentBuffer);
	    gl.vertexAttribPointer(shaderProgram.vertexTangentAttribute, squareVertexTangentBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
	    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, squareVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    // draw elementary arrays - triangle indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);

        setMatrixUniforms();   // pass the modelview mattrix and projection matrix to the shader 
        gl.uniform1i(shaderProgram.use_textureUniform, use_texture); 

        gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
        gl.bindTexture(gl.TEXTURE_2D, sampleTexture);    // bind the texture object to the texture unit 
        gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader 

        gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);
	
    }


    ///////////////////////////////////////////////////////////////

     var lastMouseX = 0, lastMouseY = 0;

    ///////////////////////////////////////////////////////////////

     function onDocumentMouseDown( event ) {
          event.preventDefault();
          canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
          canvas.addEventListener( 'mouseup', onDocumentMouseUp, false );
          var mouseX = event.clientX;
          var mouseY = event.clientY;

          lastMouseX = mouseX;
          lastMouseY = mouseY; 

      }

     function onDocumentMouseMove( event ) {
          var mouseX = event.clientX;
          var mouseY = event.ClientY; 

          var diffX = mouseX - lastMouseX;
          var diffY = mouseY - lastMouseY;

          Z_angle = Z_angle + diffX/5;

          lastMouseX = mouseX;
          lastMouseY = mouseY;

          drawScene();
     }

     function onDocumentMouseUp( event ) {
          canvas.removeEventListener( 'mousemove', onDocumentMouseMove, false );
          canvas.removeEventListener( 'mouseup', onDocumentMouseUp, false );
     }

    ///////////////////////////////////////////////////////////////

    function webGLStart() {
        canvas = document.getElementById("code10-canvas");
        initGL(canvas);
        initShaders();

	    gl.enable(gl.DEPTH_TEST); 

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexTangentAttribute = gl.getAttribLocation(shaderProgram, "aVertexTangent");
        gl.enableVertexAttribArray(shaderProgram.vertexTangentAttribute);

        shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
        gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);
	
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");	

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");
        shaderProgram.bump_strengthUniform = gl.getUniformLocation(shaderProgram, "heightScale");
        shaderProgram.dim_x = gl.getUniformLocation(shaderProgram, "dim_x");
        shaderProgram.dim_y = gl.getUniformLocation(shaderProgram, "dim_y");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	

        shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
        shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");

        initSQBuffers();

	    initTextures(); 

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        console.log('start! ');

        canvas.addEventListener('mousedown', onDocumentMouseDown,false); 

        const bumpSlider = document.getElementById("bumpStrength"); 
        const bumpValueDisplay = document.getElementById("bumpValue");

        bump_strength = parseFloat(bumpSlider.value);
    
        // Update display and shader uniform when slider is changed
        bumpSlider.addEventListener("input", () => {
            bump_strength = parseFloat(bumpSlider.value);
            bumpValueDisplay.textContent = bump_strength.toFixed(2);
            drawScene();
        })

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

function texture(value, filename = undefined) {
    // 0: no texture, 1: texture mapping, 2: bump mapping

    use_texture = value;
    if (value > 0) {
        source = filename;
        initTextures();
    }
    drawScene();

} 
