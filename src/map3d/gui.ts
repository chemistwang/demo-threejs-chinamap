import * as dat from "dat.gui";
import { mapConfig, updateMapDepth } from "./mapConfig";
import { MapRuntime } from "./runtime";

export function setupMapGui(runtime: MapRuntime) {
  if (!runtime.mapObject3D || !runtime.axesHelper || !runtime.lightHelper) {
    return;
  }

  const gui = new dat.GUI();
  runtime.gui = gui;
  gui.width = 300;

  const colorConfig = {
    mapColor: mapConfig.mapColor,
    mapHoverColor: mapConfig.mapHoverColor,
    mapSideColor1: mapConfig.mapSideColor1,
    mapSideColor2: mapConfig.mapSideColor2,
    topLineColor:
      typeof mapConfig.topLineColor === "number"
        ? `#${mapConfig.topLineColor.toString(16)}`
        : mapConfig.topLineColor,
  };

  const geometryConfig = {
    mapDepth: mapConfig.mapDepth,
    topLineWidth: mapConfig.topLineWidth,
    spotRadius: mapConfig.spotRadius,
  };

  gui
    .add(geometryConfig, "mapDepth", 1, 20, 0.5)
    .name("地图厚度")
    .onFinishChange((value: number) => {
      updateMapDepth(value);
      runtime.requestRebuild();
    });

  gui
    .add(geometryConfig, "topLineWidth", 1, 10, 0.5)
    .name("顶线粗细")
    .onChange((value: number) => {
      mapConfig.topLineWidth = value;
      runtime.mapObject3D?.traverse((obj: any) => {
        if (obj.type === "Line2" && obj.material) {
          obj.material.linewidth = value;
          obj.material.needsUpdate = true;
        }
      });
    });

  gui
    .add(geometryConfig, "spotRadius", 0.05, 1.5, 0.05)
    .name("扩散点半径")
    .onFinishChange((value: number) => {
      mapConfig.spotRadius = value;
      runtime.requestRebuild();
    });

  gui
    .addColor(colorConfig, "mapColor")
    .name("地图颜色")
    .onChange((value: string) => {
      mapConfig.mapColor = value;
      runtime.mapObject3D?.traverse((obj: any) => {
        if (obj.material && obj.material[0] && obj.userData.isChangeColor) {
          obj.material[0].color.set(value);
        }
      });
    });

  gui
    .addColor(colorConfig, "mapHoverColor")
    .name("地图Hover颜色")
    .onChange((value: string) => {
      mapConfig.mapHoverColor = value;
    });

  gui
    .addColor(colorConfig, "mapSideColor1")
    .name("侧面渐变1")
    .onChange((value: string) => {
      mapConfig.mapSideColor1 = value;
      runtime.mapObject3D?.traverse((obj: any) => {
        if (
          obj.material &&
          obj.material[1] &&
          obj.material[1].uniforms &&
          obj.material[1].uniforms.color1
        ) {
          obj.material[1].uniforms.color1.value.set(value);
        }
      });
    });

  gui
    .addColor(colorConfig, "mapSideColor2")
    .name("侧面渐变2")
    .onChange((value: string) => {
      mapConfig.mapSideColor2 = value;
      runtime.mapObject3D?.traverse((obj: any) => {
        if (
          obj.material &&
          obj.material[1] &&
          obj.material[1].uniforms &&
          obj.material[1].uniforms.color2
        ) {
          obj.material[1].uniforms.color2.value.set(value);
        }
      });
    });

  gui
    .addColor(colorConfig, "topLineColor")
    .name("顶线颜色")
    .onChange((value: string) => {
      mapConfig.topLineColor = parseInt(value.replace("#", ""), 16);
      runtime.mapObject3D?.traverse((obj: any) => {
        if (obj.type === "Line2" && obj.material) {
          obj.material.color.set(value);
        }
      });
    });

  const helperConfig = {
    cameraHelper: true,
    axesHelper: true,
    lightHelper: true,
  };

  gui
    .add(helperConfig, "cameraHelper")
    .name("显示CameraHelper")
    .onChange((v: boolean) => {
      if (v) {
        runtime.scene.add(runtime.cameraHelper);
      } else {
        runtime.scene.remove(runtime.cameraHelper);
      }
    });

  gui
    .add(helperConfig, "axesHelper")
    .name("显示AxesHelper")
    .onChange((v: boolean) => {
      if (!runtime.axesHelper) {
        return;
      }

      if (v) {
        runtime.scene.add(runtime.axesHelper);
      } else {
        runtime.scene.remove(runtime.axesHelper);
      }
    });

  gui
    .add(helperConfig, "lightHelper")
    .name("显示LightHelper")
    .onChange((v: boolean) => {
      if (!runtime.lightHelper) {
        return;
      }

      if (v) {
        runtime.scene.add(runtime.lightHelper);
      } else {
        runtime.scene.remove(runtime.lightHelper);
      }
    });

  const lightConfig = { intensity: runtime.light?.intensity ?? 1.5 };
  gui
    .add(lightConfig, "intensity", 0, 5)
    .name("光强度")
    .onChange((v: number) => {
      if (runtime.light) {
        runtime.light.intensity = v;
      }
    });
}
