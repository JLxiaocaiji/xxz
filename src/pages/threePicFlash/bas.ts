import * as THREE from 'three-platformize'

const ShaderChunk: Record<string, string> = {}

ShaderChunk['animation_time'] =
  'float tDelay = aAnimation.x;\nfloat tDuration = aAnimation.y;\nfloat tTime = clamp(uTime - tDelay, 0.0, tDuration);\nfloat tProgress = ease(tTime, 0.0, 1.0, tDuration);\n'

ShaderChunk['catmull-rom'] =
  'vec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t)\n{\n    vec3 v0 = (p2 - p0) * 0.5;\n    vec3 v1 = (p3 - p1) * 0.5;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nvec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, vec2 c, float t)\n{\n    vec3 v0 = (p2 - p0) * c.x;\n    vec3 v1 = (p3 - p1) * c.y;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nfloat catmullRom(float p0, float p1, float p2, float p3, float t)\n{\n    float v0 = (p2 - p0) * 0.5;\n    float v1 = (p3 - p1) * 0.5;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nfloat catmullRom(float p0, float p1, float p2, float p3, vec2 c, float t)\n{\n    float v0 = (p2 - p0) * c.x;\n    float v1 = (p3 - p1) * c.y;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n'

ShaderChunk['cubic_bezier'] =
  'vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t)\n{\n    vec3 tp;\n    float tn = 1.0 - t;\n\n    tp.xyz = tn * tn * tn * p0.xyz + 3.0 * tn * tn * t * c0.xyz + 3.0 * tn * t * t * c1.xyz + t * t * t * p1.xyz;\n\n    return tp;\n}\n'

ShaderChunk['ease_in_cubic'] =
  'float ease(float t, float b, float c, float d) {\n  return c*(t/=d)*t*t + b;\n}\n'

ShaderChunk['ease_in_out_cubic'] =
  'float ease(float t, float b, float c, float d) {\n  if ((t/=d/2.0) < 1.0) return c/2.0*t*t*t + b;\n  return c/2.0*((t-=2.0)*t*t + 2.0) + b;\n}\n'

ShaderChunk['ease_in_quad'] =
  'float ease(float t, float b, float c, float d) {\n  return c*(t/=d)*t + b;\n}\n'

ShaderChunk['ease_out_back'] =
  'float ease(float t, float b, float c, float d) {\n  float s = 1.70158;\n  return c*((t=t/d-1.0)*t*((s+1.0)*t + s) + 1.0) + b;\n}\n\nfloat ease(float t, float b, float c, float d, float s) {\n  return c*((t=t/d-1.0)*t*((s+1.0)*t + s) + 1.0) + b;\n}\n'

ShaderChunk['ease_out_cubic'] =
  'float ease(float t, float b, float c, float d) {\n  return c*((t=t/d - 1.0)*t*t + 1.0) + b;\n}\n'

ShaderChunk['quaternion_rotation'] =
  'vec3 rotateVector(vec4 q, vec3 v)\n{\n    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\n}\n\nvec4 quatFromAxisAngle(vec3 axis, float angle)\n{\n    float halfAngle = angle * 0.5;\n    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));\n}\n'

const _concatFunctions = () => {
  const shaderFunctions = [
    ShaderChunk['cubic_bezier'],
    ShaderChunk['ease_in_out_cubic'],
    ShaderChunk['quaternion_rotation'],
  ]
  return shaderFunctions.join('\n')
}

const _concatParameters = () => {
  const shaderParameters = [
    'uniform float uTime;',
    'attribute vec2 aAnimation;',
    'attribute vec3 aStartPosition;',
    'attribute vec3 aControl0;',
    'attribute vec3 aControl1;',
    'attribute vec3 aEndPosition;',
  ]
  return shaderParameters.join('\n')
}

const _concatVertexInit = () => {
  const shaderVertexInit = [
    'float tDelay = aAnimation.x;',
    'float tDuration = aAnimation.y;',
    'float tTime = clamp(uTime - tDelay, 0.0, tDuration);',
    'float tProgress = ease(tTime, 0.0, 1.0, tDuration);',
    //'float tProgress = tTime / tDuration;'
  ]

  return shaderVertexInit.join('\n')
}

