//Core
import React, { Component } from "react";
import * as THREE from "three";

//Shaders
import { DigitalGlitch, LightShader, AcidShader } from "./shaders";

//Animation
const OrbitControls = require("three-orbit-controls")(THREE);

//Geometry

///Sorry but i changed my figure, because me look like bull****
// so i make desition to took new variant of lab, i really hope , you will understand me
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

class Drawer extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    //Initial setting
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#321");
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    this.initializeCamera();
    this.initializeOrbits();

    //Torus
    const geometry = new THREE.ParametricGeometry(astroidalTorus, 25, 25);
    geometry.scale(10, 10, 10);

    const meshTorus = new THREE.Mesh(geometry, AcidShader);

    meshTorus.position.set(30, 20, 20);

    meshTorus.receiveShadow = true;
    meshTorus.castShadow = true;
    this.scene.add(meshTorus);

    // GlitchPkabe;
    const glitchPlane = new THREE.PlaneGeometry(200, 200, 200);
    const meshGlitchPlane = new THREE.Mesh(glitchPlane, DigitalGlitch);
    // meshGlitchPlane.rotateZ(1);
    meshGlitchPlane.rotateX(-0.3);

    this.scene.add(meshGlitchPlane);

    // Light
    var light = new THREE.PointLight(0xffee88, 1, 0);
    light.position.set(0, 100, 100);
    this.scene.add(light);

    var sphereLight = new THREE.SphereGeometry(10, 10, 10);
    var LightMat = new THREE.MeshLambertMaterial({ color: 0xff2000 });
    var meshLight = new THREE.Mesh(sphereLight, LightMat);
    meshLight.position.set(0, 2, 0);
    this.scene.add(meshLight);

    ///AcidBox
    var acidBox = new THREE.BoxBufferGeometry(10, 10, 10, 10, 10, 10);
    var mesh = new THREE.Mesh(acidBox, AcidShader);
    mesh.position.set(30, 0, 20);
    this.scene.add(mesh);

    // //attribute
    var vertexDisplacement = new Float32Array(
      acidBox.attributes.position.count
    );

    for (var i = 0; i < vertexDisplacement.length; i++) {
      vertexDisplacement[i] = Math.sin(i);
    }

    acidBox.addAttribute(
      "vertexDisplacement",
      new THREE.BufferAttribute(vertexDisplacement, 1)
    );

    //RENDER LOOP

    var delta = 0;

    const render = () => {
      const { sin, cos } = Math;

      delta += 0.1;

      mesh.material.uniforms.delta.value = 0.5 + sin(delta) * 0.5;

      // attribute
      for (var i = 0; i < vertexDisplacement.length; i++) {
        vertexDisplacement[i] = 0.5 + sin(i + delta) * 0.25;
      }
      mesh.geometry.attributes.vertexDisplacement.needsUpdate = true;

      const change = Date.now() / 240;
      const xChanged = sin(change);
      const zChanged = cos(change);

      light.position.y = 20;
      light.position.x = 140 * xChanged;
      light.position.z = 140 * zChanged;

      meshLight.position.y = 20;
      meshLight.position.x = 125 * xChanged;
      meshLight.position.z = 125 * zChanged;

      meshTorus.material.uniforms.delta.value = delta;
      meshTorus.material.uniforms.delta.needsUpdate = true;

      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(render);
    };

    render();

    this.animate();
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
    this.mount.removeChild(this.renderer.domElement);
  }

  initializeOrbits = () => {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
  };

  initializeCamera = () => {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 4;

    this.camera.position.set(0, 0, 300);
  };
  animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div>
        <div
          id="boardCanvas"
          width={800}
          height={800}
          style={{ width: "80vw", height: "40vw", color: "#ffff" }}
          ref={mount => {
            this.mount = mount;
          }}
        ></div>
      </div>
    );
  }
}
export default Drawer;
