// ====== Imports ======

import OnirixSDK from "https://sdk.onirix.com/0.3.0/ox-sdk.esm.js";
import * as THREE from 'https://cdn.skypack.dev/three@0.127.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';

// ====== ThreeJS ======

var renderer, scene, camera, floor, reticle, envMap, ThreeDModel,clock, animationMixers, action, mixer, originSize;
var ismodelPlaced = false;

function setupRenderer(rendererCanvas) {
    
    const width = rendererCanvas.width;
    const height = rendererCanvas.height;
    
    // Initialize renderer with rendererCanvas provided by Onirix SDK
    renderer = new THREE.WebGLRenderer({ canvas: rendererCanvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Ask Onirix SDK for camera parameters to create a 3D camera that fits with the AR projection.
    const cameraParams = OX.getCameraParameters();
    camera = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, 0.1, 1000);
    camera.matrixAutoUpdate = false;
    
    // Create an empty scene
    scene = new THREE.Scene();
    
    // Add some lights
    const hemisphereLight = new THREE.HemisphereLight(0xbbbbff, 0x444422);
    scene.add(hemisphereLight);
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    // Load env map
    const textureLoader = new THREE.TextureLoader();
    envMap = textureLoader.load('envmap.jpg');
	envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.encoding = THREE.sRGBEncoding;

    // Add transparent floor to generate shadows
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({
          color: 0xff00ff,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide
        })
    );
  
    // Rotate floor to be horizontal
    floor.rotateX(Math.PI / 2)

    //animation
    animationMixers = [];
    clock = new THREE.Clock(true);

}

function updatePose(pose) {

    // When a new pose is detected, update the 3D camera
    let modelViewMatrix = new THREE.Matrix4();
    modelViewMatrix = modelViewMatrix.fromArray(pose);
    camera.matrix = modelViewMatrix;
    camera.matrixWorldNeedsUpdate = true;

    render();

}

function onResize() {

    // When device orientation changes, it is required to update camera params.
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const cameraParams = OX.getCameraParameters();
    camera.fov = cameraParams.fov;
    camera.aspect = cameraParams.aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

}

function render() {

    // Just render the scene
    renderer.render(scene, camera);
}
function renderLoop() {

        // Update model animations at a fixed framerate (delta time)
        const delta = clock.getDelta();
        animationMixers.forEach(mixer => {
            mixer.update(delta);
        });

        render();
        requestAnimationFrame(() => renderLoop());

}

function onHitResult(hitResult) {
    if (reticle && !ismodelPlaced && ThreeDModel) {
        document.getElementById('loading').style.display = 'none';

        document.getElementById("transform-controls").style.display = 'block';
        document.getElementById("slider-controls").style.display = 'block';//ggongjukim// ??????????????? ????????? ????????? ???????????? 
        reticle.position.copy(hitResult.position);
        
        //ThreeDModel.position.copy(hitResult.position);//ggongjukim
        //ver2
        // var levitation =    //?????????????????? ?????? ??????????????? ?????? ??????  
        var loadingPosition = new THREE.Vector3(hitResult.position.x, hitResult.position.y + 0.1, hitResult.position.z);
        ThreeDModel.position.copy(loadingPosition);
        // action.play();


    }else if(!ThreeDModel){//????????? ?????????
        // var loadingText = document.createElement('h1');
        // loadingText.innerHTML = '??????????????????...'
        document.getElementById('loading').style.display = 'block';
    }
}

