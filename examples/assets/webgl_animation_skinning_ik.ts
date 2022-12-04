import { _decorator, Component, Node, Vec3, math, v3, log } from 'cc';
import { EDITOR } from 'cc/env';
import { CCDIKSolver } from './src/animation/CCDIKSolver';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('webgl_animation_skinning_ik')
@executeInEditMode
export class webgl_animation_skinning_ik extends Component {
    @property(Node)
    model: Node = null!

    @property(Node)
    target_hand_r: Node = null!

    @property(Node)
    target_hand_l: Node = null!

    @property(Node)
    target_foot_r: Node = null!

    @property(Node)
    target_foot_l: Node = null!

    @property(CCDIKSolver)
    IKSolver: CCDIKSolver = null!

    @property(Node)
    target_head: Node = null!

    start() {
        this.target_hand_r.worldPosition = this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 R Clavicle/Bip002 R UpperArm/Bip002 R Forearm/Bip002 R Hand").worldPosition
        this.target_hand_l.worldPosition = this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 L Clavicle/Bip002 L UpperArm/Bip002 L Forearm/Bip002 L Hand").worldPosition
        this.target_foot_r.worldPosition = this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 R Thigh/Bip002 R Calf/Bip002 R Foot").worldPosition
        this.target_foot_l.worldPosition = this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 L Thigh/Bip002 L Calf/Bip002 L Foot").worldPosition

        const iks = [
            {
                target: this.target_hand_r,
                effector: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 R Clavicle/Bip002 R UpperArm/Bip002 R Forearm/Bip002 R Hand"),
                links: [
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 R Clavicle/Bip002 R UpperArm/Bip002 R Forearm")
                    },
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 R Clavicle/Bip002 R UpperArm")
                    },
                ],
            },
            {
                target: this.target_hand_l,
                effector: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 L Clavicle/Bip002 L UpperArm/Bip002 L Forearm/Bip002 L Hand"),
                links: [
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 L Clavicle/Bip002 L UpperArm/Bip002 L Forearm")
                    },
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Neck/Bip002 L Clavicle/Bip002 L UpperArm")
                    },
                ],
            }
            ,
            {
                target: this.target_foot_r,
                effector: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 R Thigh/Bip002 R Calf/Bip002 R Foot"),
                links: [
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 R Thigh/Bip002 R Calf")
                    },
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 R Thigh")
                    },
                ],
            },
            {
                target: this.target_foot_l,
                effector: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 L Thigh/Bip002 L Calf/Bip002 L Foot"),
                links: [
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 L Thigh/Bip002 L Calf")
                    },
                    {
                        node: this.model.getChildByPath("Bip002/Bip002 Pelvis/Bip002 Spine/Bip002 L Thigh")
                    },
                ],
            }
        ];

        this.IKSolver.iks = iks;

        log("webgl_animation_skinning_ik start")
    }


    lateUpdate(deltaTime: number) {
        if (EDITOR) {
            const iks = this.IKSolver.iks;
            for (let i = 0, il = iks.length; i < il; i++) {
                this.IKSolver.updateOne(iks[i]);
            }
        }
    }

}


