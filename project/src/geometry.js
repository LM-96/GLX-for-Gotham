// @ts-check
/**
 * @author Luca Marchegiani
 */

/* TYPES (JSDoc) **************************************************************************************************** */
/**
 * @template T
 * @typedef {Mapper<Angle, T>} AngleMapper
 */

/**
 * @typedef {Transformer<Angle>} AngleTransformer
 */

/**
 * @typedef {import('./geometry').Axis} Axis
 */

/**
 * @template T
 * @template R
 * @typedef {import('./geometry').Mapper<T, R>} Mapper
 */

/**
 * @template R
 *  @typedef {Mapper<Matrix, R>} MatrixMapper
 */

/**
 * @typedef {Transformer<Matrix>} MatrixTransformer
 */

/**
 * @template T
 * @typedef {import('./geometry').Transformer<T>} Transformer
 */

/**
 * @template R
 * @typedef {Mapper<Point3D, R>} Point3DMapper
 */

/**
 * @typedef {Transformer<Point3D>} Point3DTransformer
 */

/* STATIC CLASSES *************************************************************************************************** */

export class AngleUnits {
    static RADIANS = "rad";
    static DEGREES = "deg";

    /**
     *
     * @param {any} unit
     */
    static checkAngleUnit(unit) {
        if (unit !== AngleUnits.RADIANS && unit !== AngleUnits.DEGREES) {
            throw new Error('illegal angle unit <' + unit + '>');
        }
    }
}

export class Axes {
    static X = "x";
    static Y = "y";
    static Z = "z";

    /**
     *
     * @param {string} axis
     */
    static checkAxis(axis) {
        if (axis !== Axes.X && axis !== Axes.Y && axis !== Axes.Z) {
            throw new Error('illegal axis <' + axis + '>');
        }
    }
}

class RotationMatrices {

    /**
     *
     * @param {Angle} angle
     * @returns {Matrix}
     */
    static RX(angle) {
        let theta = angle.transform(AngleMath.asRadians()).value;
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
        let theta = angle.transform(AngleMath.asRadians()).value;
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
        let theta = angle.transform(AngleMath.asRadians()).value;
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
        Axes.checkAxis(axis);
        switch (axis) {
            case Axes.X:
                return RotationMatrices.RX(angle);
            case Axes.Y:
                return RotationMatrices.RY(angle);
            case Axes.Z:
                return RotationMatrices.RY(angle);
            default:
                throw new Error('unrecognized axis "' + axis + '"');
        }
    }

}

/* CLASSES ********************************************************************************************************** */

export class Angle {

    /**
     *
     * @param {number} value
     * @param {string} unit
     */
    constructor(value, unit = AngleUnits.RADIANS) {
        AngleUnits.checkAngleUnit(unit);
        this.value = value;
        this.unit = unit;
        Object.freeze(this);
    }

    get degreesValue() {
        return this.map(AngleMath.degreesValue());
    }

    get radiansValue() {
        return this.map(AngleMath.radiansValue());
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

    /**
     * 
     * @template R
     * @param {AngleMapper<R>} mapper 
     * @returns R
     */
    map(mapper) {
        return mapper(this);
    }

    toString() {
        return `Angle(value=${this.value}, unit=${this.unit})`;
    }

    /**
     *
     * @param {...AngleTransformer} transformers
     * @returns {Angle}
     */
    transform(...transformers) {
        return applyTransformationChain(this, transformers);
    }
}

export class AngleMath {
    static #TO_DEGREES = AngleMath.convert(AngleUnits.DEGREES);
    static #TO_RADIANS = AngleMath.convert(AngleUnits.RADIANS);

    /**
     * 
     * @returns {AngleTransformer}
     */
    static asDegrees() {
        return AngleMath.#TO_DEGREES;
    }

    /**
     * 
     * @returns {AngleTransformer}
     */
    static asRadians() {
        return AngleMath.#TO_RADIANS;
    }

