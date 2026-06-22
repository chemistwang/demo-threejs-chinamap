import * as THREE from "three";
import { MapRuntime } from "./runtime";

export type AnimationControls = {
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
};

export function startMapAnimation(
  runtime: MapRuntime,
  controls: AnimationControls
) {
  const { raycaster, pointer } = controls;
  const clock = new THREE.Clock();

  const animate = function () {
    if (runtime.disposed) {
      return;
    }

    const delta = clock.getDelta();
    runtime.modelMixers.forEach((item) => item.update(delta));

    runtime.ratio.value += 0.01;

    runtime.animationFrameId = requestAnimationFrame(animate);
    raycaster.setFromCamera(pointer, runtime.camera);
    runtime.renderer.render(runtime.scene, runtime.camera);
    runtime.labelRenderer.render(runtime.scene, runtime.camera);

    runtime.spotList.forEach((mesh: any) => {
      mesh._s += 0.01;
      mesh.scale.set(1 * mesh._s, 1 * mesh._s, 1 * mesh._s);
      if (mesh._s <= 2) {
        mesh.material.opacity = 2 - mesh._s;
      } else {
        mesh._s = 1;
      }
    });

    runtime.flySpotList.forEach(function (mesh: any) {
      mesh._s += 0.003;
      let tankPosition = new THREE.Vector3();
      tankPosition = mesh.curve.getPointAt(mesh._s % 1);
      mesh.position.set(tankPosition.x, tankPosition.y, tankPosition.z);
    });
  };

  animate();
}
