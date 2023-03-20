import * as THREE from "three";

export interface RadarOption {
  position: any;
  radius: number;
  color: string;
  opacity: number;
  angle: number;
  speed: number;
}

// 雷达配置项
export const radarData: RadarOption[] = [
  {
    // position: {
    //   // 位置
    //   x: -100,
    //   y: 0,
    //   z: 0
    // },
    position: new THREE.Vector3(0, 0, 0),
    radius: 50, // 半径大小
    color: "#0A1E70", // 颜色
    opacity: 0.5, // 颜色最深的地方的透明度
    angle: Math.PI * 2, // 扫描区域大小的弧度指
    speed: 2, // 旋转的速度
  },
  {
    // position: {
    //   x: 100,
    //   y: 0,
    //   z: 10
    // },
    position: new THREE.Vector3(0, 0, 0),
    radius: 30, // 半径大小
    color: "#C2C4D6", // 颜色
    opacity: 0.5, // 颜色最深的地方的透明度
    angle: Math.PI * 2, // 扫描区域大小的弧度指
    speed: 2, // 旋转的速度
  },
];

// 顶点着色器
const vertexShader = `
precision mediump float;
precision highp int;

varying vec2 vPosition;
void main () {
    // 把当前像素点的x和y专递给片元着色器，这里我们在xy轴所在平面上画图，不考虑z轴
    vPosition = vec2(position.x, position.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
precision mediump float;
precision highp int;

// 接收从js中传入的uniform数据
uniform float uTime;
uniform float u_radius;
uniform float u_speed;
uniform float u_opacity;
uniform float u_width;
uniform vec3 u_color;

varying vec2 vPosition;
#define PI 3.14159265359

void main () {
    // 计算当前扫描旋转的弧度值总数
    float currentRadius = u_speed * uTime;

    // 计算当前像素点与原点连线和x轴构成的夹角的弧度值
    // atan 接受两个参数（y,x）时 等同于 atan2,返回的是atan(y/x)；
    // 但比后者更稳定，返回值区间[-PI, PI]
    float angle = atan(vPosition.y, vPosition.x) + PI;

    // 计算当前像素低旋转后的弧度值，值固定在[0, PI * 2]之间
    float angleT = mod(currentRadius + angle, PI * 2.0);

    // 计算当前位置距离中心点距离
    float dist = distance(vec2(0.0, 0.0), vPosition);
    
    float tempOpacity = 0.0;

    // 设置雷达外层圆环的宽度
    float circleWidth = 5.0;
    // 如果当前点在外层圆环上， 设置一个透明度
    if (dist < u_radius && dist > u_radius - circleWidth) {
        // 做一个虚化渐变效果
        float pct = smoothstep(u_radius - circleWidth, u_radius, dist);
        tempOpacity = sin(pct * PI);
    }

    // 设置雷达扫描圈的效果 (-5.0是给外层圆环和内层圆之间设置一点空白间距)
    if (dist < (u_radius - 5.0)) {
        tempOpacity = 1.0 - angleT / u_width;
    }
   // 设置颜色
    gl_FragColor = vec4(u_color, u_opacity * tempOpacity);
}`;

export function drawRadar(options: RadarOption, ratio: any) {
  const { position, radius, color, opacity, speed, angle } = options;
  const size = radius * 2;
  const plane = new THREE.PlaneGeometry(size, size);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: ratio,
      u_radius: {
        value: radius,
      },
      u_speed: {
        value: speed,
      },
      u_opacity: {
        value: opacity,
      },
      u_width: {
        value: angle,
      },
      u_color: {
        value: new THREE.Color(color),
      },
    },
    vertexShader,
    fragmentShader,
  });
  const planeMesh = new THREE.Mesh(plane, material);
  planeMesh.position.copy(position);
  return planeMesh;
}
