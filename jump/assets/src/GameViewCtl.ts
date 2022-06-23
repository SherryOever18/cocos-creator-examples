import { _decorator, Component, Node, Prefab, instantiate, game, Label } from 'cc';
import { EnumEventDefine } from './EeventDefine';
const { ccclass, property } = _decorator;

@ccclass('GameViewCtl')
export class GameViewCtl extends Component {
    @property(Prefab)
    resultViewPrefab: Prefab = null!

    @property(Label)
    lb_score: Label = null!

    @property(Node)
    gameView: Node = null!

    resultView: Node = null!

    private _score: number = 0
    set score(score: number) {
        this.lb_score.string = `${score}`
        this._score = score
    }
    get score() {
        return this._score
    }

    start() {
        this.resultView = instantiate(this.resultViewPrefab)
        this.gameView.addChild(this.resultView)
        this.resultView.active = false;
        game.on(EnumEventDefine.openResultView, this.openResultView, this)
    }

    onDestroy() {
        game.targetOff(this)
    }

    private openResultView() {
        this.resultView.active = true;
    }
}