import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function Map3D() {
  const mapRef = useRef<any>();

  useEffect(() => {
    const currentDom = mapRef.current;

    /**
     * 初始化场景
     */
    const scene = new THREE.Scene();

    /**
     * 初始化摄像机
     */
    const camera = new THREE.PerspectiveCamera(
      30,
      currentDom.clientWidth / currentDom.clientHeight,
      0.1,
      1000
    );
    camera.position.set(-10, -90, 130);

    /**
     * 初始化渲染器
     */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
    // 防止开发时重复渲染
    if (!currentDom.hasChildNodes()) {
      currentDom.appendChild(renderer.domElement);
    }

    /**
     * 初始化模型（地图模型绘制的逻辑将在这里替换）
     */
    const geometry = new THREE.BoxGeometry(1, 2, 3);
    const material = new THREE.MeshBasicMaterial({ color: "#fff" });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    /**
     * 初始化 CameraHelper
     */
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);

    /**
     * 初始化 AxesHelper
     */
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    /**
     * 初始化控制器
     */
    new OrbitControls(camera, renderer.domElement);

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>;
}

export default Map3D;
