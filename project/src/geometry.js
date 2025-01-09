/**
 * @callback AngleTransformer
 * @param {Angle} angle
 * @returns {Angle}
 */

/**
 * @template T
 * @callback MatrixMapper
 * @param {Matrix} matrix
 * @returns {T}
 */

/**
 * @callback MatrixTransformer
 * @param {Matrix} matrix
 * @returns {Matrix}
 */

/**
 * @template T
 * @callback Point3DMapper
 * @param {Point3D} point
 * @returns {T}
 */

/**
 * @callback Point3DTransformer
 * @param {Point3D} point
 * @returns {Point3D}
 */

export class Angle {

    /**
     *
     * @param {number} value
     * @param {string} unit
     */
    constructor(value, unit = AngleUnit.RADIANS) {
        AngleUnit.checkAngleUnit(unit);
        this.value = value;
        this.unit = unit;
        Object.freeze(this);
    }

    /**
     *
     * @returns {Angle}
     */
    clone() {
        return new Angle(this.value, this.unit);
    }

    /**
     *
     * @param {any} other
     * @returns {boolean}
     */
    equals(other) {
        if (other instanceof Angle) {
            let alignedOther = other.transform(AngleMath.convert(this.unit));
            return this.value === alignedOther.value;
        }
        return false;
    }

    toString() {
        return `Angle(value=${this.value}, unit=${this.unit})`;
    }

    /**
     *
     * @param {AngleTransformer} transformers
     * @returns {Angle}
     */
    transform(...transformers) {
        return transformers.reduce((acc, transformer) => transformer(acc), this);
    }
}

export class Axis {
    static X = "x";
    static Y = "y";
    static Z = "z";

    /**
     *
     * @param {string} axis
     */
    static checkAxis(axis) {
        if (axis !== Axis.X && axis !== Axis.Y && axis !== Axis.Z) {
            throw new Error('illegal axis <' + axis + '>');
        }
    }
}

export class AngleUnit {
    static RADIANS = "rad";
    static DEGREES = "deg";

    static checkAngleUnit(unit) {
        if (unit !== AngleUnit.RADIANS && unit !== AngleUnit.DEGREES) {
            throw new Error('illegal angle unit <' + unit + '>');
        }
    }
}

export class Matrix {

    /**
     *
     * @param {number[][]} data
     */
    constructor(data) {
        this.data = this.#frozenCloneData(data);
        this.totalRows = data.length;
        this.totalColumns = data[0].length;

        for (let i = 1; i < data.length; ++i) {
            if (data[i].length !== this.totalColumns) {
                throw new Error(`inconsistent matrix size: row ${i} has ${data[i].length} columns but ${this.totalColumns} were expected`);
            }
        }

        Object.freeze(this);
    }

    /**
     *
     * @param {number} row
     * @param {number} column
     * @returns {number}
     */
    getCell(row, column) {
        return this.data[row][column];
    }

    /**
     *
     * @param {number} column
     * @returns {number[]}
     */
    getColumn(column) {
        return this.data.map(row => row[column]);
    }

    /**
     *
     * @param {number} row
     * @returns {number[]}
     */
    getRow(row) {
        return [...this.data[row]];
    }

    toString() {
        return this.data.map(row => `[${row.toString()}]`).join(', ');
    }

    /**
     * @template T
     * @param {MatrixMapper<T>} mapper
     * @returns {T}
     */
    map(mapper) {
        return mapper(this);
    }

    /**
     *
     * @param {MatrixTransformer} transformers
     * @returns {Matrix}
     */
    transform(...transformers) {
        return transformers.reduce((acc, transformer) => transformer(acc), this);
    }

    /**
     *
     * @param {number[][]} data
     * @returns {number[][]}
     */
    #frozenCloneData(data) {
        let clone = data.map(row => Object.freeze([...row]));
        Object.freeze(clone);
        return clone;
    }

}

export class Point3D {

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        Object.freeze(this);
    }

    clone() {
        return new Point3D(this.x, this.y, this.z);
    }

    /**
     *
     * @param {any} other
     * @returns {boolean}
     */
    equals(other) {
        if (other instanceof Point3D) {
            return this.x === other.x && this.y === other.y && this.z === other.z;
        }

        return false;
    }

    toString() {
        return `Point3D(x=${this.x}, y=${this.y}, z=${this.z})`;
    }

    /**
     *
     * @template T
     * @param {Point3DMapper<T>} mapper
     * @returns {T}
     */
    map(mapper) {
        return mapper(this);
    }

    /**
     *
     * @param {Point3DTransformer} transformers
     * @returns {Point3D}
     */
    transform(...transformers) {
        return transformers.reduce((acc, transformer) => transformer(acc), this);
    }

}

export class AngleMath {
    static #TO_DEGREES = AngleMath.convert(AngleUnit.DEGREES);
    static #TO_RADIANS = AngleMath.convert(AngleUnit.RADIANS);

    /**
     *
     * @param {string} unit
     * @returns {AngleTransformer}
     */
    static convert(unit) {
        return angle => {
            if (angle.unit === unit) {
                return angle;
            } else if (angle.unit === AngleUnit.RADIANS && unit === AngleUnit.DEGREES) {
                return new Angle(AngleMath.#rad2Deg(angle.value), unit);
            } else if (angle.unit === AngleUnit.DEGREES && unit === AngleUnit.RADIANS) {
                return new Angle(AngleMath.#deg2Rad(angle.value), unit);
            }
        };
    }

    static toDegrees() {
        return AngleMath.#TO_DEGREES;
    }

    static toRadians() {
        return AngleMath.#TO_RADIANS;
    }

    /**
     *
     * @param {number} angle
     * @returns {number}
     */
    static #deg2Rad(angle) {
        return (Math.PI * angle) / 180;
    }

    /**
     *
     * @param {number} value
     * @returns {number}
     */
    static #rad2Deg(value) {
        return (180 * value) / Math.PI;
    }

}

