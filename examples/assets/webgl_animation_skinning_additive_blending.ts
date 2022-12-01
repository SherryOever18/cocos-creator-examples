import { _decorator, Component, Node, SkeletalAnimation, AnimationState, __private } from 'cc';
const { ccclass, property } = _decorator;
// TODO AdditiveAnimationBlendMode 

import { HTML5 } from 'cc/env';
import { GUI } from './libs/lil-gui';

@ccclass('webgl_animation_skinning_additive_blending')
export class webgl_animation_skinning_additive_blending extends Component {

    @property(Node)
    model: Node = null!

    private _gui: GUI

    start() {
        if (HTML5) {
            this._gui = this.createPanel()
        }
    }

    onDestroy() {
        if (HTML5) {
            this._gui.destroy()
        }
    }

    private createPanel() {

        const crossFadeControls = [];

        let currentBaseAction = 'idle';
        const allActions: AnimationState[] = [];
        interface IbaseAciton {
            weight: number,
            action?: AnimationState
        }

        const baseActions: { [key: string]: IbaseAciton } = {
            idle: { weight: 1 },
            walk: { weight: 0 },
            run: { weight: 0 }
        };
        const additiveActions: { [key: string]: IbaseAciton } = {
            sneak_pose: { weight: 0 },
            sad_pose: { weight: 0 },
            agree: { weight: 0 },
            headShake: { weight: 0 }
        };
        let panelSettings, numAnimations;
        const skeletalAnimation = this.model.getComponent(SkeletalAnimation)


        const animations = skeletalAnimation.clips
        numAnimations = animations.length;


        function setWeight(action: AnimationState, weight: number) {
            action.weight = weight
        }

        function activateAction(action: AnimationState) {
            const settings = baseActions[action.name] || additiveActions[action.name];
            setWeight(action, settings.weight);
            action.play();
        }

        function executeCrossFade(startAction: AnimationState, endAction: AnimationState, duration: number) {
            for (const key in baseActions) {
                if (Object.prototype.hasOwnProperty.call(baseActions, key)) {
                    const element = baseActions[key];
                    if (element.action == endAction) {
                        element.action.weight = 1
                    } else {
                        element.action.weight = 0
                    }
                }
            }
            // skeletalAnimation.crossFade(endAction.name, duration)
            // skeletalAnimation.play(endAction.clip)
        }

        // function synchronizeCrossFade(startAction: AnimationState, endAction: AnimationState, duration: number) {
        //     console.log('synchronizeCrossFade startAction.current', startAction.current, 'endAction.current', endAction.current)
        //     skeletalAnimation.on('lastframe', onLoopFinished);
        //     function onLoopFinished(event, target: AnimationState) {
        //         // console.log('synchronizeCrossFade onLoopFinished', event, target.name)
        //         if (target === startAction) {
        //             skeletalAnimation.off('lastframe', onLoopFinished);
        //             console.log('synchronizeCrossFade lastframe', target.name, 'startAction.current', startAction.current, 'endAction.current', endAction.current)
        //             executeCrossFade(startAction, endAction, duration);
        //         }

        //     } ``
        // }

        function prepareCrossFade(startAction: AnimationState, endAction: AnimationState, defaultDuration: number) {
            // Switch default / custom crossfade duration (according to the user's choice)
            const duration = defaultDuration
            // if (currentBaseAction === 'idle' || !startAction || !endAction) {
            executeCrossFade(startAction, endAction, duration);
            // } else {
            //     synchronizeCrossFade(startAction, endAction, duration);
            // }
        }

        for (let i = 0; i !== numAnimations; ++i) {

            let clip = animations[i];
            const name = clip.name;

            if (baseActions[name]) {

                const action = skeletalAnimation.getState(name);
                activateAction(action);
                baseActions[name].action = action;
                allActions.push(action);

            } else if (additiveActions[name]) {

                // Make the clip additive and remove the reference frame

                // THREE.AnimationUtils.makeClipAdditive(clip);

                // if (clip.name.endsWith('_pose')) {

                //     clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);

                // }

                const action = skeletalAnimation.getState(name);
                activateAction(action);
                additiveActions[name].action = action;
                allActions.push(action);
            }
        }



        // @ts-ignore
        const panel = new GUI({ width: 310 });
        const folder1 = panel.addFolder('Base Actions');
        const folder2 = panel.addFolder('Additive Action Weights');
        // const folder3 = panel.addFolder('General Speed');

        panelSettings = {
            'modify time scale': 1.0
        };

        const baseNames = [...Object.keys(baseActions)];//'None',

        for (let i = 0, l = baseNames.length; i !== l; ++i) {

            const name = baseNames[i];
            const settings = baseActions[name];
            panelSettings[name] = function () {

                const currentSettings = baseActions[currentBaseAction];
                const currentAction = currentSettings ? currentSettings.action : null;
                const action = settings ? settings.action : null;

                // if (currentAction !== action) {
                prepareCrossFade(currentAction, action, 0.35);
                // }

            };

            crossFadeControls.push(folder1.add(panelSettings, name, undefined, undefined, undefined));

        }

        for (const name of Object.keys(additiveActions)) {

            const settings = additiveActions[name];

            panelSettings[name] = settings.weight;
            folder2.add(panelSettings, name, 0.0, 1.0, 0.01).listen().onChange((weight) => {
                setWeight(settings.action, weight);
                settings.weight = weight;

            });

        }

        // folder3.add(panelSettings, 'modify time scale', 0.0, 1.5, 0.01).onChange((modifyTimeScale) => { });

        crossFadeControls.forEach(function (control) {

            control.setInactive = function () {

                control.domElement.classList.add('control-inactive');

            };

            control.setActive = function () {

                control.domElement.classList.remove('control-inactive');

            };

            const settings = baseActions[control.property];

            if (!settings || !settings.weight) {

                control.setInactive();

            }

        });

        this._animate = (deltaTime: number) => {
            for (let i = 0; i !== numAnimations; ++i) {
                const action = allActions[i];
                const settings = baseActions[action.name] || additiveActions[action.name];
                settings.weight = action.weight;
            }
        }

        return panel
    }



    private _animate: Function
    update(deltaTime: number) {
        this._animate && this._animate(deltaTime)
    }
}


