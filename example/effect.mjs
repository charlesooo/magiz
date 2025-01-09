import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';

export function getComposer(renderer, scene, camera) {
  // better than FXAA
  const ssaaRenderPass = new SSAARenderPass(scene, camera, '#333', 1);
  const composer = new EffectComposer(renderer);
  composer.addPass(ssaaRenderPass);
  return composer
}
