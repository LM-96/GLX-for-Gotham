export type AngleUnit = 'deg' | 'rad';

export type AngleMapper<R> = Mapper<Angle, R>

export type AngleTransformer = Transformer<Angle>;

export type Axis = 'x' | 'y' | 'z';

export type Mapper<T, R> = (obj: T) => R;

export type MatrixMapper<R> = Mapper<Matrix, R>;

export type MatrixTransformer = Transformer<Matrix>;

export type Point3DMapper<R> = Mapper<Point3D, R>;

export type Point3DTransformer = Transformer<Point3D>;

export type Transformer<T> = (obj: T) => T;

export type Vector3D = {
    dx: number,
    dy: number,
    dz: number
}

export declare class Angle {
    readonly value: number;
    readonly unit: AngleUnit;

    clone();
    equals(other: any);
    map<R>(mapper: Mapper<R>): R
    toString(): string;
    transform(...transformers: AngleTransformer[]): Angle;
}

export declare class AngleMath {
    static asDegrees(): AngleTransformer;
    static asRadians(): AngleTransformer;
    static degreeValue(): Mapper<number>;
    static convert(unit: AngleUnit): AngleTransformer;
    static multiplyBy(value: number): AngleTransformer;
    static radiansValue(): Mapper<number>;
    static sum(other: Angle): AngleTransformer;
}

export declare class AngleUnits {
    static RADIANS: string;
    static DEGREES: string;

    static checkAngleUnit(unit: string): void;
}

export declare class Axes {
    static X: Axis;
    static Y: Axis;
    static Z: Axis;

    static checkAxis(axis: string): void;
}

export declare class Math3D {
    static rotateAround(axis: Axis, angle: Angle): Point3DTransformer;
    static scale(mx: number, my: number, mz: number): Point3DTransformer;
    static setCoordinate(coordinate: Axis, value: number): Point3DTransformer;
    static toColumnMatrix(): Point3DMapper<Matrix>;
    static toColumnVector(): Point3DMapper<number[][]>;
    static toImmutableArray(): Point3DMapper<Readonly<number[]>>;
    static translate(dx: number, dy: number, dz: number): Point3DTransformer;

}

export declare class Matrix {
    readonly data: Readonly<Readonly<number[]>[]>;

    getCell(row: number, column: number): number;
    getColumn(column: number): Readonly<number[]>;
    getRow(row: number): Readonly<number[]>;
    map<T, R>(mapper: Mapper<T, R>): R;
    toString(): string;
    transform(...transformers: MatrixTransformer[]): Matrix
}

export declare class MatrixMath {
    static multiply(other: MatrixTransformer): MatrixTransformer;
    static toPoint3D(): MatrixMapper<Point3D>;
}

export declare class Point3D {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    clone(): Point3D;
    equals(other: any): boolean;
    map<R>(mapper: Point3DMapper<R>): R;
    toString(): string;
    transform(...transformers: Point3DTransformer[]): Point3D;
}

export declare class RotationMatrices {
    static RX(angle: Angle): Matrix;
    static RY(angle: Angle): Matrix;
    static RZ(angle: Angle): Matrix;
    static R(axis: Axis, angle: Angle): Matrix
}

export declare function angle(value: number, unit: AngleUnit): Angle;

export declare function degrees(value: number): Angle;

export function matrix(data: number[][]): Matrix;

export function point3D(x: number, y: number, z: number): Point3D;

export function radians(value: number): Angle;