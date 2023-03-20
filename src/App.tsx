import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Map3D, { ProjectionFnParamType } from "./map3d";
import { GeoJsonType } from "./map3d/typed";

// 地图放大倍率
const MapScale: any = {
  province: 200,
  city: 400,
  district: 600,
};

function App() {
  const [geoJson, setGeoJson] = useState<GeoJsonType>();
  const [mapAdCode, setMapAdCode] = useState<number>(100000);
  const [projectionFnParam, setProjectionFnParam] =
    useState<ProjectionFnParamType>({
      center: [104.0, 37.5],
      scale: 80,
    });

  useEffect(() => {
    queryMapData(mapAdCode); // 默认的中国adcode码
  }, [mapAdCode]);

  // 请求地图数据
  const queryMapData = useCallback(async (code: number) => {
    const response = await axios.get(
      `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
    );
    const { data } = response;
    setGeoJson(data);
  }, []);

  // 双击事件
  const dblClickFn = (customProperties: any) => {
    setMapAdCode(customProperties.adcode);
    setProjectionFnParam({
      center: customProperties.centroid,
      scale: MapScale[customProperties.level],
    });
  };

  return (
    <>
      {geoJson && (
        <Map3D
          geoJson={geoJson}
          dblClickFn={dblClickFn}
          projectionFnParam={projectionFnParam}
        />
      )}
    </>
  );
}

export default App;
