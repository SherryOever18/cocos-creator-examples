/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
 * The azimuthal angle (theta) is measured from the positive z-axis.
 */

import { IVec3Like, math } from "cc";


class Spherical {
    radius: number = 1
    phi: number = 0
    theta: number = 0

    constructor(radius = 1, phi = 0, theta = 0) {

        this.radius = radius;
        this.phi = phi; // polar angle
        this.theta = theta; // azimuthal angle

        return this;

    }

    set(radius, phi, theta) {

        this.radius = radius;
        this.phi = phi;
        this.theta = theta;

        return this;

    }

    copy(other) {

        this.radius = other.radius;
        this.phi = other.phi;
        this.theta = other.theta;

        return this;

    }

    // restrict phi to be between EPS and PI-EPS
    makeSafe() {

        const EPS = 0.000001;
        this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));

        return this;

    }

    setFromVector3(v) {

        return this.setFromCartesianCoords(v.x, v.y, v.z);

    }

    setFromCartesianCoords(x, y, z) {

        this.radius = Math.sqrt(x * x + y * y + z * z);

        if (this.radius === 0) {

            this.theta = 0;
            this.phi = 0;

        } else {

            this.theta = Math.atan2(x, z);
            this.phi = Math.acos(math.clamp(y / this.radius, - 1, 1));

        }

        return this;

    }

    clone() {
        return new Spherical().copy(this);
    }

    toVec3(out: IVec3Like) {
        const phi = this.phi;
        const radius = this.radius;
        const theta = this.theta;

        const sinPhiRadius = Math.sin(phi) * radius;
        out.x = sinPhiRadius * Math.sin(theta);
        out.y = Math.cos(phi) * radius;
        out.z = sinPhiRadius * Math.cos(theta);
        return this;

    }

}

export { Spherical };
