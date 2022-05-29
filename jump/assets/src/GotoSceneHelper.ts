import { _decorator, Component, Node, director, Event } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GotoSceneHelper')
export class GotoSceneHelper extends Component {

    private gotoScene(event: Event, sceneName: string) {
        director.loadScene(sceneName)
    }
}