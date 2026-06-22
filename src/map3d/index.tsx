import { useRef, useState } from "react";
import ToolTip from "../tooltip";
import { GeoJsonType, ProjectionFnParamType } from "./typed";
import { TooltipData } from "./runtime";
import { useMap3DScene } from "./useMap3DScene";

export type { ProjectionFnParamType };

interface Props {
  geoJson: GeoJsonType;
  dblClickFn: (customProperties: any) => void;
  projectionFnParam: ProjectionFnParamType;
}

function Map3D(props: Props) {
  const { geoJson, dblClickFn, projectionFnParam } = props;
  const mapRef = useRef<HTMLDivElement>(null);
  const map2dRef = useRef<HTMLDivElement>(null);
  const toolTipRef = useRef<HTMLDivElement>(null);

  const [toolTipData, setToolTipData] = useState<TooltipData>({
    text: "",
  });

  useMap3DScene({
    geoJson,
    projectionFnParam,
    dblClickFn,
    mapRef,
    labelRef: map2dRef,
    toolTipRef,
    setToolTipData,
  });

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
