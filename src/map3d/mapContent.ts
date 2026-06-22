import gsap from "gsap";
import * as THREE from "three";
import {
  drawLineBetween2Spot,
  generateMapLabel2D,
  generateMapObject3D,
  generateMapSpot,
  getDynamicMapScale,
} from "./drawFunc";
import { mapConfig } from "./mapConfig";
import { drawRadar, RadarOption, radarData } from "./radar";
import { disposeObject3D } from "./dispose";
import { MapRuntime } from "./runtime";

export function buildMapContent(runtime: MapRuntime) {
  const { currentDom, geoJson, projectionFnParam, scene } = runtime;

  const { mapObject3D, label2dData } = generateMapObject3D(
    geoJson,
    projectionFnParam
  );
  runtime.mapObject3D = mapObject3D;
  scene.add(mapObject3D);

  const mapScale = getDynamicMapScale(mapObject3D, currentDom);

  const labelObject2D = generateMapLabel2D(label2dData);
  mapObject3D.add(labelObject2D);

  const { spotList, spotObject3D } = generateMapSpot(label2dData);
  runtime.spotList = spotList;
  mapObject3D.add(spotObject3D);

  loadConeModels(runtime, label2dData);
  buildFlyLines(runtime, label2dData);
  buildRadar(runtime);
  buildHelpers(runtime);
  buildLight(runtime);

  runtime.scaleTween = gsap.to(mapObject3D.scale, {
    x: mapScale,
    y: mapScale,
    z: 1,
    duration: 1,
  });
}

function loadConeModels(runtime: MapRuntime, label2dData: any[]) {
  const modelObject3D = new THREE.Object3D();

  runtime.gltfLoader.load("/models/cone.glb", (glb) => {
    if (runtime.disposed) {
      disposeObject3D(glb.scene);
      return;
    }

    label2dData.forEach((item: any) => {
      const { featureCenterCoord } = item;
      const clonedModel = glb.scene.clone();
      const mixer = new THREE.AnimationMixer(clonedModel);
      const clonedAnimations = glb.animations.map((clip) => {
        return clip.clone();
      });

      clonedAnimations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });

      runtime.modelMixers.push(mixer);
      clonedModel.position.set(
        featureCenterCoord[0],
        -featureCenterCoord[1],
        mapConfig.spotZIndex
      );
      clonedModel.scale.set(0.3, 0.3, 0.6);
      modelObject3D.add(clonedModel);
    });

    runtime.mapObject3D?.add(modelObject3D);
  });
}

function buildFlyLines(runtime: MapRuntime, label2dData: any[]) {
  const maxLineCount = 5;
  const connectLine: any[] = [];

  for (let count = 0; count < maxLineCount; count++) {
    const midIndex = Math.floor(label2dData.length / 2);
    const indexStart = Math.floor(Math.random() * midIndex);
    const indexEnd = Math.floor(Math.random() * midIndex) + midIndex - 1;
    connectLine.push({
      indexStart,
      indexEnd,
    });
  }

  const flyObject3D = new THREE.Object3D();
  connectLine.forEach((item: any) => {
    const { indexStart, indexEnd } = item;
    const { flyLine, flySpot } = drawLineBetween2Spot(
      label2dData[indexStart].featureCenterCoord,
      label2dData[indexEnd].featureCenterCoord
    );
    flyObject3D.add(flyLine);
    flyObject3D.add(flySpot);
    runtime.flySpotList.push(flySpot);
  });
  runtime.mapObject3D?.add(flyObject3D);
}

function buildRadar(runtime: MapRuntime) {
  radarData.forEach((item: RadarOption) => {
    const planeMesh = drawRadar(item, runtime.ratio);
    runtime.scene.add(planeMesh);
  });
}

function buildHelpers(runtime: MapRuntime) {
  runtime.scene.add(runtime.cameraHelper);

  runtime.axesHelper = new THREE.AxesHelper(100);
  runtime.scene.add(runtime.axesHelper);
}

function buildLight(runtime: MapRuntime) {
  runtime.light = new THREE.PointLight(0xffffff, 1.5);
  runtime.light.position.set(0, -5, 30);
  runtime.scene.add(runtime.light);

  runtime.lightHelper = new THREE.PointLightHelper(runtime.light);
  runtime.scene.add(runtime.lightHelper);
}
