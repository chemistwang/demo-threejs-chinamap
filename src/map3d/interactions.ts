import * as THREE from "three";
import { mapConfig } from "./mapConfig";
import { MapRuntime } from "./runtime";

export function bindMapInteractions(runtime: MapRuntime) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const onResizeEvent = () => {
    runtime.camera.aspect =
      runtime.currentDom.clientWidth / runtime.currentDom.clientHeight;
    runtime.camera.updateProjectionMatrix();
    runtime.renderer.setSize(
      runtime.currentDom.clientWidth,
      runtime.currentDom.clientHeight
    );
    runtime.labelRenderer.setSize(
      runtime.currentDom.clientWidth,
      runtime.currentDom.clientHeight
    );
    runtime.renderer.setPixelRatio(window.devicePixelRatio);
  };

  const onMouseMoveEvent = (e: MouseEvent) => {
    const intersects = raycaster.intersectObjects(runtime.scene.children);
    pointer.x = (e.clientX / runtime.currentDom.clientWidth) * 2 - 1;
    pointer.y = -(e.clientY / runtime.currentDom.clientHeight) * 2 + 1;

    if (runtime.lastPick) {
      const color = mapConfig.mapColorGradient[Math.floor(Math.random() * 4)];
      runtime.lastPick.object.material[0].color.set(color);
      runtime.lastPick.object.material[0].opacity = mapConfig.mapOpacity;
    }

    runtime.lastPick = intersects.find(
      (item: any) => item.object.userData.isChangeColor
    );

    if (runtime.lastPick) {
      const properties = runtime.lastPick.object.parent.customProperties;
      if (runtime.lastPick.object.material[0]) {
        runtime.lastPick.object.material[0].color.set(mapConfig.mapHoverColor);
        runtime.lastPick.object.material[0].opacity = 1;
      }

      if (runtime.toolTipDom) {
        runtime.toolTipDom.style.left = e.clientX + 2 + "px";
        runtime.toolTipDom.style.top = e.clientY + 2 + "px";
        runtime.toolTipDom.style.visibility = "visible";
      }

      runtime.setToolTipData({
        text: properties.name,
      });
    } else if (runtime.toolTipDom) {
      runtime.toolTipDom.style.visibility = "hidden";
    }
  };

  const onDblclickEvent = () => {
    const intersects = raycaster.intersectObjects(runtime.scene.children);
    const target = intersects.find(
      (item: any) => item.object.userData.isChangeColor
    );

    if (target) {
      const obj: any = target.object.parent;
      runtime.dblClickFn(obj.customProperties);
    }
  };

  window.addEventListener("resize", onResizeEvent, false);
  window.addEventListener("mousemove", onMouseMoveEvent, false);
  window.addEventListener("dblclick", onDblclickEvent, false);

  runtime.cleanupCallbacks.push(() => {
    window.removeEventListener("resize", onResizeEvent);
    window.removeEventListener("mousemove", onMouseMoveEvent);
    window.removeEventListener("dblclick", onDblclickEvent);
  });

  return { raycaster, pointer };
}
