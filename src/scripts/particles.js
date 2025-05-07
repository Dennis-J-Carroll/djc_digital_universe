/**
 * WebGL Particle System for Space Background
 * 
 * This script creates an animated particle system using WebGL2 to render
 * a space-like background with stars and nebula effects.
 */

// Self-executing function to avoid polluting global namespace
(function() {
  // Get the canvas element
  const canvas = document.getElementById('space-particles');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Initialize WebGL2 context
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.error('WebGL2 not supported');
    return;
  }

  // Set canvas size to match window
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  
  // Call resize initially and add event listener
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Vertex shader source
  const vertexShaderSource = `#version 300 es
    precision highp float;
    
    in vec2 a_position;
    in float a_size;
    in vec3 a_color;
    in float a_alpha;
    
    uniform mat4 u_projection;
    uniform float u_time;
    
    out vec3 v_color;
    out float v_alpha;
    
    void main() {
      // Subtle movement based on time
      vec2 position = a_position;
      position.x += sin(u_time * 0.001 + position.y * 0.1) * 0.3;
      position.y += cos(u_time * 0.0015 + position.x * 0.1) * 0.2;
      
      gl_Position = u_projection * vec4(position, 0.0, 1.0);
      gl_PointSize = a_size;
      v_color = a_color;
      v_alpha = a_alpha;
    }
  `;

  // Fragment shader source
  const fragmentShaderSource = `#version 300 es
    precision highp float;
    
    in vec3 v_color;
    in float v_alpha;
    
    out vec4 outColor;
    
    void main() {
      // Create circular points with soft edges
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distance = length(coord);
      
      // Discard pixels outside the circle
      if (distance > 0.5) {
        discard;
      }
      
      // Create a soft glow effect
      float intensity = 1.0 - smoothstep(0.0, 0.5, distance);
      outColor = vec4(v_color, v_alpha * intensity);
    }
  `;

  // Create and compile shaders
  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Create program and link shaders
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return;
  }

  // Get attribute locations
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const sizeAttributeLocation = gl.getAttribLocation(program, 'a_size');
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  const alphaAttributeLocation = gl.getAttribLocation(program, 'a_alpha');

  // Get uniform locations
  const projectionUniformLocation = gl.getUniformLocation(program, 'u_projection');
  const timeUniformLocation = gl.getUniformLocation(program, 'u_time');

  // Create buffers
  const positionBuffer = gl.createBuffer();
  const sizeBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const alphaBuffer = gl.createBuffer();

  // Create VAO
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Generate particles
  const NUM_PARTICLES = 1500;
  const positions = new Float32Array(NUM_PARTICLES * 2); // x, y
  const sizes = new Float32Array(NUM_PARTICLES);
  const colors = new Float32Array(NUM_PARTICLES * 3); // r, g, b
  const alphas = new Float32Array(NUM_PARTICLES);

  // Helper function to get random value in range
  const random = (min, max) => Math.random() * (max - min) + min;

  // Initialize particle data
  for (let i = 0; i < NUM_PARTICLES; i++) {
    // Position: spread across the screen with some randomness
    positions[i * 2] = random(-1.5, 1.5) * canvas.width;
    positions[i * 2 + 1] = random(-1.5, 1.5) * canvas.height;
    
    // Size: mostly small stars with a few larger ones
    const sizeRand = Math.random();
    if (sizeRand > 0.995) {
      // Very large stars (rare)
      sizes[i] = random(8, 12);
    } else if (sizeRand > 0.98) {
      // Medium stars
      sizes[i] = random(4, 7);
    } else {
      // Small stars (most common)
      sizes[i] = random(1, 3);
    }
    
    // Color: mostly white/blue with some variation
    const colorRand = Math.random();
    if (colorRand > 0.9) {
      // Reddish stars
      colors[i * 3] = random(0.8, 1.0);     // R
      colors[i * 3 + 1] = random(0.3, 0.6); // G
      colors[i * 3 + 2] = random(0.3, 0.5); // B
    } else if (colorRand > 0.7) {
      // Yellowish stars
      colors[i * 3] = random(0.8, 1.0);     // R
      colors[i * 3 + 1] = random(0.8, 1.0); // G
      colors[i * 3 + 2] = random(0.3, 0.5); // B
    } else {
      // Blue/white stars (most common)
      colors[i * 3] = random(0.7, 1.0);     // R
      colors[i * 3 + 1] = random(0.8, 1.0); // G
      colors[i * 3 + 2] = random(0.9, 1.0); // B
    }
    
    // Alpha: vary opacity for depth effect
    alphas[i] = random(0.1, 1.0);
  }

  // Setup position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // Setup size buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(sizeAttributeLocation);
  gl.vertexAttribPointer(sizeAttributeLocation, 1, gl.FLOAT, false, 0, 0);

  // Setup color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  // Setup alpha buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(alphaAttributeLocation);
  gl.vertexAttribPointer(alphaAttributeLocation, 1, gl.FLOAT, false, 0, 0);

  // Unbind VAO
  gl.bindVertexArray(null);

  // Create orthographic projection matrix
  const createProjectionMatrix = () => {
    const left = 0;
    const right = canvas.width;
    const bottom = canvas.height;
    const top = 0;
    const near = -1;
    const far = 1;
    
    // Orthographic projection matrix
    return new Float32Array([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,
      (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1
    ]);
  };

  // Set clear color and enable blending
  gl.clearColor(0.02, 0.03, 0.05, 1.0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  // Animation loop
  let lastTime = 0;
  const render = (time) => {
    // Calculate time delta
    const deltaTime = time - lastTime;
    lastTime = time;
    
    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use our shader program
    gl.useProgram(program);
    
    // Update projection matrix if canvas size changes
    gl.uniformMatrix4fv(projectionUniformLocation, false, createProjectionMatrix());
    
    // Update time uniform
    gl.uniform1f(timeUniformLocation, time);
    
    // Bind VAO and draw
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
    
    // Request next frame
    requestAnimationFrame(render);
  };

  // Start animation loop
  requestAnimationFrame(render);

  console.log('Space particles background initialized');
})();