const _concatTransformNormal = () => {
  const shaderTransformNormal: string[] = []
  return shaderTransformNormal.join('\n')
}
const _concatTransformPosition = (animationPhase: string) => {
  const shaderTransformPosition = [
    animationPhase === 'in' ? 'transformed *= tProgress;' : 'transformed *= 1.0 - tProgress;',
    'transformed += cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);',
  ]
  return shaderTransformPosition.join('\n')
}

export const _concatVertexShader = (animationPhase: string) => {
  return [
    THREE.ShaderChunk['common'],
    THREE.ShaderChunk['uv_pars_vertex'],
    THREE.ShaderChunk['uv2_pars_vertex'],
    THREE.ShaderChunk['envmap_pars_vertex'],
    THREE.ShaderChunk['color_pars_vertex'],
    THREE.ShaderChunk['morphtarget_pars_vertex'],
    THREE.ShaderChunk['skinning_pars_vertex'],
    THREE.ShaderChunk['logdepthbuf_pars_vertex'],

    _concatFunctions(),

    _concatParameters(),

    'vec4 lineartoLinear( in vec4 value) {',
    'return value;',
    '}',

    'vec4 mapTexelToLinear(vec4 value) {',
    'return lineartoLinear(value);',
    '}',

    'void main() {',

    _concatVertexInit(),

    THREE.ShaderChunk['uv_vertex'],
    THREE.ShaderChunk['uv2_vertex'],
    THREE.ShaderChunk['color_vertex'],
    THREE.ShaderChunk['skinbase_vertex'],

    '	#ifdef USE_ENVMAP',

    THREE.ShaderChunk['beginnormal_vertex'],

    _concatTransformNormal(),

    THREE.ShaderChunk['morphnormal_vertex'],
    THREE.ShaderChunk['skinnormal_vertex'],
    THREE.ShaderChunk['defaultnormal_vertex'],

    '	#endif',

    THREE.ShaderChunk['begin_vertex'],

    _concatTransformPosition(animationPhase),

    THREE.ShaderChunk['morphtarget_vertex'],
    THREE.ShaderChunk['skinning_vertex'],
    THREE.ShaderChunk['project_vertex'],
    THREE.ShaderChunk['logdepthbuf_vertex'],

    THREE.ShaderChunk['worldpos_vertex'],
    THREE.ShaderChunk['envmap_vertex'],
    '}',
  ].join('\n')
}

export const computeCentroid = (
  indices: ArrayLike<number>,
  positions: ArrayLike<number>,
  i: number,
) => {
  const index1 = indices[i]
  const index2 = indices[i + 1]
  const index3 = indices[i + 2]
  const vertex1 = [positions[index1 * 3], positions[index1 * 3 + 1], positions[index1 * 3 + 2]]
  const vertex2 = [positions[index2 * 3], positions[index2 * 3 + 1], positions[index2 * 3 + 2]]
  const vertex3 = [positions[index3 * 3], positions[index3 * 3 + 1], positions[index3 * 3 + 2]]

  const vector = new THREE.Vector3(
    vertex1[0] + vertex2[0] + vertex3[0],
    vertex1[1] + vertex2[1] + vertex3[1],
    vertex1[2] + vertex2[2] + vertex3[2],
  ).divideScalar(3)

  return vector
}

// https://discourse.threejs.org/t/threejs-r111-it-normal-but-threejs-r131-it-error-using-shadermaterial-error-maptexeltolinear-no-matching/29544/7
export const fragmentShader = `
uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>

vec4 lineartoLinear( in vec4 value) {
  return value;
}

vec4 mapTexelToLinear(vec4 value) {
  return lineartoLinear(value);
}
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight;
	reflectedLight.directDiffuse = vec3( 0.0 );
	reflectedLight.directSpecular = vec3( 0.0 );
	reflectedLight.indirectDiffuse = diffuseColor.rgb;
	reflectedLight.indirectSpecular = vec3( 0.0 );
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}
`
