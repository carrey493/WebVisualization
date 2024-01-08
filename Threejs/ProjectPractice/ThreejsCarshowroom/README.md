# Three.js实现3D汽车展厅

## 一、背景

越来越多的Web应用使用到了3D技术，当前市面上有着丰富的业务应用场景︰VR看房、VR购物、3D小游戏，企业网站三维呈现，数字孪生等......这些3D技术不仅丰富了用户的体验，而且也提高了企业的管理效率。

## 二、基础

### 1. 什么是Three.js

>Thee.js是一款运行在浏览器中的3D引擎,你可以用它创建各种三维场景,包括了摄影机、光影、材质等各种对象。

### 2. Three.js和WebGL关系

>WebGL是基于OpenGL设计的面向web的图形标准,提供了一系列JavaScript API，通过这些API进行图形渲染将得以利用图形硬件从而获得较高性能。

### 3. 基本元素

1. 场景

**定义**

「场景」︰是我们每个Three.js项目里面放置内容的容器，我们也可以拥有多个场景进行切换展示，你可以在场景内放置你的模型，灯光和照相机。还可以通过调整场景的位置，让场景内的所有内容都一起跟着调整位置。你可以理解为拍电影中的舞台，它决定了你可以在什么地方摆放什么物体。

>const scene = new THREE.Scene() ; //创建—个场景

2. 相机

相机就类似我们的人眼，可以观察到环境中的物体，以及光线效果等。

>「相机」:Threejs必须要往场景中添加一个相机，相机用来确定位置、方向、角度，相机看到的内容就是我最终在屏幕上看到的内容。在程序运行过程中，可以调整相机的位置、方向和角度。

**透视相机**

它可以提供—个近大远小的3D视觉效果.

PerspectiveCamera通过四个属性来定义一个视锥。near定义了视锥的前端，far定义了后端，fov是视野，通过计算正确的高度来从摄像机的位置获得指定的以near为单位的视野，定义的是视锥的前端和后端的高度。aspect间接地定义了视锥前端和后端的宽度，实际上视锥的宽度是通过高度乘以aspect 来得到的。

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518152405523-1856884758.png)

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518152455167-1472706743.png)

```js
const fov =45;
const aspect = 2; // canvas 的默认宽高300:150
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
camera. position.set(0,10,20);
```

**正交相机**

正交相机的特点就是视椎体的是一个立方体，在这种投影模式下，无论物体距离相机距离远或者近

在最终渲染的图片中物体的大小都保持不变，这对于渲染2D场景或者UI元素是非常有用的。

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518152710973-107343168.png)

3. 灯光

假如没有光，摄像机看不到任何东西，因此需要往场景添加光源，为了跟真实世界更加接近，Threejs支持模拟不同光源，展现不同光照效果，有点光源、平行光、聚光灯、环境光等。

**AmbientLight(环境光)**

环境光会均匀的照亮场景中的所有物体，环境光不能用来投射阴影，因为它没有方向。(反射光)

>const light = new THREE.AmbientLight( Ox404040 );

**平行光(DirectionalLight)**

平行光是沿着特定方向发射的光。这种光的表现像是无限远,从它发出的光线都是平行的。常常用平行光来模拟太阳光的效果;太阳足够远，因此我们可以认为太阳的位置是无限远，所以我们认为从太阳发出的光线也都是平行的。

>const directionallLight = new THREE.DirectionallLight( Oxffffff,0.5 );


**点光源(PointLight)**

从一个点向各个方向发射的光源。一个常见的例子是模拟一个灯泡发出的光。

**聚光灯(SpotLight)**

光线从一个点沿一个方向射出，随着光线照射的变远，光线圆锥体的尺寸也逐渐增大。

4. 网格

>Math模型

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518153323776-1170864473.png)

**2D几何体**

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518153403155-1169982701.png)

**3D几何体**

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518153418896-130387428.png)

**材质**

有了形状，可能渲染出来的图形没有美丽的样子，这时候材质就出来了。

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518153734534-2006483699.png)

同一个物体，同样的光照，在不同的材质下，他的效果不同。下面这张图可以比较直观的看到不同材质的反馈效果

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518153804883-519215.png)

各种标准材质的构建速度从最快到最慢:MeshBasicMaterial => MeshLambertMaterial => MeshPhongMaterial => MeshStandardMaterial => MeshPhysicalMaterial。构建速度越慢的材质，做出的场景越逼真，但在低功率或移动设备上，你可能需要思考代码的设计，使用构建速度较快的材质。

```js
const material = new THREE.MeshPhongMaterial({
    color: OXFF0000,//红色(也可以使用CSS的颜色字符串)
    flatShading: true,
});
```

**纹理(Texture) (简单理解为皮肤)**

```js
var texture = THREE.ImageUtils.loadTexture(" ../assets/textures/general/" + image)
var mat =newTHREE.MeshPhongMaterial();
mat.map = texture;
var mesh =new THREE.Mesh(geom,mat);return mesh;
```

5. 渲染器(Render)

这可以说是three.js的主要对象。你传入一个场景(Scene)和一个摄像机(Camera)到渲染器(Renderer)中，然后它会将摄像机视椎体中的三维场景渲染成一个二维图片显示在画布上。

![](https://img2023.cnblogs.com/blog/2332774/202305/2332774-20230518154531656-914962552.png)


### 三、工程配置和库

1. parcel官网：

Building a web app with Parcel

A getting started quide walking through how to setup a oraject with Parcel.

https://parceljs.org/getting-started/webapp/

XI

```js
 "transformers": {
    "*.{gltf,glb,png,jpg,0bj,exr}":
    ["@parcel/transformer-raw"
    ]
    }
```

2. tween.is

https://github.com/tweenjs/tween.js

### 四、辅助工具

1. AxesHelper
2. lil-gui：https://github.com/georgealways/lil-gui
3. GridHelper
4. OrbitControls控制器