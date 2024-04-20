import * as THREE from "three";

export function initCamera(currentDom: HTMLElement) {
  /**
   * 摄像机
   */
  const camera = new THREE.PerspectiveCamera(
    30, //45
    currentDom.clientWidth / currentDom.clientHeight,
    0.1,
    1000
  );
  /** 摆放相机的位置 */
  // _camera.up.x = 0;
  // _camera.up.y = 0;
  // _camera.up.z = 1; //保证z轴在上面
  camera.position.set(-10, -90, 130);

  /**
   * 设置CameraHelper
   */
  const cameraHelper = new THREE.CameraHelper(camera);

  return { camera, cameraHelper };
}
