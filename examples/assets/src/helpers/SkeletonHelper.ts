import { _decorator, Component, Node, SkinnedMeshRenderer, Line, SkeletalAnimation, Color, gfx, GradientRange, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SkeletonHelper')
export class SkeletonHelper extends Component {

    @property(Node)
    model: Node = null!

    private bones: Node[] = []
    private lines: Line[] = []

    start() {
        log('欢迎关注微信公众号【白玉无冰】 https://mp.weixin.qq.com/s/-I6I6nG2Hnk6d1zqR-Gu2g')
        const skeletalAnimation = this.model.getComponent(SkeletalAnimation)
        skeletalAnimation.useBakedAnimation = false; // maybe todo
        const skinMeshRds = this.model.getComponentsInChildren(SkinnedMeshRenderer)
        skinMeshRds.forEach(element => {
            const skinningRoot = element.skinningRoot
            element.skeleton.joints.forEach((v) => {
                const node = skinningRoot.getChildByPath(v)
                node['isBone'] = true;
            })
        });

        const bones = this.getBoneList(this.model);
        this.bones = bones;

        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            if (bone.parent && bone.parent['isBone']) {
                const line = this.addComponent(Line);
                const state = { priority: 255, depthStencilState: new gfx.DepthStencilState(false, false) }
                // @ts-ignore
                line._materialInstance.overridePipelineStates(state)
                line.worldSpace = true;
                line.width.constant = 0.01;
                line.color.mode = GradientRange.Mode.TwoColors //there are some bugs in cocos creator // engine\cocos\particle\models\line-model.ts   // engine\cocos\particle\animator\gradient.ts
                line.color.colorMin = Color.BLUE
                line.color.colorMax = Color.GREEN
                line.positions = [bone.worldPosition, bone.parent.worldPosition] as never[]
                this.lines.push(line)
            }
        }
    }

    showSkeleton(show: boolean) {
        this.lines.forEach(l => l.enabled = show)
    }

    private getBoneList(object: Node) {
        const boneList: Node[] = [];

        if (object['isBone']) {
            boneList.push(object);
        }

        for (let i = 0; i < object.children.length; i++) {
            boneList.push.apply(boneList, this.getBoneList(object.children[i]));
        }
        return boneList;
    }

    lateUpdate(deltaTime: number) {
        let lineIndex = 0;
        for (let i = 0; i < this.bones.length; i++) {
            const bone = this.bones[i];
            if (bone.parent && bone.parent['isBone']) {
                const line = this.lines[lineIndex++];
                line.positions = [bone.worldPosition, bone.parent.worldPosition] as never[]
            }
        }
    }
}