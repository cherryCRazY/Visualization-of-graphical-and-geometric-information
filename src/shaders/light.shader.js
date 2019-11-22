import * as THREE from "three";

export const LightShader = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib["ambient"],
    THREE.UniformsLib["lights"],
    {
      myColour: { value: new THREE.Vector4(0, 0, 1, 1) },
      delta: { value: 0 }
    }
  ]),

  lights: true,

  vertexShader: `
 varying vec3 vViewPosition; //VertexPos
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
  }

 `,
  fragmentShader: `    uniform vec4 myColour;
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
