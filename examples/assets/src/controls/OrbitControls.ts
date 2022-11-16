import { _decorator, Component, Node, Vec3, v3, math, v2, quat, Quat, input, Input, EventMouse, screen, Camera } from 'cc';
import { Spherical } from '../math/Spherical';
const { ccclass, property } = _decorator;

const STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
};
const EPS = math.EPSILON;
const twoPI = 2 * Math.PI;


@ccclass('OrbitControls')
export class OrbitControls extends Component {

    // "target" sets the location of focus, where the object orbits around
    @property
    target: Vec3 = v3()

    // How far you can dolly in and out ( PerspectiveCamera only )
    @property
    minDistance = 0;
    @property
    maxDistance = 9999999;


    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    minPolarAngle = 0; // radians
    maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    minAzimuthAngle = - Infinity; // radians
    maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    @property
    enableDamping = false;
    @property
    dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    enableZoom = true;
    zoomSpeed = 1.0;

    // Set to false to disable rotating
    enableRotate = true;
    rotateSpeed = 1.0;

    // Set to false to disable panning
    enablePan = true;
    panSpeed = 1.0;
    screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
    keyPanSpeed = 7.0; // pixels moved per arrow key push


    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    autoRotate = false;
    autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60


    private object: Node
    private camera: Camera
    private state = STATE.NONE;
    // current position in spherical coordinates
    private readonly spherical = new Spherical();
    private readonly sphericalDelta = new Spherical();
    private scale = 1;
    private readonly panOffset = v3();
    private zoomChanged = false;
    private readonly rotateStart = v2();
    private readonly rotateEnd = v2();
    private readonly rotateDelta = v2();
    private readonly panStart = v2();
    private readonly panEnd = v2();
    private readonly panDelta = v2();
    private readonly dollyStart = v2();
    private readonly dollyEnd = v2();
    private readonly dollyDelta = v2();
    private readonly pointers = [];
    private readonly pointerPositions = {};


    onLoad() {
        this.object = this.node;
        this.camera = this.node.getComponent(Camera);
    }

    start() {
        // so camera.up is the orbit axis
        Quat.rotationTo(this.quat, this.object.up, Vec3.UP);
        Quat.invert(this.quatInverse, this.quat);
        this.spherical.radius = Vec3.distance(this.object.position, this.target)
    }

    onEnable() {
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onDisable() {
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
    onDestroy() {

    }


    private onMouseDown(event: EventMouse) {

    }

    private rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }

    private rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }

    private handleMouseMoveRotate(event: EventMouse) {

        const rotateDelta = this.rotateDelta
        const clientHeight = screen.windowSize.height
        event.getDelta(rotateDelta)
        this.rotateDelta.multiplyScalar(this.rotateSpeed)

        this.rotateLeft(2 * Math.PI * rotateDelta.x / clientHeight); // yes, height

        this.rotateUp(-2 * Math.PI * rotateDelta.y / clientHeight);

        this.updateObject();

    }

    private onMouseMove(event: EventMouse) {
        // console.log("onMouseMove", event.getButton())
        switch (event.getButton()) {
            case EventMouse.BUTTON_RIGHT: {
                this.handleMouseMoveRotate(event);
                break;
            }
            case EventMouse.BUTTON_MIDDLE: {
                this.handleMouseMovePan(event);
                break;
            }
        }
    }

    private panLeft(distance) {

        //v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        const v = this.object.right
        v.multiplyScalar(- distance);
        this.panOffset.add(v);

    };

    private panUp(distance) {

        // if (scope.screenSpacePanning === true) {

        // v.setFromMatrixColumn(objectMatrix, 1);

        // } else {

        //     v.setFromMatrixColumn(objectMatrix, 0);
        //     v.crossVectors(scope.object.up, v);

        // }
        const v = this.object.up
        v.multiplyScalar(-distance);
        this.panOffset.add(v);

    };

    private pan(deltaX, deltaY) {
        const clientHeight = screen.windowSize.height
        const scope = this;
        const offset = this.offset
        // if (scope.object.isPerspectiveCamera) {

        // perspective
        const position = scope.object.position;
        offset.set(position).subtract(scope.target);
        let targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= Math.tan(scope.camera.fov / 2 * Math.PI / 180.0);

        // we use only clientHeight here so aspect ratio does not distort speed
        this.panLeft(2 * deltaX * targetDistance / clientHeight);
        this.panUp(2 * deltaY * targetDistance / clientHeight);

        // } else if (scope.object.isOrthographicCamera) {

        //     // orthographic
        //     panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
        //     panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);

        // } else {

        //     // camera neither orthographic nor perspective
        //     console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
        //     scope.enablePan = false;

        // }
    }

