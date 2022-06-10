// GameMgr.ts
import { _decorator, Component, Node, log, Label, EventTouch, Prefab, v3, instantiate, math } from 'cc';
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

    // 下个砖块位置
    private _nextBrickPos = v3()


    private _gameStatus: EGameStatus = EGameStatus.wait;
    set gameStatus(status: EGameStatus) {
        switch (status) {
            case EGameStatus.wait: {
                log('等待')
                this.createBrick()
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
        this._nextBrickPos.set(0, 0, 0)
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
        const brick = instantiate(this.pb_brick)
        this.nd_scene.addChild(brick)
        brick.setPosition(this._nextBrickPos)
        // 随机下一个位置
        this._nextBrickPos.add3f(0, 0, math.randomRange(-3, -1))
    }

    update(deltaTime: number) {

    }
}