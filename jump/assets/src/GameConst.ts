import { v3 } from "cc";

export class GameConst {
    /**最小砖块间隔 */
    static readonly minBrickSpace = 1.2;
    /**最大砖块间隔 */
    static readonly maxBrickSpace = 3;

    /**相机投影在xoz面的朝向方向 */
    static readonly cameraXOZforward = v3(-1, 0, -1).normalize()
    /**相机水平距离 */
    static readonly cameraHorizontalDistance = 8
    /**相机垂直距离 */
    static readonly cameraVerticallDistance = 6
}