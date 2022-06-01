import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameViewCtl')
export class GameViewCtl extends Component {
    @property(Prefab)
    resultViewPrefab: Prefab = null!

    @property(Node)
    gameView: Node = null!

    resultView: Node = null!

    start() {
        this.resultView = instantiate(this.resultViewPrefab)
        this.gameView.addChild(this.resultView)
        this.resultView.active = false;
    }

    private openResultView() {
        this.resultView.active = true;
    }
}