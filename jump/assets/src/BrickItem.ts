import { _decorator, Component, Node, tween, v3, math, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BrickItem')
export class BrickItem extends Component {

    // 出现特效
    playAppearEffect() {
        const jumpHeight = 1;
        this.node.setPosition(this.node.position.add3f(0, jumpHeight, 0))
        tween(this.node)
            .by(0.2, { position: v3(0, -jumpHeight, 0) }, { easing: "backInOut" })
            .call(() => {
                console.log(this.node.position.toString(), this);
            })
            .start()
    }

    // 点击特效
    playClickEffect() {
        tween(this.node)
            .to(3, { scale: v3(1, 0.5, 1) })
            .start()
    }

    // 松手特效
    playClickOutEffect() {
        Tween.stopAllByTarget(this.node)
        tween(this.node)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: "backInOut" })
            .start()
    }
}

