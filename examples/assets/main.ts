import { _decorator, Component, Node, game, director, assetManager, Canvas, ScrollView, Button, instantiate, Label, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {

    @property(Canvas)
    canvas: Canvas = null!

    private _scrollView: ScrollView

    private _homeButton: Node

    start() {
        director.addPersistRootNode(this.canvas.node)
        director.addPersistRootNode(this.node)
        const scenesConfigs: string[] = []
        assetManager.bundles.forEach((bundle) => {
            bundle.config.scenes.forEach((val, key) => {
                const sceneName = key.split('/').pop()
                if (sceneName != "main.scene")
                    scenesConfigs.push(sceneName)
            })
        })
        scenesConfigs.sort()
        console.log('scenesConfigs', scenesConfigs)
        this._homeButton = this.canvas.node.getChildByName("ButtonHome")
        this._homeButton.active = false;

        this._scrollView = this.canvas.node.getComponentInChildren(ScrollView);
        const item = this._scrollView.content.children[0];
        const gap = 30
        for (let index = 0; index < scenesConfigs.length; index++) {
            const element = scenesConfigs[index];
            const itemi = instantiate(item)
            itemi.parent = this._scrollView.content
            itemi.getComponent(Label).string = element;
            itemi.on(Node.EventType.TOUCH_END, () => {
                this.gotoScene(element)
            })
            itemi.setPosition(item.position.x, item.position.y - gap * index)
        }
        this._scrollView.content.getComponent(UITransform).height = gap * (scenesConfigs.length + 1)
        item.active = false;
    }

    private gobackHome() {
        director.loadScene("main")
        this._homeButton.active = false;
        this._scrollView.node.active = true
    }

    private gotoScene(name: string) {
        director.loadScene(name, () => {
            this._homeButton.active = true;
            this._scrollView.node.active = false
        })
    }

}


