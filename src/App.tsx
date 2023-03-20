import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Map3D from "./map3d";
import { GeoJsonType } from "./map3d/typed";

function App() {
  const [geoJson, setGeoJson] = useState<GeoJsonType>();

  useEffect(() => {
    queryMapData(100000); // 默认的中国adcode码
  }, []);

  // 请求地图数据
  const queryMapData = useCallback(async (code: number) => {
    const response = await axios.get(
      `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
    );
    const { data } = response;
    setGeoJson(data);
  }, []);

  return <>{geoJson && <Map3D geoJson={geoJson} />}</>;
}

export default App;
