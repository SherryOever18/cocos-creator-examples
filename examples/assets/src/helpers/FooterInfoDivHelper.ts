import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { HTML5 } from 'cc/env';

@ccclass('webgl_animation_keyframes')
export class webgl_animation_keyframes extends Component {
    private _div: HTMLDivElement

    @property
    codeAddr: string = 'https://github.com/baiyuwubing/cocos-creator-examples/tree/3.6'

    @property({ multiline: true })
    otherInfo: string = ''

    start() {
        if (HTML5) {
            const div = document.createElement('div');
            div.id = "info"
            div.className = "footer"
            div.innerHTML = `
            微信公众号 👉 <a href="https://mp.weixin.qq.com/s/-I6I6nG2Hnk6d1zqR-Gu2g" target="_blank" rel="noopener">白玉无冰</a> 
            👉  <a href="${this.codeAddr}" target="_blank" rel="noopener"> Source Code </a>  <br/>
            ${this.otherInfo}
            `
            document.body.appendChild(div)
            this._div = div
        }
    }

    onDestroy() {
        if (HTML5) {
            this._div.parentNode.removeChild(this._div)
        }
    }
}


