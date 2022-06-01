import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameViewCtl')
export class GameViewCtl extends Component {
    @property(Node)
    resultView: Node = null!

    start() {
        this.resultView.active = false;
    }

    private openResultView() {
        this.resultView.active = true;
    }
}