export class Math3D {

    /**
     * @type {Point3DMapper<Matrix>}
     */
    static #TO_COLUMN_MATRIX = point => new Matrix(Math3D.#TO_COLUMN_VECTOR(point));

    /**
     * @type {Point3DMapper<number[][]>}
     */
    static #TO_COLUMN_VECTOR = point => [[point.x], [point.y], [point.y]];

    /**
     *
     * @param {string} axis
     * @param {Angle} angle
     * @returns {Point3DTransformer}
     */
    static rotateAround(axis, angle) {
        return point => {
            let pointColumnVector = point.transform(Math3D.#TO_COLUMN_VECTOR);
            let rotationMatrix = RotationMatrices.R(axis, angle);

            return rotationMatrix
                .transform(MatrixMath.multiply(pointColumnVector))
                .map(MatrixMath.toPoint3D());
        };
    }

    /**
     *
     * @param {number} mx
     * @param {number} my
     * @param {number} mz
     * @returns {Point3DTransformer}
     */
    static scale(mx, my, mz) {
        return point => new Point3D(point.x * mx, point.y * my, point.z * mz);
    }

    /**
     *
     * @returns {Point3DMapper<Matrix>}
     */
    static toColumnMatrix() {
        return Math3D.#TO_COLUMN_MATRIX;
    }

    /**
     * @type {Point3DMapper<number[][]>}
     */
    static toColumnVector() {
        return Math3D.#TO_COLUMN_VECTOR;
    }

    /**
     *
     * @param {number} dx
     * @param {number} dy
     * @param {number} dz
     * @returns {Point3DTransformer}
     */
    static translate(dx, dy, dz) {
        return point => new Point3D(point.x + dx, point.y + dy, point.z + dz);
    }

}

class MatrixMath {

    /**
     *
     * @type {MatrixMapper<Point3D>}
     */
    static #COLUMN_VECTOR_TO_POINT3D = matrix => {
        if (matrix.totalColumns !== 1 && matrix.totalRows !== 3) {
            throw new Error(`matrix has size ${matrix.totalRows}x${matrix.totalColumns} then is not a column vector`);
        }

        return new Point3D(matrix.getCell(0, 0), matrix.getCell(1, 0), matrix.getCell(2, 0));
    };

    /**
     *
     * @returns {MatrixMapper<Point3D>}
     */
    static toPoint3D() {
        return this.#COLUMN_VECTOR_TO_POINT3D;
    }

    /**
     *
     * @param {Matrix} other
     * @returns {MatrixTransformer}
     */
    static multiply(other) {
        return matrix => {
            if (matrix.totalColumns !== other.totalRows) {
                throw new Error(`Matrix multiplication dimension mismatch: columns of the given matrix 
                    ${matrix.totalColumns} must match rows of 'other' ${other.totalRows}.`);
            }

            const m = matrix.totalRows;
            const n = matrix.totalColumns;
            const p = other[0].length;

            const resultData = Array.from({length: m}, () => Array(p).fill(0));

            for (let i = 0; i < m; i++) {
                for (let j = 0; j < p; j++) {
                    let sum = 0;
                    for (let k = 0; k < n; k++) {
                        sum += matrix.getCell(i, k) * other.getCell(k, j);
                    }
                    resultData[i][j] = sum;
                }
            }

            return new Matrix(resultData);
        };
    }

}

class RotationMatrices {

    /**
     *
     * @param {Angle} angle
     * @returns {Matrix}
     */
    static RX(angle) {
        let theta = angle.transform(AngleMath.toRadians()).value;
        return new Matrix([
            [1, 0, 0],
            [0, Math.cos(theta), -1 * Math.sin(theta)],
            [0, Math.sin(theta), Math.cos(theta)]
        ]);
    }

    /**
     *
     * @param {Angle} angle
     * @returns {Matrix}
     */
    static RY(angle) {
        let theta = angle.transform(AngleMath.toRadians()).value;
        return new Matrix([
            [Math.cos(theta), 0, Math.sin(theta)],
            [0, 1, 0],
            [-1 * Math.sin(theta), 0, Math.cos(theta)]
        ]);
    }

    /**
     *
     * @param {Angle} angle
     * @returns {Matrix}
     */
    static RZ(angle) {
        let theta = angle.transform(AngleMath.toRadians()).value;
        return new Matrix([
            [Math.cos(theta), -1 * Math.sin(theta), 0],
            [Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 1]
        ]);
    }

    /**
     *
     * @param {string} axis
     * @param {Angle} angle
     * @returns {Matrix}
     */
    static R(axis, angle) {
        Axis.checkAxis(axis);
        switch (axis) {
            case Axis.X:
                return RotationMatrices.RX(angle);
            case Axis.Y:
                return RotationMatrices.RY(angle);
            case Axis.Z:
                return RotationMatrices.RY(angle);
        }
    }

}

/**
 *
 * @param {number} value
 * @param {string} unit
 * @returns {Angle}
 */
export function angle(value, unit) {
    return new Angle(value, unit);
}

/**
 *
 * @param {number} value
 * @returns {Angle}
 */
export function degrees(value) {
    return angle(value, AngleUnit.DEGREES);
}

/**
 *
 * @param {number[][]} data
 * @returns {Matrix}
 */
export function matrix(data) {
    return new Matrix(data);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Point3D}
 */
export function point3D(x, y, z) {
    return new Point3D(x, y, z);
}

/**
 *
 * @param {number} value
 * @returns {Angle}
 */
export function radians(value) {
    return angle(value, AngleUnit.RADIANS);
}

