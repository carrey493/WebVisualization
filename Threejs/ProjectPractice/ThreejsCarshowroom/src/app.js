import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AxesHelper,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import pkq from "./public/pkq1.jpg";

let scene, camera, renderer, controls, mesh;

//初始化场景
function initScene() {
  scene = new Scene();
}

//初始化相机
function initCamera() {
  //使用透视相机 参数：夹角 宽高比 近 远
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.z = 10;
}

//初始化渲染器
function initRender() {
  renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

//初始化坐标系
function initAxesHelper() {
  const axesHelper = new AxesHelper(3);
  scene.add(axesHelper); //添加场景
}

//初始化控制器
function initOrbitControls() {
  controls = new OrbitControls(camera, renderer.domElement);
}

//初始化物体
function initMesh() {
  // 形状
  const geometry = new BoxGeometry(1, 1, 1);
  // 花纹
  const texture = new THREE.TextureLoader().load(pkq);
  // 材质
  const material = new MeshBasicMaterial({
    color: "yellow",
    map: texture,
  });
  mesh = new Mesh(geometry, material);
  scene.add(mesh);
}

function init() {
  initScene();
  initCamera();
  initRender();
  initAxesHelper();
  initOrbitControls();
  initMesh();
}

const coords = { x: 0 }; // Start at (0, 0)

const tween = new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
  .to({ x: 3 }, 1000) // Move to (300, 200) in 1 second.
  .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
  .onUpdate((that) => {
    mesh.position.x = that.x;
  })
  .start(); // Start the tween immediately.

init();

function render(time) {
  //动画
  // if (mesh.position.x < 3) mesh.position.x += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  tween.update(time);
}

render();

window.addEventListener('resize', function () {
  // camera
  camera.aspect = window.innerWidth / window.innerHeight
  // 重新计算投影矩阵
  camera.updateProjectionMatrix()

  // renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
})