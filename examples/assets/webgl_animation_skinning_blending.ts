import { _decorator, Component, Node, Camera, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { HTML5 } from 'cc/env';
import { GUI } from './libs/lil-gui';



@ccclass('webgl_animation_skinning_blending')
export class webgl_animation_skinning_blending extends Component {

    @property(Node)
    model: Node = null!

    @property(Camera)
    camera: Camera = null!


    start() {
        if (HTML5) {
            const div = document.createElement('div');
            div.id = "info"
            div.className = "footer"
            div.innerHTML = `
            (model from <a href="https://www.mixamo.com/" target="_blank" rel="noopener">mixamo.com</a>)<br/>
			Note: crossfades are possible with blend weights being set to (1,0,0), (0,1,0) or (0,0,1)
            `
            document.body.appendChild(div)
            this.createPanel()
        }

        this.camera.node.lookAt(v3(0, 1, 0))
    }

    private createPanel() {
        // @ts-ignore
        const panel = new GUI({ width: 310 });
        panel.close()
        const crossFadeControls = [];

        const folder1 = panel.addFolder('Visibility');
        const folder2 = panel.addFolder('Activation/Deactivation');
        const folder3 = panel.addFolder('Pausing/Stepping');
        const folder4 = panel.addFolder('Crossfading');
        const folder5 = panel.addFolder('Blend Weights');
        const folder6 = panel.addFolder('General Speed');

        let settings = {
            'show model': true,
            'show skeleton': false,
            'deactivate all': () => { "deactivateAllActions" },
            'activate all': () => { "activateAllActions" },
            'pause/continue': () => { "pauseContinue" },
            'make single step': () => { "toSingleStepMode" },
            'modify step size': 0.05,
            'from walk to idle': () => {

                // prepareCrossFade(walkAction, idleAction, 1.0);

            },
            'from idle to walk': () => {

                // prepareCrossFade(idleAction, walkAction, 0.5);

            },
            'from walk to run': () => {

                // prepareCrossFade(walkAction, runAction, 2.5);

            },
            'from run to walk': () => {

                // prepareCrossFade(runAction, walkAction, 5.0);

            },
            'use default duration': true,
            'set custom duration': 3.5,
            'modify idle weight': 0.0,
            'modify walk weight': 1.0,
            'modify run weight': 0.0,
            'modify time scale': 1.0
        };

        // @ts-ignore
        folder1.add(settings, 'show model').onChange(() => { });
        // @ts-ignore
        folder1.add(settings, 'show skeleton').onChange(() => { });
        // @ts-ignore
        folder2.add(settings, 'deactivate all');
        // @ts-ignore
        folder2.add(settings, 'activate all');
        // @ts-ignore
        folder3.add(settings, 'pause/continue');
        // @ts-ignore
        folder3.add(settings, 'make single step');
        folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);
        // @ts-ignore
        crossFadeControls.push(folder4.add(settings, 'from walk to idle'));
        // @ts-ignore
        crossFadeControls.push(folder4.add(settings, 'from idle to walk'));
        // @ts-ignore
        crossFadeControls.push(folder4.add(settings, 'from walk to run'));
        // @ts-ignore
        crossFadeControls.push(folder4.add(settings, 'from run to walk'));
        // @ts-ignore
        folder4.add(settings, 'use default duration');
        folder4.add(settings, 'set custom duration', 0, 10, 0.01);
        folder5.add(settings, 'modify idle weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {

            // setWeight(idleAction, weight);

        });
        folder5.add(settings, 'modify walk weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {

            // setWeight(walkAction, weight);

        });
        folder5.add(settings, 'modify run weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {

            // setWeight(runAction, weight);

        });
        folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(() => {

        });

        folder1.open();
        folder2.open();
        folder3.open();
        folder4.open();
        folder5.open();
        folder6.open();

    }

    update(deltaTime: number) {

    }
}


