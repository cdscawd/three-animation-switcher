import { PerspectiveCamera, Vector3 } from 'three'
import type { SceneCameraOptions, WinSize } from '../types'

export class SceneCamera {
  private readonly camera: PerspectiveCamera

  constructor({ winSize, far = 200, z = 1 }: SceneCameraOptions) {
    const aspect = winSize.wd / winSize.wh
    this.camera = new PerspectiveCamera(60, aspect, 0.1, far)
    this.camera.position.set(0, 0, z)
    this.camera.lookAt(new Vector3(0, 0, 0))
  }

  getCamera(): PerspectiveCamera {
    return this.camera
  }

  getViewSize(): { height: number; width: number } {
    const fovRad = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fovRad / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    return { height, width }
  }

  resize({ winSize }: { winSize: WinSize }): void {
    this.camera.aspect = winSize.wd / winSize.wh
    this.camera.updateProjectionMatrix()
  }
}
