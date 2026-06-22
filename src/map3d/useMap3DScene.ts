import { Dispatch, RefObject, SetStateAction, useEffect } from "react";
import { startMapAnimation } from "./animation";
import { setupMapGui } from "./gui";
import { bindMapInteractions } from "./interactions";
import { buildMapContent } from "./mapContent";
import {
  cleanupMapRuntime,
  createMapRuntime,
  TooltipData,
} from "./runtime";
import { GeoJsonType, ProjectionFnParamType } from "./typed";

type UseMap3DSceneParams = {
  geoJson: GeoJsonType;
  projectionFnParam: ProjectionFnParamType;
  dblClickFn: (customProperties: any) => void;
  mapRef: RefObject<HTMLDivElement>;
  labelRef: RefObject<HTMLDivElement>;
  toolTipRef: RefObject<HTMLDivElement>;
  setToolTipData: Dispatch<SetStateAction<TooltipData>>;
};

export function useMap3DScene(params: UseMap3DSceneParams) {
  const {
    geoJson,
    projectionFnParam,
    dblClickFn,
    mapRef,
    labelRef,
    toolTipRef,
    setToolTipData,
  } = params;

  useEffect(() => {
    const currentDom = mapRef.current;
    const labelRendererDom = labelRef.current;
    if (!currentDom || !labelRendererDom) {
      return;
    }

    const runtime = createMapRuntime({
      currentDom,
      labelRendererDom,
      toolTipDom: toolTipRef.current,
      geoJson,
      projectionFnParam,
      dblClickFn,
      setToolTipData,
    });

    buildMapContent(runtime);
    const interactionControls = bindMapInteractions(runtime);
    setupMapGui(runtime);
    startMapAnimation(runtime, interactionControls);

    return () => {
      cleanupMapRuntime(runtime);
    };
  }, [
    dblClickFn,
    geoJson,
    labelRef,
    mapRef,
    projectionFnParam,
    setToolTipData,
    toolTipRef,
  ]);
}