function placemodel() {
    var placeButton = document.getElementById("tap-to-place");
    if(placeButton.value === "placeModel"){//?????? ??????????????? ???????????? 
        console.log("placeModel");
        //??????
        ismodelPlaced = true;//hittest??????
        // //ver1
        // scene.add(ThreeDModel);//ThreeDModel ????????? ??????
        // ThreeDModel.position.copy(reticle.position);
        // scene.remove(reticle);//reticle ??????

        //ver2 y position??? ?????????
        scene.remove(reticle);//reticle ??????
        ThreeDModel.position.copy(reticle.position);
        if (mixer) 
            action.play();


        //ui dom element
        document.getElementById("slider-controls").style.display = 'none';//ggongjukim //?????? ???????????? slide control ?????? ?????????
        //ui button
        placeButton.value = 'replace';
        placeButton.innerText = '?????? ????????????'; 
    }else{//replace
        console.log("replace");

        //replace ?????? ?????? ?????????
        ismodelPlaced = false;
        // //ver1
        // scene.add(reticle);//reticle ????????? ??????
        // scene.remove(ThreeDModel);//ThreeDModel ??????

        //ver2 y position??? ?????????
        scene.add(reticle);//reticle ????????? ??????
        if (mixer) action.stop();

        //ui dom element
        // document.getElementById("slider-controls").style.display = 'none';//ggongjukim //?????? ????????? ????????? ???????????????
        //ismodelPlaced = false; ?????? onHitResult?????? ???????????? ???????????? ????????? ?????? ?????? ?????? 
        
        //ui button ??????
        placeButton.value = 'placeModel';
        placeButton.innerText = '?????? ????????????';
    }
}

function scalemodel(value) {
    // // reticle.scale.set(value, value, value);
    // var originScale = ThreeDModel.getSize();
    // console.log(originScale);
    ThreeDModel.scale.set(originSize*value, originSize*value, originSize*value);
    // console.log(value);
    // ThreeDModel.scale.multiplyScalar(value);
}

function rotatemodel(value) {
    // reticle.rotation.y = value;
    ThreeDModel.rotation.y = value;
}

function changemodelColor(value) {
    ThreeDModel.traverse((child) => {
        if (child.material && child.material.name === 'modelPaint') {
            child.material.color.setHex(value);
        }
    });
}


// ====== Onirix SDK ======
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyMDIsInByb2plY3RJZCI6MTQ0MjgsInJvbGUiOjMsImlhdCI6MTYxNjc1ODY5NX0.8F5eAPcBGaHzSSLuQAEgpdja9aEZ6Ca_Ll9wg84Rp5k//github
let OX = new OnirixSDK("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5OTMsInByb2plY3RJZCI6MjI1NjMsInJvbGUiOjMsImlhdCI6MTY0MzAwMjU5OX0.80ufqvDSnx_CTY_Lu3Tfkp1iRdAtIT384gyVlWJ0tQI");

let config = {
    mode: OnirixSDK.TrackingMode.Surface
}

