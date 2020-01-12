//Core
import React, { Component } from "react";
import ReactDOM from "react-dom";

//Styles
import "./styles/index.css";

//Utils
import * as THREE from "three";

//Images
import torus from "./assets/torus.png";

//Animation
const OrbitControls = require("three-orbit-controls")(THREE);

//Geometry

///Sorry but i changed  figure, because my figure look like bull****
// so i made desition to take new variant of lab. works(21), i really hope  you will understand me
const astroidalTorus = (u, v, target) => {
  const { PI, cos, pow, sin } = Math;

  v = v * 2 * PI;
  u = u * 2 * PI - PI;

  //Constant
  const A = 1;
  const R = 2;
  const Q = 0.25 * PI;

  const fx = A * pow(cos(u), 3);
  const fz = A * pow(sin(u), 3);

  const cosQ = cos(Q);
  const sinQ = cos(Q);
  const cosV = cos(v);
  const sinV = sin(v);

  const x = (R + fx * cosQ - fz * sinQ) * cosV;
  const y = (R + fx * cosQ - fz * sinQ) * sinV;
  const z = fx * sinQ + fz * cosQ;

  target.set(x, y, z);
};

class App extends Component {
  initializeOrbits = () => {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
  };
  initializeCamera = () => {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 4;
  };
  animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

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

    const geometry = new THREE.ParametricGeometry(astroidalTorus, 25, 25);

    const meshMaterial = new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: new THREE.Color("#990F02"),
      side: THREE.DoubleSide,
      flatShading: true
    });
    const meshPositive = new THREE.Mesh(geometry, meshMaterial);

    const geo = new THREE.WireframeGeometry(meshPositive.geometry);

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#000000"),
      transparent: true,
      opacity: 0.8
    });

    const wireframe = new THREE.LineSegments(geo, mat);

    meshPositive.add(wireframe);

    this.scene.add(meshPositive);
    this.animate();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
    this.mount.removeChild(this.renderer.domElement);
  }

  render() {
    return (
      <div className="container">
        <div
          id="boardCanvas"
          width={800}
          height={800}
          style={{ width: "80vw", height: "40vw" }}
          ref={mount => {
            this.mount = mount;
          }}
        ></div>
        <div>
          <h2>Example of torus</h2>
          <img src={torus} alt="figure torus"></img>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