    /**
     *
     * @param {string} unit
     * @returns {AngleTransformer}
     */
    static convert(unit) {
        return angle => {
            AngleUnits.checkAngleUnit(unit);
            if (angle.unit === unit) {
                return angle;
            } else if (angle.unit === AngleUnits.RADIANS && unit === AngleUnits.DEGREES) {
                return new Angle(AngleMath.#rad2Deg(angle.value), unit);
            } else if (angle.unit === AngleUnits.DEGREES && unit === AngleUnits.RADIANS) {
                return new Angle(AngleMath.#deg2Rad(angle.value), unit);
            }

            throw new Error('unrecognized angle unit "' + unit + '"');
        };
    }

    /**
     * 
     * @returns {AngleMapper<number>}
     */
    static degreesValue() {
        return angle => {
            if (angle.unit === AngleUnits.RADIANS) {
                return AngleMath.#rad2Deg(angle.value);
            }

            return angle.value;
        }
    }

    /**
     * 
     * @param {number} value
     * @returns {AngleTransformer} 
     */
    static multiplyBy(value) {
        return angle => new Angle(angle.value * value, angle.unit);
    }

    /**
     * 
     * @returns {AngleMapper<number>}
     */
    static radiansValue() {
        return angle => {
            if (angle.unit === AngleUnits.DEGREES) {
                return AngleMath.#deg2Rad(angle.value);
            }

            return angle.value;
        }
    }

    /**
     * 
     * @param {Angle} other 
     * @returns {AngleTransformer}
     */
    static sum(other) {
        return angle => {
            return new Angle(angle.map(AngleMath.radiansValue()) + other.map(AngleMath.radiansValue()),
                AngleUnits.RADIANS);
        }
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
     * @type {Point3DMapper<Readonly<number[]>>}
     */
    static #TO_IMMUTABLE_ARRAY = point => Object.freeze([point.x, point.y, point.z])

    /**
     *
     * @param {string} axis
     * @param {Angle} angle
     * @returns {Point3DTransformer}
     */
    static rotateAround(axis, angle) {
        return point => {
            let pointColumnVector = matrix(point.map(Math3D.#TO_COLUMN_VECTOR));
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
     * @param {Axis} coordinate 
     * @param {number} value 
     * @returns {Point3DTransformer}
     */
    static setCoordinate(coordinate, value) {
        return point => {
            switch (coordinate) {
                case Axes.X: return new Point3D(value, point.y, point.z);
                case Axes.Y: return new Point3D(point.x, value, point.z);
                case Axes.Z: return new Point3D(point.x, point.y, value);
                default: throw new Error(`invalid axis ${coordinate}`);

            }
        }
    }

    /**
     *
     * @returns {Point3DMapper<Matrix>}
     */
    static toColumnMatrix() {
        return Math3D.#TO_COLUMN_MATRIX;
    }

    /**
     * @returns {Point3DMapper<number[][]>}
     */
    static toColumnVector() {
        return Math3D.#TO_COLUMN_VECTOR;
    }

    static toImmutableArray() {
        return Math3D.#TO_IMMUTABLE_ARRAY;
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
     * @param {...MatrixTransformer} transformers
     * @returns {Matrix}
     */
    transform(...transformers) {
        return applyTransformationChain(this, transformers);
    }

    /**
     *
     * @param {number[][]} data
     * @returns {Readonly<Readonly<number[]>[]>}
     */
    #frozenCloneData(data) {
        let clone = data.map(row => Object.freeze([...row]));
        return Object.freeze(clone);
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
            const p = other.data[0].length;

            const resultData = Array.from({ length: m }, () => Array(p).fill(0));

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
     * @param {...Point3DTransformer} transformers
     * @returns {Point3D}
     */
    transform(...transformers) {
        return applyTransformationChain(this, transformers);
    }

}

/* FUNCTIONS ******************************************************************************************************** */

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
    return angle(value, AngleUnits.DEGREES);
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
    return angle(value, AngleUnits.RADIANS);
}

/* UTILITIES ******************************************************************************************************** */

/**
 * @template T
 * @param {T} obj
 * @param {Transformer<T>[]} transformers
 * @returns {T}
 */
function applyTransformationChain(obj, transformers) {
    let result = obj;
    for (let transformer of transformers) {
        result = transformer(result);
    }

    return result;
}
