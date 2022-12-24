import { _decorator, Sprite, Vec2, IAssembler, __private, dynamicAtlasManager, Color, } from 'cc';
import { JSB } from 'cc/env';
const { ccclass, property } = _decorator;

let QUAD_INDICES: Uint16Array;
const polygonAssembler: IAssembler = {

    createData(sprite: Sprite) {
        const renderData = sprite.requestRenderData();
        return renderData;
    },

    createQuadIndices(vertexCount: number, indexCount: number) {
        // QUAD_INDICES = null;
        QUAD_INDICES = new Uint16Array(indexCount);
        let offset = 0, vidOrigin = 0;
        for (let i = 0; i < vertexCount; ++i) {
            const start = i;
            QUAD_INDICES[offset++] = vidOrigin;
            QUAD_INDICES[offset++] = start + 1 + vidOrigin;
            QUAD_INDICES[offset++] = start + 2 + vidOrigin;
        }
    },

    updateRenderData(sprite: PolygonSprite) {
        const frame = sprite.spriteFrame;

        dynamicAtlasManager.packToDynamicAtlas(sprite, frame);

        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            this.updateUVs(sprite);// dirty need
            this.updateColor(sprite);// dirty need
            renderData.updateRenderData(sprite, frame);
        }
    },

    updateWorldVerts(sprite: Sprite, chunk: any) {
        const renderData = sprite.renderData!;
        const vData = chunk.vb;

        const dataList: any[] = renderData.data;
        const node = sprite.node;
        const m = node.worldMatrix;

        const stride = renderData.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; i++) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m.m03 * x + m.m07 * y + m.m15;
            rhw = rhw ? Math.abs(1 / rhw) : 1;

            offset = i * stride;
            vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
            vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
            vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
        }
    },

    fillBuffers(sprite: PolygonSprite, renderer: any) {
        if (sprite === null) {
            return;
        }

        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        if (sprite.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(sprite, chunk);
            renderData.vertDirty = false;
        }

        // quick version
        const bid = chunk.bufferId;
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;
        for (let i = 0; i < sprite.vertices.length - 2; ++i) {
            const start = i;
            ib![indexOffset++] = vidOrigin;
            ib![indexOffset++] = start + 1 + vidOrigin;
            ib![indexOffset++] = start + 2 + vidOrigin;
        }
        meshBuffer.indexOffset = indexOffset;
    },

    updateVertexData(sprite: PolygonSprite) {
        const renderData = sprite.renderData;
        if (!renderData) {
            return;
        }
        const vertexCount = sprite.vertices.length
        renderData.dataLength = vertexCount
        const indexCount = (vertexCount - 2) * 3
        renderData.resize(vertexCount, indexCount)

        // update index here
        if (JSB) {
            this.createQuadIndices(vertexCount, indexCount)
            renderData.chunk.setIndexBuffer(QUAD_INDICES);
        }

        for (let i = 0; i < vertexCount; ++i) {
            const xy = sprite.vertices[i];
            renderData.data[i].x = xy.x
            renderData.data[i].y = xy.y
        }
        renderData.vertDirty = false;
    },

    updateUVs(sprite: PolygonSprite) {
        const renderData = sprite.renderData!;
        if (!renderData || !renderData.chunk) return
        console.info("updateUVs", sprite.uvs.length)

        const uv = sprite.spriteFrame!.uv;
        const l = uv[0], b = uv[1], t = uv[7], r = uv[6]
        // console.log(uv)

        const stride = renderData.floatStride;
        const vData = renderData.chunk.vb;
        for (let i = 0; i < sprite.uvs.length; ++i) {
            const uvs = sprite.uvs[i];
            if (!renderData.data[i]) {
                // console.info(new Error().stack, "updateUVs", "sprite.uvs.length", sprite.uvs.length, "renderData.data", renderData.data.length)
                break;
            }
            renderData.data[i].u = l + (r - l) * uvs.x
            renderData.data[i].v = b + (t - b) * uvs.y
            const curData = renderData.data[i]
            const offset = i * stride;
            vData[offset + 3] = curData.u;
            vData[offset + 4] = curData.v;
        }
        // renderData.uvDirty = false;
    },

    updateColor(sprite: PolygonSprite) {
        const renderData = sprite.renderData!;
        if (!renderData || !renderData.chunk) return
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < sprite.vertices.length; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },

};
/**

author: http://lamyoung.com/  
B站视频: https://space.bilibili.com/1756070/video  
github: https://github.com/baiyuwubing  
gitee 同步地址： https://gitee.com/lamyoung
qq 交流群: 859642112  

Cocos 论坛 ： https://forum.cocos.org/u/lamyoung/activity/topics

 */

// 仅限凸多边形
@ccclass('PolygonSprite')
export class PolygonSprite extends Sprite {
    @property({ type: [Vec2] })
    protected _vertices: Vec2[] = [new Vec2(-100, -100), new Vec2(100, -100), new Vec2(100, 100), new Vec2(-100, 100)];
    @property({ type: [Vec2] })
    get vertices() {
        return this._vertices;
    }
    set vertices(value) {
        this._vertices = value;
        this.markForUpdateRenderData();
    }

    @property({ type: [Vec2] })
    protected _uvs: Vec2[] = [new Vec2(0, 0), new Vec2(1, 0), new Vec2(1, 1), new Vec2(0, 1)];
    @property({ type: [Vec2] })
    get uvs() {
        return this._uvs;
    }
    set uvs(value) {
        this._uvs = value;
        this.markForUpdateRenderData();
    }

    protected _flushAssembler() {
        let assembler = polygonAssembler;
        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }

        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this._renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                this._updateColor();
            }
        }
    }


}


/*

欢迎关注微信公众号 `白玉无冰`

导航：https://mp.weixin.qq.com/s/Ht0kIbaeBEds_wUeUlu8JQ

█████████████████████████████████████
█████████████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄██▀▄ ▄▄██ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ ▀▄▀▀▀█▄▀█ █   █ ████
████ █▄▄▄█ █▀ █▀▀▀ ▀▄▄ ▄ █ █▄▄▄█ ████
████▄▄▄▄▄▄▄█▄▀ ▀▄█ ▀▄█▄▀ █▄▄▄▄▄▄▄████
████▄▄  ▄▀▄▄ ▄▀▄▀▀▄▄▄ █ █ ▀ ▀▄█▄▀████
████▀ ▄  █▄█▀█▄█▀█  ▀▄ █ ▀ ▄▄██▀█████
████ ▄▀▄▄▀▄ █▄▄█▄ ▀▄▀ ▀ ▀ ▀▀▀▄ █▀████
████▀ ██ ▀▄ ▄██ ▄█▀▄ ██▀ ▀ █▄█▄▀█████
████   ▄██▄▀ █▀▄▀▄▀▄▄▄▄ ▀█▀ ▀▀ █▀████
████ █▄ █ ▄ █▀ █▀▄█▄▄▄▄▀▄▄█▄▄▄▄▀█████
████▄█▄█▄█▄█▀ ▄█▄   ▀▄██ ▄▄▄ ▀   ████
████ ▄▄▄▄▄ █▄██ ▄█▀  ▄   █▄█  ▄▀█████
████ █   █ █ ▄█▄ ▀  ▀▀██ ▄▄▄▄ ▄▀ ████
████ █▄▄▄█ █ ▄▄▀ ▄█▄█▄█▄ ▀▄   ▄ █████
████▄▄▄▄▄▄▄█▄██▄▄██▄▄▄█████▄▄█▄██████
█████████████████████████████████████
█████████████████████████████████████
*/