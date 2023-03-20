import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { generateMapObject3D } from "./drawFunc";
import { GeoJsonType } from "./typed";

interface Props {
  geoJson: GeoJsonType;
}

let lastPick: any = null;

function Map3D(props: Props) {
  const { geoJson } = props;
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
    // if (!currentDom.hasChildNodes()) {
    //   currentDom.appendChild(renderer.domElement);
    // }
    // 这里修改为下面写法，否则 onresize 不生效
    if (currentDom.childNodes[0]) {
      currentDom.removeChild(currentDom.childNodes[0]);
    }
    currentDom.appendChild(renderer.domElement);

    /**
     * 初始化模型（绘制3D模型）
     */
    const mapObject3D = generateMapObject3D(geoJson);
    scene.add(mapObject3D);

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

    // 视窗伸缩
    function onResize() {
      // 更新摄像头
      camera.aspect = currentDom.clientWidth / currentDom.clientHeight;
      // 更新摄像机的投影矩阵
      camera.updateProjectionMatrix();
      // 更新渲染器
      renderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
      // 设置渲染器的像素比例
      renderer.setPixelRatio(window.devicePixelRatio);
    }

    /**
     * 设置 raycaster
     */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // 鼠标移入事件
    const onMouseMoveEvent = (e: MouseEvent) => {
      const intersects = raycaster.intersectObjects(scene.children);
      pointer.x = (e.clientX / currentDom.clientWidth) * 2 - 1;
      pointer.y = -(e.clientY / currentDom.clientHeight) * 2 + 1;

      // 如果存在，则鼠标移出需要重置
      if (lastPick) {
        lastPick.object.material[0].color.set("#06092A");
      }
      lastPick = null;
      // lastPick = intersects.find(
      //   (item: any) => item.object.material && item.object.material.length === 2
      // );
      // 优化
      lastPick = intersects.find(
        (item: any) => item.object.userData.isChangeColor
      );

      if (lastPick) {
        if (lastPick.object.material[0]) {
          lastPick.object.material[0].color.set("#3497F5");
        }
      }
    };

    const animate = function () {
      requestAnimationFrame(animate);
      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(pointer, camera);
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", onResize, false);
    window.addEventListener("mousemove", onMouseMoveEvent, false);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMoveEvent);
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>;
}

export default Map3D;
