import { Object3D } from "three";

export interface GeoJsonType {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: string; // "Feature"
  properties: {
    adcode: number; //110000
    name: string; // 北京
    center: [number, number]; //[116.405285, 39.904989],
    centroid: [number, number]; //[116.419889, 40.189911]
    childrenNum: number; //16,
    level: Geolevel; // province,
    parent: {
      adcode: number; //100000
    };
    subFeatureIndex: number; //0,
    acroutes: number[]; // [100000],
    adchar: null;
  };
  geometry: {
    type: GeometryType; // "MultiPolygon",
    coordinates: GeometryCoordinates<GeometryType>;
  };
  vector3: any[][]; // 每个省份一个维度
}

export type Geolevel = "province" | "city" | "district";

export type GeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon"
  | "GeometryCollection";

export type GeometryCoordinates<T extends GeometryType> = T extends "Point"
  ? [number, number]
  : T extends "LineString"
  ? [number, number][]
  : T extends "Polygon"
  ? [number, number][][]
  : T extends "MultiPoint"
  ? [number, number][]
  : T extends "MultiLineString"
  ? [number, number][][]
  : T extends "MultiPolygon"
  ? [number, number][][][]
  : T extends "GeometryCollection"
  ? any
  : never;

export interface ExtendObject3D extends Object3D {
  customProperties: any; // 扩展的自定义属性
}