    private handleMouseMovePan(event: EventMouse) {


        event.getDelta(this.panDelta)
        this.panDelta.multiplyScalar(this.panSpeed)
        this.pan(this.panDelta.x, this.panDelta.y);
        this.updateObject();

    }

    private onMouseWheel(evt: EventMouse) {
        // evt.preventSwallow()
        this.handleMouseWheel(evt)
    }

    private getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }

    private dollyOut(dollyScale) {
        // const scope = this

        // if (scope.object.isPerspectiveCamera) {

        this.scale /= dollyScale;

        // } else if (scope.object.isOrthographicCamera) {

        //     scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
        //     scope.object.updateProjectionMatrix();
        //     zoomChanged = true;

        // } else {

        //     console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        //     scope.enableZoom = false;

        // }

    }

    private dollyIn(dollyScale) {

        // if (scope.object.isPerspectiveCamera) {

        this.scale *= dollyScale;

        // } else if (scope.object.isOrthographicCamera) {

        //     scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
        //     scope.object.updateProjectionMatrix();
        //     zoomChanged = true;

        // } else {

        //     console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        //     scope.enableZoom = false;

        // }

    }

    private handleMouseWheel(event: EventMouse) {
        if (event.getScrollY() > 0) {
            this.dollyIn(this.getZoomScale());
        } else if (event.getScrollY() < 0) {
            this.dollyOut(this.getZoomScale());
        }

        this.updateObject();
    }

    private readonly offset = v3();
    // so camera.up is the orbit axis
    private readonly quat = quat(); //.setFromUnitVectors(object.up, v3(0, 1, 0));
    private readonly quatInverse = quat();
    private readonly lastPosition = v3();
    private readonly lastQuaternion = quat();
    private updateObject() {
        const scope = this;
        const offset = this.offset;
        const quat = this.quat;
        const quatInverse = this.quatInverse;
        const lastPosition = this.lastPosition;
        const lastQuaternion = this.lastQuaternion;
        const spherical = this.spherical;
        const sphericalDelta = this.sphericalDelta;
        const panOffset = this.panOffset;

        const position = scope.object.position;
        offset.set(position).subtract(scope.target);

        // rotate offset to "y-axis-is-up" space
        Vec3.transformQuat(offset, offset, quat)

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);
        if (scope.autoRotate && this.state === STATE.NONE) {
            // rotateLeft(getAutoRotationAngle());
        }

        if (scope.enableDamping) {

            spherical.theta += sphericalDelta.theta * scope.dampingFactor;
            spherical.phi += sphericalDelta.phi * scope.dampingFactor;

        } else {

            spherical.theta += sphericalDelta.theta;
            spherical.phi += sphericalDelta.phi;

        }

        // restrict theta to be between desired limits

        let min = scope.minAzimuthAngle;
        let max = scope.maxAzimuthAngle;
        if (isFinite(min) && isFinite(max)) {

            if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;
            if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;
            if (min <= max) {

                spherical.theta = Math.max(min, Math.min(max, spherical.theta));

            } else {

                spherical.theta = spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta);

            }

        }

        // restrict phi to be between desired limits
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
        spherical.makeSafe();
        spherical.radius *= this.scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

        // move target to panned location

        if (scope.enableDamping === true) {

            // scope.target.addScaledVector(panOffset, scope.dampingFactor);
            Vec3.scaleAndAdd(scope.target, scope.target, panOffset, scope.dampingFactor)

        } else {

            scope.target.add(panOffset);

        }

        // offset.setFromSpherical(spherical);
        spherical.toVec3(offset)

        // rotate offset back to "camera-up-vector-is-up" space
        // offset.applyQuaternion(quatInverse);
        Vec3.transformQuat(offset, offset, quatInverse)


        position.set(scope.target).add(offset);
        scope.object.position = position;
        scope.object.lookAt(scope.target);
        if (scope.enableDamping === true) {

            sphericalDelta.theta *= 1 - scope.dampingFactor;
            sphericalDelta.phi *= 1 - scope.dampingFactor;
            panOffset.multiplyScalar(1 - scope.dampingFactor);

        } else {

            sphericalDelta.set(0, 0, 0);
            panOffset.set(0, 0, 0);

        }

        this.scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (this.zoomChanged || Vec3.squaredDistance(lastPosition, scope.object.position) > EPS || 8 * (1 - Quat.dot(lastQuaternion, scope.object.rotation)) > EPS) {

            // scope.dispatchEvent(_changeEvent);
            lastPosition.set(scope.object.position);
            lastQuaternion.set(scope.object.rotation);
            this.zoomChanged = false;
            return true;

        }

        return false;
    }

    update(deltaTime: number) {
        this.updateObject()
    }
}


