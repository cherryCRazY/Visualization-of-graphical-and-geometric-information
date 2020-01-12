//Core
import React, { Component } from "react";
import ReactDOM from "react-dom";

//Styles
import "./styles/index.css";

import * as THREE from "three";

//Animation
const OrbitControls = require("three-orbit-controls")(THREE);

//Shaders
const AcidShader = new THREE.ShaderMaterial({
  vertexShader: `
attribute float vertexDisplacement;
uniform float delta;
varying float vOpacity;
varying vec3 vUv;

void main() 
{
    vUv = position;
    vOpacity = vertexDisplacement;

    vec3 p = position;

    p.x += sin(vertexDisplacement) * 50.0;
    p.y += cos(vertexDisplacement) * 50.0;

	vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
}`,
  fragmentShader: `uniform float delta;
varying float vOpacity;
varying vec3 vUv;

void main() {

    float r = 1.0 + cos(vUv.x * delta);
    float g = 0.5 + sin(delta) * 0.5;
    float b = 0.0;
    vec3 rgb = vec3(r, g, b);

	gl_FragColor = vec4(rgb, vOpacity);

}`,
  uniforms: {
    delta: { value: 0 }
  }
});

const DigitalGlitch = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null }, //diffuse texture
    tDisp: { value: null }, //displacement texture for digital glitch squares
    byp: { value: 0.2 }, //apply the glitch ?
    amount: { value: 0.08 },
    angle: { value: 0.92 },
    seed: { value: 0.0001 },
    seed_x: { value: 0.001 }, //-1,1
    seed_y: { value: 0.001 }, //-1,1
    distortion_x: { value: 0.5 },
    distortion_y: { value: 0.6 },
    col_s: { value: 0.0 }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "	vUv = uv;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform int byp;",

    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tDisp;",

    "uniform float amount;",
    "uniform float angle;",
    "uniform float seed;",
    "uniform float seed_x;",
    "uniform float seed_y;",
    "uniform float distortion_x;",
    "uniform float distortion_y;",
    "uniform float col_s;",

    "varying vec2 vUv;",

    "float rand(vec2 co){",
    "	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",

    "void main() {",
    "	if(byp<1) {",
    "		vec2 p = vUv;",
    "		float xs = floor(gl_FragCoord.x / 0.5);",
    "		float ys = floor(gl_FragCoord.y / 0.5);",
    //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
    "		vec4 normal = texture2D (tDisp, p*seed*seed);",
    "		if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {",
    "			if(seed_x>0.){",
    "				p.y = 1. - (p.y + distortion_y);",
    "			}",
    "			else {",
    "				p.y = distortion_y;",
    "			}",
    "		}",
    "		if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {",
    "			if(seed_y>0.){",
    "				p.x=distortion_x;",
    "			}",
    "			else {",
    "				p.x = 1. - (p.x + distortion_x);",
    "			}",
    "		}",
    "		p.x+=normal.x*seed_x*(seed/5.);",
    "		p.y+=normal.y*seed_y*(seed/5.);",
    //base from RGB shift shader
    "		vec2 offset = amount * vec2( cos(angle), sin(angle));",
    "		vec4 cr = texture2D(tDiffuse, p + offset);",
    "		vec4 cga = texture2D(tDiffuse, p);",
    "		vec4 cb = texture2D(tDiffuse, p - offset);",
    "		gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
    //add noise
    "		vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);",
    "		gl_FragColor = gl_FragColor+ snow;",
    "	}",
    "	else {",
    "		gl_FragColor=texture2D (tDiffuse, vUv);",
    "	}",
    "}"
  ].join("\n")
});

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

class Drawer extends Component {
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

ReactDOM.render(<Drawer />, document.getElementById("root"));
