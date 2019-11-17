import React, { Component } from "react";
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);

function neoviusPositive(u, v, target) {
  const { PI, acos, cos } = Math;

  u = u * PI - PI / 2;
  v = v * PI + PI / 2;

  const x = u;
  const y = v;

  const cosU = cos(u);
  const cosV = cos(v);

  const z = acos(-3 * ((cosV + cosU) / (3 + 4 * cosU * cosV)));
  target.set(x, y, z);
}

function neoviusNegative(u, v, target) {
  const { PI, acos, cos } = Math;

  u = u * PI - PI / 2;
  v = v * PI + PI / 2;

  const x = u;
  const y = v;

  const cosU = cos(u);
  const cosV = cos(v);

  const z = acos(-3 * ((cosV + cosU) / (3 + 4 * cosU * cosV)));
  target.set(x, y, -z + 10);
}

class Shape extends Component {
  constructor(props) {
    super(props);
    this.animate = this.animate.bind(this);
    this.addCube = this.addCube.bind(this);
    this.initializeCamera = this.initializeCamera.bind(this);
    this.initializeOrbits = this.initializeOrbits.bind(this);
  }
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    this.initializeOrbits();
    this.initializeCamera();

    var geometryPositive = new THREE.ParametricGeometry(
      neoviusPositive,
      25,
      25
    );
    var geometryNegative = new THREE.ParametricGeometry(
      neoviusNegative,
      25,
      25
    );

    // mesh
    var material = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1
    });

    var uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib["ambient"],
      THREE.UniformsLib["lights"],
      {
        myColour: { value: new THREE.Vector4(0, 0, 1, 1) },
        delta: { value: 0 }
      }
    ]);
    var shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,

      vertexShader: `	varying vec3 vViewPosition; //VertexPos
      varying vec3 vNormal;
    
      attribute float vertexDisplacement;
        uniform float delta;
        varying float vOpacity;
         varying vec3 vUv;
    
      void main() {
          vec3 transformed = vec3( position );
          vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 ); //Eye-coordinate position
          vViewPosition = - mvPosition.xyz;
    
        vUv = position;
          vOpacity = vertexDisplacement;
    
          vec3 p = position;
          p.x += sin(p.y + delta );
    
            vNormal = normalMatrix * normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
       }`,

      fragmentShader: `uniform vec4 myColour;
      varying vec3 vViewPosition; //Translation component of view matrix
      varying vec3 vNormal;
  
      uniform float delta;
        varying float vOpacity;
        varying vec3 vUv;
  
  
    struct PointLight {
      vec3 position;
      vec3 color;
      float distance;
      float decay;
  
      int shadow;
      float shadowBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
  
     uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
  
      void main() {
  
        vec3 mvPosition = -vViewPosition; //Eye coordinate space
  
        vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);
        for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
          vec3 lightDirection = normalize(pointLights[l].position -  mvPosition   );
          addedLights.rgb += clamp(dot(lightDirection, vNormal), 0.0, 1.0) * pointLights[l].color;
        }
        gl_FragColor = myColour * addedLights;//mix(vec4(diffuse.x, diffuse.y, diffuse.z, 1.0), addedLights, addedLights);
      }`
    });

    var meshPositive = new THREE.Mesh(geometryPositive, shaderMaterial);
    var meshNegative = new THREE.Mesh(geometryNegative, material);

    // wireframe
    var geo = new THREE.WireframeGeometry(meshPositive.geometry);
    var keo = new THREE.WireframeGeometry(meshNegative.geometry);

    var mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    var wireframe = new THREE.LineSegments(geo, mat);

    var wireframeKek = new THREE.LineSegments(keo, mat);

    meshPositive.add(wireframe);
    meshNegative.add(wireframeKek);

    this.scene.add(meshPositive);
    this.scene.add(meshNegative);

    this.animate();
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
    this.mount.removeChild(this.renderer.domElement);
  }
  initializeOrbits() {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
  }
  initializeCamera() {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 4;
  }
  animate() {
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }
  addCube(cube) {
    this.scene.add(cube);
  }
  render() {
    return (
      <div>
        <div
          id="boardCanvas"
          style={{ width: "80vw", height: "40vw" }}
          ref={mount => {
            this.mount = mount;
          }}
        />
      </div>
    );
  }
}
export default Shape;
