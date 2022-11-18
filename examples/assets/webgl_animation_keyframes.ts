import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { HTML5 } from 'cc/env';

@ccclass('webgl_animation_keyframes')
export class webgl_animation_keyframes extends Component {
    start() {
        if (HTML5) {
            const div = document.createElement('div');
            div.id = "info"
            div.className = "footer"
            div.innerHTML = `
            Doc: <a href="https://mp.weixin.qq.com/s/ACGbuEyssHBTGhZaJ8mRcQ" target="_blank" rel="noopener">  文章说明  </a> 
            Video: <a href="https://www.bilibili.com/video/BV19W4y1s765" target="_blank" rel="noopener">  视频讲解  </a> <br/>
			Model: <a href="https://artstation.com/artwork/1AGwX" target="_blank" rel="noopener">Littlest Tokyo</a> by
			<a href="https://artstation.com/glenatron" target="_blank" rel="noopener">Glen Fox</a>, CC Attribution.
            `
            document.body.appendChild(div)
        }
    }

    update(deltaTime: number) {

    }
}


