import * as THREE from "three";

type ObjectWithResources = THREE.Object3D & {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material | THREE.Material[];
  element?: HTMLElement;
};

type TextureUniform = {
  value?: unknown;
};

function disposeTexture(
  value: unknown,
  disposedTextures: Set<THREE.Texture>
) {
  if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
    disposedTextures.add(value);
    value.dispose();
  }
}

function disposeMaterial(
  material: THREE.Material,
  disposedMaterials: Set<THREE.Material>,
  disposedTextures: Set<THREE.Texture>
) {
  if (disposedMaterials.has(material)) {
    return;
  }

  disposedMaterials.add(material);

  Object.values(material).forEach((value) => {
    disposeTexture(value, disposedTextures);

    if (Array.isArray(value)) {
      value.forEach((item) => disposeTexture(item, disposedTextures));
    }

    if (value && typeof value === "object" && "value" in value) {
      disposeTexture((value as TextureUniform).value, disposedTextures);
    }
  });

  material.dispose();
}

export function disposeObject3D(root: THREE.Object3D) {
  const disposedGeometries = new Set<THREE.BufferGeometry>();
  const disposedMaterials = new Set<THREE.Material>();
  const disposedTextures = new Set<THREE.Texture>();

  root.traverse((item) => {
    const object = item as ObjectWithResources;

    if (object.geometry && !disposedGeometries.has(object.geometry)) {
      disposedGeometries.add(object.geometry);
      object.geometry.dispose();
    }

    if (Array.isArray(object.material)) {
      object.material.forEach((material) =>
        disposeMaterial(material, disposedMaterials, disposedTextures)
      );
    } else if (object.material) {
      disposeMaterial(object.material, disposedMaterials, disposedTextures);
    }

    if (object.element?.parentElement) {
      object.element.parentElement.removeChild(object.element);
    }
  });

  root.clear();
}
