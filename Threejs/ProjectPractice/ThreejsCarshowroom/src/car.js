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
  Vector2,
  Raycaster,
  TextureLoader,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import LBJN from "./public/Lamborghini.glb";
import GUI from "lil-gui";
import messi from "./public/messi.JPG";
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

const gui = new GUI();

let scene, camera, renderer, controls, mesh, grid;

let doors = [];

let carStatus = "";

// 车身材质
let bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: "red",
  metalness: 1,
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
});

//玻璃材质
let glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#793e3e",
  metalness: 0.25,
  roughness: 0,
  transmission: 1.0, //透光性.transmission属性可以让一些很薄的透明表面，例如玻璃，变得更真实一些。
});

//初始化场景
function initScene() {
  scene = new Scene();
}

//初始化相机
function initCamera() {
  //使用透视相机 参数：夹角 宽高比 近 远
  camera = new PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  // camera.position.z = 10;
  camera.position.set(4.25, 1.4, -4.5);
}

//初始化渲染器
function initRender() {
  renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 支持阴影
  renderer.shadowMap.enabled = true;
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
  controls.enableDamping = true; //设置惯性
  controls.maxDistance = 9;
  controls.minAzimuthAngle = 1; //设置缩放范围

  controls.minPolarAngle = 0; // 设置缩放最小缩放角度
  controls.maxPolarAngle = (90 / 360) * 2 * Math.PI; // 设置缩放最大角度
}

// 绘制一个地面网格
function initGridHelper() {
  grid = new THREE.GridHelper(20, 40, "red", "white");
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);
}

function loadCarModel() {
  new GLTFLoader().load(LBJN, function (gltf) {
    const carModel = gltf.scene;
    carModel.rotation.y = Math.PI;

    carModel.traverse((obj) => {
      // 遍历节点
      if (
        obj.name === "Object_103" ||
        obj.name === "Object_64" ||
        obj.name === "Object_77"
      ) {
        // 车身
        obj.material = bodyMaterial;
      } else if (obj.name === "Object_90") {
        // 玻璃
        obj.material = glassMaterial;
      } else if (obj.name === "Empty001_16" || obj.name === "Empty002_20") {
        // 门
        doors.push(obj);
      }
      // 车模型产生阴影
      obj.castShadow = true;
    });
    scene.add(carModel);
  });
}

function initAmbientLight() {
  const ambientLight = new THREE.AmbientLight("#fff", 0.5);
  scene.add(ambientLight);
}

