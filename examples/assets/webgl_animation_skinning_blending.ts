import { _decorator, Component, Node, Camera, v3, SkeletalAnimation, AnimationState } from 'cc';
const { ccclass, property } = _decorator;

import { HTML5 } from 'cc/env';
import { GUI } from './libs/lil-gui';
import { SkeletonHelper } from './src/helpers/SkeletonHelper';



@ccclass('webgl_animation_skinning_blending')
export class webgl_animation_skinning_blending extends Component {

    @property(Node)
    model: Node = null!

    @property(Camera)
    camera: Camera = null!

    @property(SkeletonHelper)
    skeletonHelper: SkeletonHelper = null!;

    start() {
        if (HTML5) {
            const div = document.createElement('div');
            div.id = "info"
            div.className = "footer"
            div.innerHTML = `
            微信公众号 👉 <a href="https://mp.weixin.qq.com/s/-I6I6nG2Hnk6d1zqR-Gu2g" target="_blank" rel="noopener">白玉无冰</a> <br/>
            (model from <a href="https://www.mixamo.com/" target="_blank" rel="noopener">mixamo.com</a>)<br/>
			Note: crossfades are possible with blend weights being set to (1,0,0), (0,1,0) or (0,0,1)
            `
            document.body.appendChild(div)
            this.createPanel()
        }

        this.camera.node.lookAt(v3(0, 1, 0))
    }

    private createPanel() {

        let singleStepMode = false;
        let sizeOfNextStep = 0;

        // @ts-ignore
        const panel = new GUI({ width: 310 });
        // panel.close()
        const crossFadeControls = [];
        const skeletalAnimation = this.model.getComponent(SkeletalAnimation)
        const idleAction = skeletalAnimation.getState(skeletalAnimation.clips[1].name)
        const walkAction = skeletalAnimation.getState(skeletalAnimation.clips[0].name)
        const runAction = skeletalAnimation.getState(skeletalAnimation.clips[2].name)
        const tposAction = skeletalAnimation.getState(skeletalAnimation.clips[3].name)
        const actions = [idleAction, walkAction, runAction, tposAction];

        function setWeight(action: AnimationState, weight) {
            action.weight = weight
        }

        function activateAll() {
            setWeight(idleAction, settings['modify idle weight']);
            setWeight(walkAction, settings['modify walk weight']);
            setWeight(runAction, settings['modify run weight']);
            setWeight(tposAction, settings['modify tpos weight']);
            actions.forEach(function (action) {
                action.play();
            });
        }

        function pauseAllActions() {
            actions.forEach(function (action) {
                action.pause();
            });

        }

        function unPauseAllActions() {
            actions.forEach(function (action) {
                action.resume();
            });
        }

        function toSingleStepMode() {
            pauseAllActions();
            singleStepMode = true;
            sizeOfNextStep = settings['modify step size'];
            actions.forEach(function (action) {
                action.update(sizeOfNextStep);
            });
        }

        const folder1 = panel.addFolder('Visibility');
        const folder2 = panel.addFolder('Activation/Deactivation');
        const folder3 = panel.addFolder('Pausing/Stepping');
        // todo
        // const folder4 = panel.addFolder('Crossfading');
        // const folder5 = panel.addFolder('Blend Weights');
        // const folder6 = panel.addFolder('General Speed');
        // todo-end
        this.skeletonHelper.showSkeleton(false)
        let settings = {
            'show model': true,
            'show skeleton': false,
            'deactivate all': () => {
                // skeletalAnimation.stop()
                setWeight(idleAction, 0);
                setWeight(walkAction, 0);
                setWeight(runAction, 0);
                setWeight(tposAction, 1);
                // actions.forEach(function (action) {
                //     action.stop();
                // });
            },
            'activate all': () => {
                activateAll()
            },
            'pause/continue': () => {
                if (singleStepMode) {
                    singleStepMode = false;
                    unPauseAllActions();
                } else {
                    if (idleAction.isPaused) {
                        unPauseAllActions();
                    } else {
                        pauseAllActions();
                    }
                }
            },
            'make single step': () => { toSingleStepMode() },
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
            'modify tpos weight': 0.0,
            'modify time scale': 1.0
        };


        activateAll()

        // @ts-ignore
        folder1.add(settings, 'show model').onChange((visibility) => { this.model.active = visibility });
        // @ts-ignore
        folder1.add(settings, 'show skeleton').onChange((visibility) => {
            this.skeletonHelper.showSkeleton(visibility)
        });


        // @ts-ignore
        folder2.add(settings, 'deactivate all');
        // @ts-ignore
        folder2.add(settings, 'activate all');

        // @ts-ignore
        folder3.add(settings, 'pause/continue');
        // @ts-ignore
        folder3.add(settings, 'make single step');
        folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);
        //todo
        /**
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
 */
        // todo-end

        folder1.open();
        // folder2.open();
        // folder3.open();
        // folder4.open();
        // folder5.open();
        // folder6.open();

    }

    update(deltaTime: number) {

    }
}


