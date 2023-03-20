import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ToolTip from "../tooltip";
import { draw2dLabel, generateMapObject3D } from "./drawFunc";
import { GeoJsonType } from "./typed";

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

export type ProjectionFnParamType = {
  center: [number, number];
  scale: number;
};

interface Props {
  geoJson: GeoJsonType;
  dblClickFn: (customProperties: any) => void;
  projectionFnParam: ProjectionFnParamType;
}

let lastPick: any = null;

function Map3D(props: Props) {
  const { geoJson, dblClickFn, projectionFnParam } = props;
  const mapRef = useRef<any>();
  const map2dRef = useRef<any>();
  const toolTipRef = useRef<any>();

  const [toolTipData, setToolTipData] = useState<any>({
    text: "",
  });

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
     * 创建css2 Renderer 渲染器
     */
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    const labelRendererDom = map2dRef.current;
    if (labelRendererDom?.childNodes[0]) {
      labelRendererDom.removeChild(labelRendererDom.childNodes[0]);
    }
    labelRendererDom.appendChild(labelRenderer.domElement);

    /**
     * 初始化模型（绘制3D模型）
     */
    const { mapObject3D, label2dData } = generateMapObject3D(
      geoJson,
      projectionFnParam
    );
    scene.add(mapObject3D);

    /**
     * 绘制 2D 面板
     */
    const labelObject2D = new THREE.Object3D();
    label2dData.forEach((item: any) => {
      const { featureCenterCoord, featureName } = item;
      const labelObjectItem = draw2dLabel(featureCenterCoord, featureName);
      if (labelObjectItem) {
        labelObject2D.add(labelObjectItem);
      }
    });
    scene.add(labelObject2D);

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
    // new OrbitControls(camera, renderer.domElement);
    new OrbitControls(camera, labelRenderer.domElement);

    // 视窗伸缩
    function onResize() {
      // 更新摄像头
      camera.aspect = currentDom.clientWidth / currentDom.clientHeight;
      // 更新摄像机的投影矩阵
      camera.updateProjectionMatrix();
      // 更新渲染器
      renderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
      labelRenderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
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
        const properties = lastPick.object.parent.customProperties;
        if (lastPick.object.material[0]) {
          lastPick.object.material[0].color.set("#3497F5");
        }

        if (toolTipRef.current && toolTipRef.current.style) {
          toolTipRef.current.style.left = e.clientX + 2 + "px";
          toolTipRef.current.style.top = e.clientY + 2 + "px";
          toolTipRef.current.style.visibility = "visible";
        }
        setToolTipData({
          text: properties.name,
        });
      } else {
        toolTipRef.current.style.visibility = "hidden";
      }
    };

    // 鼠标双击事件
    const onDblclickEvent = () => {
      const intersects = raycaster.intersectObjects(scene.children);
      const target = intersects.find(
        (item: any) => item.object.userData.isChangeColor
      );
      if (target) {
        const obj: any = target.object.parent;
        const p = obj.customProperties;
        dblClickFn(p);
      }
    };

    const animate = function () {
      requestAnimationFrame(animate);
      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(pointer, camera);
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", onResize, false);
    window.addEventListener("mousemove", onMouseMoveEvent, false);
    window.addEventListener("dblclick", onDblclickEvent, false);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMoveEvent);
      window.removeEventListener("dblclick", onDblclickEvent);
    };
  }, [geoJson]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div ref={map2dRef} />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      <ToolTip innterRef={toolTipRef} data={toolTipData}></ToolTip>
    </div>
  );
}

export default Map3D;