function initFloor() {
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const material = new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide, // 双面绘制
    color: 0x808080,
    metalness: 0, // 金属0 非金属1
    roughness: 0.1, //粗糙度 越小越光滑
  });
  const mesh = new Mesh(floorGeometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// 初始化聚光灯
function initSpotLight() {
  const spotLight = new THREE.SpotLight("#fff", 2);
  spotLight.angle = Math.PI / 8; //散射角度，跟水平线的家教
  spotLight.penumbra = 0.2; //横向:聚光锥的半影衰减百分比
  spotLight.decay = 2; //纵向:沿着光照距高的衰减量。
  spotLight.distance = 30;
  spotLight.shadow.radius = 10;
  //阴影映射宽度，阴影映射高度
  spotLight.shadow.mapSize.set(4096, 4096);
  spotLight.position.set(-5, 10, 1);
  //光照射的方向
  spotLight.target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

// 模拟展厅
function initCylinder() {
  const geometry = new THREE.CylinderGeometry(12, 12, 20, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x6c6c6c,
    side: THREE.DoubleSide,
  });
  const cylinder = new Mesh(geometry, material);
  scene.add(cylinder);
}

function setAnimationDoor(start, end, mesh) {
  console.log(start, end, mesh);
  const tween = new TWEEN.Tween(start)
    .to(end, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);
  console.log(tween);
  tween.onUpdate((that) => {
    mesh.rotation.x = that.x;
  });
  tween.start();
}

function setAnimationCamera(start, end) {
  const tween = new TWEEN.Tween(start)
    .to(end, 3000)
    .easing(TWEEN.Easing.Quadratic.Out);
  tween.onUpdate((that) => {
    //camera. postition和controls.target一起使用
    camera.position.set(that.cx, that.cy, that.cz);
    controls.target.set(that.ox, that.oy, that.oz);
  });
  tween.start();
}

function carOpen() {
  carStatus = "open";
  for (let index = 0; index < doors.length; index++) {
    const element = doors[index];
    console.log(element);
    setAnimationDoor({ x: 0 }, { x: Math.PI / 3 }, element);
  }
}

function carClose() {
  carStatus = "close";
  for (let index = 0; index < doors.length; index++) {
    const element = doors[index];
    setAnimationDoor({ x: Math.PI / 3 }, { x: 0 }, element);
  }
}

function carIn() {
  setAnimationCamera(
    { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 },
    { cx: -0.27, cy: 0.83, Cz: 0.6, ox: 0, oy: 0.5, oz: -3 }
  );
}

function carOut() {
  setAnimationCamera(
    { cx: -0.27, cy: 0.83, Cz: 0.6, ox: 0, oy: 0.5, oz: -3 },
    { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 }
  );
}

function initGUI() {
  let obj = {
    bodyColor: "#6e2121",
    glassColor: "#aaa",
    carOpen,
    carClose,
    carIn,
    carOut,
  };
  gui
    .add(obj, "bodyColor")
    .name("车身颜色")
    .onChange((vlaue) => {
      bodyMaterial.color.set(vlaue);
    });

  gui
    .add(obj, "glassColor")
    .name("玻璃颜色")
    .onChange((vlaue) => {
      glassMaterial.color.set(vlaue);
    });
  gui.add(obj, "carOpen").name("打开车门");

  gui.add(obj, "carClose").name("关闭车门");

  gui.add(obj, "carIn").name("车内视角");

  gui.add(obj, "carOut").name("车外视角");
}

function createSpotlight(color) {
  // 聚光灯函数
  const newObj = new THREE.SpotLight(color, 2); //聚光灯颜色
  newObj.castShadow = true; //聚光灯阴影
  newObj.angle = Math.PI / 6; //聚光灯角度
  newObj.penumbra = 0.2;
  newObj.decay = 2;
  newObj.distance = 50; //聚光灯距离
  return newObj;
}

function initLight() {
  const spotLight1 = createSpotlight("#ffffff");
  const texture = new TextureLoader().load(messi);

  spotLight1.position.set(0, 3, 0); //光照初始位置
  spotLight1.target.position.set(-10, 3, 10); //光照目标位置

  spotLight1.map = texture;
  lightHelper1 = new THREE.SpotLightHelper(spotLight1);
  scene.add(spotLight1);
}

function initMutilColor() {
  //创建三色光源
  rectLight1 = new THREE.RectAreaLight(0xff0000, 50, 1, 10);
  rectLight1.position.set(15, 10, 15);
  rectLight1.rotation.x = -Math.PI / 2;
  rectLight1.rotation.z = -Math.PI / 4;
  scene.add(rectLight1);

  rectLight2 = new THREE.RectAreaLight(0x00ff00, 50, 1, 10);
  rectLight2.position.set(13, 10, 13);
  rectLight2.rotation.x = -Math.PI / 2;
  rectLight2.rotation.z = -Math.PI / 4;
  scene.add(rectLight2);

  rectLight3 = new THREE.RectAreaLight(0x0000ff, 50, 1, 10);
  rectLight3.position.set(11, 10, 11);
  rectLight3.rotation.x = -Math.PI / 2;
  rectLight3.rotation.z = -Math.PI / 4;
  scene.add(rectLight3);

  scene.add(new RectAreaLightHelper(rectLight1));
  scene.add(new RectAreaLightHelper(rectLight2));
  scene.add(new RectAreaLightHelper(rectLight3));

  startColorAnim();
}

function startColorAnim() {
  const carTween = new TWEEN.Tween({ x: -5 })
    .to({ x: 25 }, 2000)
    .easing(TWEEN.Easing.Quadratic.Out);
  carTween.onUpdate(function (that) {
    rectLight1.position.set(15 - that.x, 10, 15 - that.x);
    rectLight2.position.set(13 - that.x, 10, 13 - that.x);
    rectLight3.position.set(11 - that.x, 10, 11 - that.x);
  });
  carTween.onComplete(function (that) {
    rectLight1.position.set(-15, 10, 15);
    rectLight2.position.set(-13, 10, 13);
    rectLight3.position.set(-11, 10, 11);

    rectLight1.rotation.z = Math.PI / 4;
    rectLight2.rotation.z = Math.PI / 4;
    rectLight3.rotation.z = Math.PI / 4;
  });
  carTween.repeat(10);

  const carTween2 = new TWEEN.Tween({ x: -5 })
    .to({ x: 25 }, 2000)
    .easing(TWEEN.Easing.Quadratic.Out);
  carTween2.onUpdate(function (that) {
    rectLight1.position.set(-15 + that.x, 10, 15 - that.x);
    rectLight2.position.set(-13 + that.x, 10, 13 - that.x);
    rectLight3.position.set(-11 + that.x, 10, 11 - that.x);
  });
  carTween2.onComplete(function (that) {
    rectLight1.position.set(15, 10, 15);
    rectLight2.position.set(13, 10, 13);
    rectLight3.position.set(11, 10, 11);
    rectLight1.rotation.z = -Math.PI / 4;
    rectLight2.rotation.z = -Math.PI / 4;
    rectLight3.rotation.z = -Math.PI / 4;
  });

  carTween.start();
}

function init() {
  initScene();
  initCamera();
  initRender();
  // initAxesHelper(); //坐标轴
  initOrbitControls();
  // initGridHelper(); // 网格线
  loadCarModel();
  initAmbientLight();
  initFloor();
  initSpotLight();
  initCylinder(); // 圆柱体
  initGUI();
  initLight();
  initMutilColor(); // 创建灯带
}

init();

function render(time) {
  //动画
  // if (mesh.position.x < 3) mesh.position.x += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  // tween.update(time);

  controls.update();
}

render();

window.addEventListener("resize", function () {
  // camera
  camera.aspect = window.innerWidth / window.innerHeight;
  // 重新计算投影矩阵
  camera.updateProjectionMatrix();

  // renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", onPointclick);

function onPointclick(event) {
  let pointer = {};
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let vector = new Vector2(pointer.x, pointer.y); //光线投射类，用于鼠标交互，可以捕捉到穿过了什么物体
  let raycaster = new Raycaster();
  raycaster.setFromCamera(vector, camera);
  let intersects = raycaster.intersectObjects(scene.children);

  intersects.forEach((item) => {
    if ((item.object.name = "0bject_64" || item.object.name === "Object_77")) {
      if (!carStatus || carStatus === "close ") {
        carOpen();
      } else {
        carClose();
      }
    }
  });
}
