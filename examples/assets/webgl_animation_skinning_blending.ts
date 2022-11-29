import { _decorator, Component, Node, Camera, v3, SkeletalAnimation, AnimationState, __private } from 'cc';
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

    private _gui: GUI

    start() {
        if (HTML5) {
            this._gui = this.createPanel()
        }
        this.camera.node.lookAt(v3(0, 1, 0))
    }

    onDestroy() {
        if (HTML5) {
            this._gui.destroy()
        }
    }

    private createPanel() {

        let singleStepMode = false;
        let sizeOfNextStep = 0;
        let settings
        let idleWeight, walkWeight, runWeight, tposWeight;

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
            skeletalAnimation.pause()
            actions.forEach(function (action) {
                action.pause();
            });

        }

        function unPauseAllActions() {
            skeletalAnimation.resume()
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

        function setCrossFadeDuration(defaultDuration) {
            // Switch default crossfade duration <-> custom crossfade duration
            if (settings['use default duration']) {
                return defaultDuration;
            } else {
                return settings['set custom duration'];
            }
        }

        function executeCrossFade(startAction: AnimationState, endAction: AnimationState, duration: number) {
            // Not only the start action, but also the end action must get a weight of 1 before fading
            // (concerning the start action this is already guaranteed in this place)
            // setWeight(endAction, 1);
            // endAction.setTime(0);
            // startAction.setTime(0);
            console.log('executeCrossFade startAction.current', startAction.current, 'endAction.current', endAction.current)
            // Crossfade with warping - you can also try without warping by setting the third parameter to false
            // skeletalAnimation.play(startAction.name)
            skeletalAnimation.crossFade(endAction.name, duration)
        }

        function synchronizeCrossFade(startAction: AnimationState, endAction: AnimationState, duration: number) {
            console.log('synchronizeCrossFade startAction.current', startAction.current, 'endAction.current', endAction.current)
            skeletalAnimation.on('lastframe', onLoopFinished);
            function onLoopFinished(event, target: AnimationState) {
                // console.log('synchronizeCrossFade onLoopFinished', event, target.name)
                if (target === startAction) {
                    skeletalAnimation.off('lastframe', onLoopFinished);
                    console.log('synchronizeCrossFade lastframe', target.name, 'startAction.current', startAction.current, 'endAction.current', endAction.current)
                    executeCrossFade(startAction, endAction, duration);
                }

            }
        }

        function prepareCrossFade(startAction: AnimationState, endAction: AnimationState, defaultDuration: number) {
            // Switch default / custom crossfade duration (according to the user's choice)
            const duration = setCrossFadeDuration(defaultDuration) / settings['modify time scale'];

            // Make sure that we don't go on in singleStepMode, and that all actions are unpaused
            singleStepMode = false;
            unPauseAllActions();
            // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
            // else wait until the current action has finished its current loop
            if (startAction === idleAction) {
                executeCrossFade(startAction, endAction, duration);
            } else {
                synchronizeCrossFade(startAction, endAction, duration);
            }
        }

        const folder1 = panel.addFolder('Visibility');
        const folder2 = panel.addFolder('Activation/Deactivation');
        const folder3 = panel.addFolder('Pausing/Stepping');
        const folder4 = panel.addFolder('Crossfading');
        const folder5 = panel.addFolder('Blend Weights');
        const folder6 = panel.addFolder('General Speed');

        this.skeletonHelper.showSkeleton(false)
        settings = {
            'show model': true,
            'show skeleton': false,
            'deactivate all': () => {
                skeletalAnimation.stop()
                actions.forEach(function (action) {
                    action.stop();
                });
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
                prepareCrossFade(walkAction, idleAction, 1.0);
            },
            'from idle to walk': () => {
                prepareCrossFade(idleAction, walkAction, 0.5);
            },
            'from walk to run': () => {
                prepareCrossFade(walkAction, runAction, 2.5);
            },
            'from run to walk': () => {
                prepareCrossFade(runAction, walkAction, 5.0);
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
            setWeight(idleAction, weight);
        });
        folder5.add(settings, 'modify walk weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
            setWeight(walkAction, weight);
        });
        folder5.add(settings, 'modify run weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
            setWeight(runAction, weight);
        });
        folder5.add(settings, 'modify tpos weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
            setWeight(tposAction, weight);
        });
        folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange((speed: number) => {
            actions.forEach(function (action) {
                action.speed = speed;
            });
        });

        function updateWeightSliders() {
            settings['modify idle weight'] = idleWeight;
            settings['modify walk weight'] = walkWeight;
            settings['modify run weight'] = runWeight;
            settings['modify tpos weight'] = tposWeight;
        }

        function updateCrossFadeControls() {
            if (idleWeight === 1 && walkWeight === 0 && runWeight === 0) {
                crossFadeControls[0].disable();
                crossFadeControls[1].enable();
                crossFadeControls[2].disable();
                crossFadeControls[3].disable();
            }

            if (idleWeight === 0 && walkWeight === 1 && runWeight === 0) {
                crossFadeControls[0].enable();
                crossFadeControls[1].disable();
                crossFadeControls[2].enable();
                crossFadeControls[3].disable();
            }

            if (idleWeight === 0 && walkWeight === 0 && runWeight === 1) {
                crossFadeControls[0].disable();
                crossFadeControls[1].disable();
                crossFadeControls[2].disable();
                crossFadeControls[3].enable();
            }

        }

        this._animate = (deltaTime: number) => {
            idleWeight = idleAction.weight;
            walkWeight = walkAction.weight;
            runWeight = runAction.weight;
            tposWeight = tposAction.weight;
            updateWeightSliders();
            updateCrossFadeControls();
        }

        return panel

    }

    private _animate: Function

    update(deltaTime: number) {
        this._animate && this._animate(deltaTime)
    }
}


