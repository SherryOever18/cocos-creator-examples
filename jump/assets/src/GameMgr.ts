// GameMgr.ts
import { _decorator, Component, Node, log, Label, EventTouch, Prefab, v3, instantiate, math, Camera, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

export enum EGameStatus {
    wait = 1,
    idle = 2,
    start_jump = 3,
    jumping = 4,
    die = 5
}

@ccclass('GameMgr')
export class GameMgr extends Component {
    // 用于调试
    @property(Label)
    private lb_debug: Label = null!

    // 触摸控制节点
    @property(Node)
    nd_touch: Node = null!

    // 场景节点
    @property(Node)
    nd_scene: Node = null!

    // 砖块预制体
    @property(Prefab)
    pb_brick: Prefab = null!

    // 相机
    @property(Camera)
    camera: Camera = null!

    // 所有砖块
    private _allbricks: Node[] = []

    private _gameStatus: EGameStatus = EGameStatus.wait;
    set gameStatus(status: EGameStatus) {
        switch (status) {
            case EGameStatus.wait: {
                log('等待')
                this.createBrick()
                this.moveCamera()
                this.scheduleOnce(() => { this.gameStatus = EGameStatus.idle }, 0.2)
                break;
            }
            case EGameStatus.idle: {
                log('待机')
                break;
            }
            case EGameStatus.start_jump: {
                log('起跳')
                break;
            }
            case EGameStatus.jumping: {
                log('跳动')
                //todo 判断死亡或继续
                this.scheduleOnce(() => { this.gameStatus = EGameStatus.wait }, 1)
                break;
            }
            case EGameStatus.die: {
                log('死亡')
                break;
            }
        }
        this._gameStatus = status;
        this.lb_debug.string = `gameStatus:${this.gameStatus}`;
    }
    get gameStatus() {
        return this._gameStatus;
    }

    start() {
        // 先创建一个砖块
        this.createBrick()
        // 初始化状态
        this.gameStatus = EGameStatus.wait
        //注册触摸事件
        this.nd_touch.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.nd_touch.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    private onTouchStart(evt: EventTouch) {
        if (this.gameStatus == EGameStatus.idle) {
            this.gameStatus = EGameStatus.start_jump
        }
    }

    private onTouchEnd(evt: EventTouch) {
        if (this.gameStatus == EGameStatus.start_jump) {
            this.gameStatus = EGameStatus.jumping
        }
    }

    // 生成砖块
    private createBrick() {
        const nextBrickPos = v3()
        // 获取前一个砖头
        const lastBrick = this._allbricks[this._allbricks.length - 1];
        if (lastBrick) {
            nextBrickPos.set(lastBrick.position)

            const movestep = math.randomRange(-6, -1)
            // 随机往 x,z 轴
            if (Math.random() < 0.5) {
                nextBrickPos.add3f(0, 0, movestep)
            } else {
                nextBrickPos.add3f(movestep, 0, 0)
            }
        }
        const brick = instantiate(this.pb_brick)
        this.nd_scene.addChild(brick)
        brick.setPosition(nextBrickPos)
        this._allbricks.push(brick)

        // 如果超过5个就移除第一个
        if (this._allbricks.length > 5) {
            this._allbricks.shift().destroy()
        }
    }

    //移动相机
    private moveCamera() {
        const midPos = v3()
        // 相机投影在xoz面的朝向方向
        const cameraXOZforward = v3(-1, 0, -1).normalize()
        const length_bricks = this._allbricks.length
        if (length_bricks > 1) {
            // 中间位置，取最后两个
            Vec3.add(midPos,
                this._allbricks[length_bricks - 1].position,
                this._allbricks[length_bricks - 2].position)
                .multiplyScalar(0.5)
        }
        // 相机投影在xoz面投影点
        const cameraXOZpos = Vec3.subtract(v3(), midPos, cameraXOZforward.multiplyScalar(15))
        // 相机的目标位置
        const cameraTargetPos = Vec3.add(v3(), cameraXOZpos, v3(0, 10, 0))
        tween(this.camera.node)
            .to(0.2, { position: cameraTargetPos }, { easing: 'sineOutIn' })
            .call(() => { this.camera.node.lookAt(midPos) })
            .start()
    }

    update(deltaTime: number) {

    }
}