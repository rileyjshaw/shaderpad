import { TextureSource } from '../index.mjs';

type MediaPipeSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;
declare function isMediaPipeSource(source: TextureSource): source is MediaPipeSource;
declare function hashOptions(options: object): string;
declare function calculateBoundingBoxCenter(data: Float32Array, entityIdx: number, landmarkIndices: readonly number[] | number[], landmarkCount: number): [number, number, number, number];
declare function getSharedFileset(): Promise<any>;

export { type MediaPipeSource, calculateBoundingBoxCenter, getSharedFileset, hashOptions, isMediaPipeSource };
