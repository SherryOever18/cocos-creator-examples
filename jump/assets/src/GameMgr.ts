// GameMgr.ts
import { _decorator, Component, Node, log, Label } from 'cc';
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

    private _gameStatus: EGameStatus = EGameStatus.wait;
    set gameStatus(status: EGameStatus) {
        switch (status) {
            case EGameStatus.wait: {
                log('等待')
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
                break;
            }
            case EGameStatus.die: {
                log('死亡')
                break;
            }
        }
        this._gameStatus = status;
        this.lb_debug.string = `gameStatus:${status}`;
    }
    get gameStatus() {
        return this._gameStatus;
    }

    start() {
        // 初始化状态
        this.gameStatus = EGameStatus.wait
    }

    update(deltaTime: number) {

    }
}