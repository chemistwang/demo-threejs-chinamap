import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { initCamera } from "./camera";
import { initScene } from "./scene";
import { disposeObject3D } from "./dispose";
import { GeoJsonType, ProjectionFnParamType } from "./typed";
import { gsap } from "gsap";

export type TooltipData = {
  text: string;
};

export type MapRuntime = {
  currentDom: HTMLDivElement;
  labelRendererDom: HTMLDivElement;
  toolTipDom: HTMLDivElement | null;
  geoJson: GeoJsonType;
  projectionFnParam: ProjectionFnParamType;
  dblClickFn: (customProperties: any) => void;
  setToolTipData: (data: TooltipData) => void;
  requestRebuild: () => void;
  disposed: boolean;
  animationFrameId?: number;
  lastPick: any;
  ratio: { value: number };
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraHelper: THREE.CameraHelper;
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  controls: OrbitControls;
  mapObject3D?: THREE.Object3D;
  spotList: any[];
  flySpotList: any[];
  modelMixers: THREE.AnimationMixer[];
  gltfLoader: GLTFLoader;
  dracoLoader: DRACOLoader;
  scaleTween?: gsap.core.Tween;
  axesHelper?: THREE.AxesHelper;
  light?: THREE.PointLight;
  lightHelper?: THREE.PointLightHelper;
  gui?: dat.GUI;
  cleanupCallbacks: Array<() => void>;
};

export type CreateMapRuntimeParams = {
  currentDom: HTMLDivElement;
  labelRendererDom: HTMLDivElement;
  toolTipDom: HTMLDivElement | null;
  geoJson: GeoJsonType;
  projectionFnParam: ProjectionFnParamType;
  dblClickFn: (customProperties: any) => void;
  setToolTipData: (data: TooltipData) => void;
  requestRebuild: () => void;
};

export function createMapRuntime(params: CreateMapRuntimeParams): MapRuntime {
  const {
    currentDom,
    labelRendererDom,
    toolTipDom,
    geoJson,
    projectionFnParam,
    dblClickFn,
    setToolTipData,
    requestRebuild,
  } = params;

  const scene = initScene();
  const { camera, cameraHelper } = initCamera(currentDom);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  while (currentDom.firstChild) {
    currentDom.removeChild(currentDom.firstChild);
  }
  currentDom.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  while (labelRendererDom.firstChild) {
    labelRendererDom.removeChild(labelRendererDom.firstChild);
  }
  labelRendererDom.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, labelRenderer.domElement);
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  gltfLoader.setDRACOLoader(dracoLoader);

  return {
    currentDom,
    labelRendererDom,
    toolTipDom,
    geoJson,
    projectionFnParam,
    dblClickFn,
    setToolTipData,
    requestRebuild,
    disposed: false,
    lastPick: null,
    ratio: { value: 0 },
    scene,
    camera,
    cameraHelper,
    renderer,
    labelRenderer,
    controls,
    spotList: [],
    flySpotList: [],
    modelMixers: [],
    gltfLoader,
    dracoLoader,
    cleanupCallbacks: [],
  };
}

export function cleanupMapRuntime(runtime: MapRuntime) {
  runtime.disposed = true;

  if (runtime.animationFrameId) {
    cancelAnimationFrame(runtime.animationFrameId);
  }

  runtime.cleanupCallbacks.forEach((cleanup) => cleanup());
  runtime.scaleTween?.kill();
  runtime.controls.dispose();
  runtime.dracoLoader.dispose();
  runtime.gui?.destroy();
  runtime.modelMixers.forEach((mixer) => mixer.stopAllAction());
  disposeObject3D(runtime.scene);
  runtime.renderer.dispose();

  if (runtime.renderer.domElement.parentElement === runtime.currentDom) {
    runtime.currentDom.removeChild(runtime.renderer.domElement);
  }

  if (
    runtime.labelRenderer.domElement.parentElement === runtime.labelRendererDom
  ) {
    runtime.labelRendererDom.removeChild(runtime.labelRenderer.domElement);
  }

  runtime.lastPick = null;
}
