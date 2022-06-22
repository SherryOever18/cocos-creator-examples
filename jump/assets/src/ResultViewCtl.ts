import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResultViewCtl')
export class ResultViewCtl extends Component {
    start() {

    }

    private playAgain() {
        this.node.active = false;
        // 重新开始游戏
        director.loadScene("game")
    }
}