import { ShaderMaterial } from "three";

export const AcidShader = new ShaderMaterial({
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
