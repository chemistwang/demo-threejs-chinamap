import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  const [rebuildVersion, setRebuildVersion] = useState(0);
  const requestRebuild = useCallback(() => {
    setRebuildVersion((version) => version + 1);
  }, []);

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
      requestRebuild,
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
    rebuildVersion,
    requestRebuild,
    setToolTipData,
    toolTipRef,
  ]);
}
