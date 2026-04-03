import { TextureSource } from '../index.js';

declare const dummyTexture: {
    data: Uint8Array<ArrayBuffer>;
    width: number;
    height: number;
};
type MediaPipeSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;
declare function isMediaPipeSource(source: TextureSource): source is MediaPipeSource;
declare function hashOptions(options: object): string;
declare function getOrCreateSharedResource<T>(key: string, sharedResources: Map<string, T>, sharedResourcePromises: Map<string, Promise<T | undefined>>, create: () => Promise<T | undefined>): Promise<T | undefined>;
declare function calculateBoundingBoxCenter(data: Float32Array, entityIdx: number, landmarkIndices: readonly number[] | number[], landmarkCount: number, offset?: number): [number, number, number, number];
declare function getSharedFileset(): Promise<any>;
declare function generateGLSLFn(history: number | undefined): {
    historyParams: string;
    fn: (returnType: string, name: string, args: string, body: string) => string;
};

export { type MediaPipeSource, calculateBoundingBoxCenter, dummyTexture, generateGLSLFn, getOrCreateSharedResource, getSharedFileset, hashOptions, isMediaPipeSource };