OX.init(config).then(rendererCanvas => {

    // Setup ThreeJS renderer
    setupRenderer(rendererCanvas);

    // Initialize render loop //??? ????????? ????????? ?????? ??????
    renderLoop();

    // Load reticle reticle
    // range_rover.glb
    //https://realistic.hscdn.com/contents/c2f27d89-8917-42d3-857e-a9fe96130350.glb
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("glbreticle.glb", (gltf) => {
        
        reticle = gltf.scene;
        reticle.traverse((child) => {
            if (child.material) {
                console.log("updating material");
                child.material.envMap = envMap;
                child.material.needsUpdate = true;
            }
        });
        reticle.scale.set(2,2,2);
        scene.add(reticle);
        
        // All loaded, so hide loading screen
        document.getElementById("loading-screen").style.display = 'none';

        document.getElementById("initializing").style.display = 'block';

        document.getElementById("tap-to-place").addEventListener('click', () => { // ?????? ??????
            placemodel();
        });
    });

    //ThreeDModel loader ??? ???????????? 
    //../bee-gltf/source/bee_gltf.gltf
    const ThreeDModelgltfLoader = new GLTFLoader();
    ThreeDModelgltfLoader.load("https://realistic.hscdn.com/contents/3d_asset/intangible/?????????_??????%20?????????%20??????.glb", (gltf) => {
        ThreeDModel = gltf.scene;
        ThreeDModel.traverse((child) => {
            if (child.material) {
                console.log("ThreeDModel updating material");
                child.material.envMap = envMap;
                child.material.needsUpdate = true;
            }
        });


        const scaleSlider = document.getElementById("scale-slider");
        scaleSlider.addEventListener('input', () => {
            scalemodel(scaleSlider.value / 100);
        });
        const rotationSlider = document.getElementById("rotation-slider");
        rotationSlider.addEventListener('input', () => {
            rotatemodel(rotationSlider.value * Math.PI / 180);
        });


        //?????? ??????
        originSize = 0.02;
        ThreeDModel.scale.set(originSize, originSize, originSize);

        function checkModelSize(num){
            var ThreeDModelBox = new THREE.Box3().setFromObject(ThreeDModel);
            var ThreeDModelBoxMax = ThreeDModelBox.max;
            var ThreeDModelBoxMin = ThreeDModelBox.min;
            var ThreeDModelBoxWidth = ThreeDModelBoxMax.x-ThreeDModelBoxMin.x;
            var isModelSuitable = ((ThreeDModelBoxWidth<3.0)&&(ThreeDModelBoxWidth>0.3));//false;
            console.log(isModelSuitable);
            if(!isModelSuitable){
                console.log("?????? ????????? ????????????");
                if(ThreeDModelBoxWidth>=3.0){
                    console.log("????????????" + num);
                    originSize = originSize * 0.1 * num;
                    ThreeDModel.scale.set(originSize, originSize, originSize);
                    checkModelSize(++num);
                }
                else if(ThreeDModelBoxWidth<=0.3){
                    console.log("???????????????" + num);
                    originSize = originSize * 10 * num;
                    ThreeDModel.scale.set(originSize, originSize, originSize);
                    checkModelSize(++num);
                }
            }else{
                console.log("?????? ?????? ??????");
            }
        }
        checkModelSize(1);


        scene.add(ThreeDModel);//ver2

        //animation
        // Play model animation
        if(gltf.animations[ 0 ]){
            const animations = gltf.animations;
            mixer = new THREE.AnimationMixer(ThreeDModel);//mixer
            action = mixer.clipAction(animations[0]);//action ??????????????? ??????
            // action.play();
            animationMixers.push(mixer);
        }
    });


    OX.subscribe(OnirixSDK.Events.OnPose, function (pose) {
        updatePose(pose);
    });

    OX.subscribe(OnirixSDK.Events.OnResize, function () {
        onResize();
    });

    // OX.subscribe(OnirixSDK.Events.OnTouch, function (touchPos) {
    //     onTouch(touchPos);
    // });

    OX.subscribe(OnirixSDK.Events.OnHitTestResult, function (hitResult) {
        document.getElementById("initializing").style.display = 'none';
        onHitResult(hitResult);
    });

}).catch((error) => {

    // An error ocurred, chech error type and display it
    document.getElementById("loading-screen").style.display = 'none';

    switch (error.name) {

        case 'INTERNAL_ERROR':
            document.getElementById("error-title").innerText = 'Internal Error';
            document.getElementById("error-message").innerText = 'An unespecified error has occurred. Your device might not be compatible with this experience.';
            break;

        case 'CAMERA_ERROR':
            document.getElementById("error-title").innerText = 'Camera Error';
            document.getElementById("error-message").innerText = 'Could not access to your device\'s camera. Please, ensure you have given required permissions from your browser settings.';
            break;

        case 'SENSORS_ERROR':
            document.getElementById("error-title").innerText = 'Sensors Error';
            document.getElementById("error-message").innerText = 'Could not access to your device\'s motion sensors. Please, ensure you have given required permissions from your browser settings.';
            break;

        case 'LICENSE_ERROR':
            document.getElementById("error-title").innerText = 'License Error';
            document.getElementById("error-message").innerText = 'This experience does not exist or has been unpublished.';
            break;

    }

    document.getElementById("error-screen").style.display = 'flex';

});