/**
 * @callback AngleTransformer
 * @param {Angle} point
 * @return {Angle}
 */

/**
 * @template T
 * @callback MatrixMapper
 * @param {Matrix} matrix
 * @return {T}
 */

/**
 * @callback MatrixTransformer
 * @param {Matrix} matrix
 * @return {Matrix}
 */

/**
 * @template T
 * @callback Point3DMapper
 * @param {Point3D} point
 * @return {T}
 */

/**
 * @callback Point3DTransformer
 * @param {Point3D} point
 * @return {Point3D}
 */

class Angle {

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
            return this.value === alignedOther.value
        }
        return false;
    }

    toString() {
        return `Angle(value=${this.value}, unit=${this.unit})`;
    }

    /**
     *
     * @param {AngleTransformer} transformers
     * @return Angle
     */
    transform(...transformers) {
        return transformers.reduce((acc, transformer) => transformer(acc), this);
    }
}

class Axis {
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

class AngleUnit {
    static RADIANS = "rad";
    static DEGREES = "deg";

    static checkAngleUnit(unit) {
        if (unit !== AngleUnit.RADIANS && unit !== AngleUnit.DEGREES) {
            throw new Error('illegal angle unit <' + unit + '>');
        }
    }
}

class Matrix {

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
     * @return {number}
     */
    getCell(row, column) {
        return this.data[row][column];
    }

    /**
     *
     * @param {number} column
     * @return {number[]}
     */
    getColumn(column) {
        return this.data.map(row => row[column]);
    }

    /**
     *
     * @param {number} row
     * @return {number[]}
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
     * @return {T}
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
     * @return {number[][]}
     */
    #frozenCloneData(data) {
        let clone = data.map(row => Object.freeze([...row]));
        Object.freeze(clone);
        return clone;
    }

}

class Point3D {

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
     * @return {boolean}
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
     * @return {T}
     */
    map(mapper) {
        return mapper(this);
    }

    /**
     *
     * @param {Point3DTransformer} transformers
     * @return {Point3D}
     */
    transform(...transformers) {
        return transformers.reduce((acc, transformer) => transformer(acc), this);
    }

}

class AngleMath {
    static #TO_DEGREES = AngleMath.convert(AngleUnit.DEGREES);
    static #TO_RADIANS = AngleMath.convert(AngleUnit.RADIANS);

    /**
     *
     * @param {string} unit
     * @return {AngleTransformer}
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
        }
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

class Math3D {

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
     * @return {Point3DTransformer}
     */
    static rotateAround(axis, angle) {
        return point => {
            let pointColumnVector = point.transform(Math3D.#TO_COLUMN_VECTOR)
            let rotationMatrix = RotationMatrices.R(axis, angle);

            return rotationMatrix
                .transform(MatrixMath.multiply(pointColumnVector))
                .map(MatrixMath.toPoint3D());
        }
    }

    /**
     *
     * @param {number} mx
     * @param {number} my
     * @param {number} mz
     * @return {Point3DTransformer}
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
     * @return {Point3DTransformer}
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
    }

    /**
     *
     * @return {MatrixMapper<Point3D>}
     */
    static toPoint3D() {
        return this.#COLUMN_VECTOR_TO_POINT3D;
    }

    /**
     *
     * @param {Matrix} other
     * @return {MatrixTransformer}
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
     * @return {Matrix}
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
     * @return {Matrix}
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
     * @return {Matrix}
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
 * @return {Angle}
 */
function angle(value, unit = AngleUnit.RADIANS) {
    return new Angle(value, unit);
}

/**
 *
 * @param {number[][]} data
 * @returns {Matrix}
 */
function matrix(data) {
    return new Matrix(data);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Point3D}
 */
function point3D(x, y, z) {
    return new Point3D(x, y, z);
}

