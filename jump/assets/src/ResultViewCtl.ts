import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResultViewCtl')
export class ResultViewCtl extends Component {
    start() {

    }

    private playAgain() {
        this.node.active = false;
    }
}