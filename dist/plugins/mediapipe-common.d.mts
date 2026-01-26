import { TextureSource } from '../index.mjs';

declare const dummyTexture: {
    data: Uint8Array<ArrayBuffer>;
    width: number;
    height: number;
};
type MediaPipeSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;
declare function isMediaPipeSource(source: TextureSource): source is MediaPipeSource;
declare function hashOptions(options: object): string;
declare function calculateBoundingBoxCenter(data: Float32Array, entityIdx: number, landmarkIndices: readonly number[] | number[], landmarkCount: number, offset?: number): [number, number, number, number];
declare function getSharedFileset(): Promise<any>;
declare function generateGLSLFn(history: number | undefined): {
    historyParams: string;
    fn: (returnType: string, name: string, args: string, body: string) => string;
};

export { type MediaPipeSource, calculateBoundingBoxCenter, dummyTexture, generateGLSLFn, getSharedFileset, hashOptions, isMediaPipeSource };
