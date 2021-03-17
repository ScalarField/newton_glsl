import * as THREE from "three";

import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";

const rand = (min, max)=>min+Math.random()*(max-min);

//Environment
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({canvas, preserveDrawingBuffer: true});

//Camera
const fov = 75, aspect = 2, near = 0.1, far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

//Scene
const scene = new THREE.Scene();

//Polynomial
let maxX = 2;
let [minRoots, maxRoots] = [3, 10];
let [minFreq, maxFreq] = [-0.5, 0.5];
let [minBright, maxBright] = [0.7, 1];
let [minBFreq, maxBFreq] = [0.1, 0.5];

let rootCount = Math.floor(Math.random()*(maxRoots - minRoots))+minRoots;
let poly = [], radii = [], freq = [],
	brightness = [], bfreq = [];
for(let i=0;i<rootCount;i++){
	let f1 = rand(minFreq, maxFreq),
		f2 = rand(minFreq, maxFreq);
	let r = rand(0, maxX*Math.sqrt(2));
	poly.push(r, 0, 1);
	freq.push(f1, f2);
	radii.push(r);
	brightness.push(1);
	bfreq.push(rand(minBFreq, maxBFreq));
}

//Panel
const geo = new THREE.PlaneGeometry(2, 2);
const mat = new THREE.ShaderMaterial({
	uniforms: {
		aspect: {
			type: "float",
			value: canvas.height/canvas.width
		},
		poly: {
			type: "vec3",
			value: poly
		},
		brightness: {
			type: "float",
			value: brightness
		},
		roots: {
			type: "int",
			value: rootCount
		},
	},
	vertexShader: vertexShader,
	fragmentShader: fragmentShader
});
const panel = new THREE.Mesh(geo, mat);
scene.add(panel);

//Draw
renderer.render(scene, camera);

//Animate
let prevTime, deltaTime;
function update(time){
	if(!prevTime){ prevTime = time; }
	deltaTime = time - prevTime;
	prevTime = time;

	let dt = time/1000;

	mat.uniforms.aspect.value = canvas.height/canvas.width;
	for(let i=0;i<rootCount;i++){
		poly[3*i] = radii[i]*Math.cos(dt*freq[2*i]);
		poly[3*i+1] = radii[i]*Math.sin(dt*freq[2*i+1]);
		brightness[i] = (maxBright-minBright)*Math.cos(dt*bfreq[i]) + 0.5*(maxBright+minBright);
	}

	if(resizeRenderer(renderer)){
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth/canvas.clientHeight;
		camera.updateProjectionMatrix();
	}
	renderer.render(scene, camera);
	requestAnimationFrame(update);
}
requestAnimationFrame(update);

//Resize
function resizeRenderer(renderer){
	const canvas = renderer.domElement;
	const w = canvas.clientWidth;
	const h = canvas.clientHeight;
	const resize = w !== canvas.width || h !== canvas.height;
	if(resize){
		renderer.setSize(w, h, false);
	}
	return resize;
}

