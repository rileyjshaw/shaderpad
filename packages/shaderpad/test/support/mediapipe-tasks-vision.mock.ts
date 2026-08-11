type MediaPipeTask = 'face' | 'hands' | 'pose' | 'segmenter';

interface MediaPipeCreateOptions {
	baseOptions?: {
		delegate?: 'GPU' | 'CPU';
	};
	[key: string]: unknown;
}

export const __mediapipeMockState = {
	createDelayMs: 0,
	setOptionsDelayMs: 0,
	createCalls: 0,
	createOptions: [] as Array<{ task: MediaPipeTask; options: MediaPipeCreateOptions }>,
	setOptionsCalls: 0,
	detectCalls: [] as Array<{ mode: 'video' | 'image'; time: number }>,
	filesetCalls: 0,
	filesetFailuresRemaining: 0,
	createFailuresRemaining: 0,
	createFailureTask: null as 'face' | 'hands' | 'pose' | 'segmenter' | null,
	sequence: [] as Array<{ x: number; y: number }>,
	reset() {
		__mediapipeMockState.createDelayMs = 0;
		__mediapipeMockState.setOptionsDelayMs = 0;
		__mediapipeMockState.createCalls = 0;
		__mediapipeMockState.createOptions = [];
		__mediapipeMockState.setOptionsCalls = 0;
		__mediapipeMockState.detectCalls = [];
		__mediapipeMockState.filesetCalls = 0;
		__mediapipeMockState.filesetFailuresRemaining = 0;
		__mediapipeMockState.createFailuresRemaining = 0;
		__mediapipeMockState.createFailureTask = null;
		__mediapipeMockState.sequence = [];
	},
};

function failCreateIfRequested(task: MediaPipeTask) {
	if (
		__mediapipeMockState.createFailuresRemaining > 0 &&
		(!__mediapipeMockState.createFailureTask || __mediapipeMockState.createFailureTask === task)
	) {
		__mediapipeMockState.createFailuresRemaining -= 1;
		throw new Event('error');
	}
}

async function maybeDelay(ms: number) {
	if (ms > 0) {
		await new Promise(resolve => setTimeout(resolve, ms));
	}
}

function getFrameIndexFromTime(time: number) {
	return Math.max(0, Math.round(time * 30));
}

function getPointForTime(time: number) {
	const frameIndex = getFrameIndexFromTime(time);
	return (
		__mediapipeMockState.sequence[frameIndex] ??
		__mediapipeMockState.sequence[__mediapipeMockState.sequence.length - 1] ?? { x: 0.55, y: 0.5 }
	);
}

function createHandResult(time: number) {
	const point = getPointForTime(time);
	const thumb = { x: 0.1, y: 0.5, z: 0 };
	return {
		landmarks: [
			Array.from({ length: 21 }, (_, index) => {
				if (index === 4) return thumb;
				if (index === 8) {
					return {
						x: point.x,
						y: point.y,
						z: time,
					};
				}
				return {
					x: thumb.x,
					y: thumb.y,
					z: time,
				};
			}),
		],
		handedness: [[{ categoryName: 'Right' }]],
	};
}

function createFaceResult(time: number) {
	const point = getPointForTime(time);
	return {
		faceLandmarks: [
			Array.from({ length: 478 }, (_, index) => ({
				x: index === 4 ? point.x : 0.5,
				y: index === 4 ? point.y : 0.5,
				z: time,
				visibility: 1,
			})),
		],
	};
}

function connectionRange(length: number, offset = 0) {
	return Array.from({ length }, (_, index) => ({
		start: (offset + index) % 478,
		end: (offset + index + 1) % 478,
	}));
}

export const FilesetResolver = {
	async forVisionTasks() {
		__mediapipeMockState.filesetCalls += 1;
		if (__mediapipeMockState.filesetFailuresRemaining > 0) {
			__mediapipeMockState.filesetFailuresRemaining -= 1;
			throw new Event('error');
		}
		return {};
	},
};

export class HandLandmarker {
	static async createFromOptions(_fileset: unknown, options: MediaPipeCreateOptions) {
		__mediapipeMockState.createCalls += 1;
		__mediapipeMockState.createOptions.push({ task: 'hands', options });
		await maybeDelay(__mediapipeMockState.createDelayMs);
		failCreateIfRequested('hands');
		return {
			async setOptions() {
				__mediapipeMockState.setOptionsCalls += 1;
				await maybeDelay(__mediapipeMockState.setOptionsDelayMs);
			},
			detectForVideo(source: { currentTime: number }, _now: number) {
				__mediapipeMockState.detectCalls.push({ mode: 'video', time: source.currentTime });
				return createHandResult(source.currentTime);
			},
			detect(source: { width: number }) {
				__mediapipeMockState.detectCalls.push({ mode: 'image', time: source.width });
				return createHandResult(source.width);
			},
			close() {},
		};
	}
}

export class FaceLandmarker {
	static FACE_LANDMARKS_TESSELATION = connectionRange(12, 0);
	static FACE_LANDMARKS_LEFT_EYEBROW = connectionRange(8, 20);
	static FACE_LANDMARKS_RIGHT_EYEBROW = connectionRange(8, 40);
	static FACE_LANDMARKS_LEFT_EYE = connectionRange(16, 60);
	static FACE_LANDMARKS_RIGHT_EYE = connectionRange(16, 90);
	static FACE_LANDMARKS_LIPS = connectionRange(40, 120);
	static FACE_LANDMARKS_FACE_OVAL = connectionRange(12, 180);

	static async createFromOptions(_fileset: unknown, options: MediaPipeCreateOptions) {
		__mediapipeMockState.createCalls += 1;
		__mediapipeMockState.createOptions.push({ task: 'face', options });
		await maybeDelay(__mediapipeMockState.createDelayMs);
		failCreateIfRequested('face');
		return {
			async setOptions() {
				__mediapipeMockState.setOptionsCalls += 1;
				await maybeDelay(__mediapipeMockState.setOptionsDelayMs);
			},
			detectForVideo(source: { currentTime: number }, _now: number) {
				__mediapipeMockState.detectCalls.push({ mode: 'video', time: source.currentTime });
				return createFaceResult(source.currentTime);
			},
			detect(source: { width: number }) {
				__mediapipeMockState.detectCalls.push({ mode: 'image', time: source.width });
				return createFaceResult(source.width);
			},
			close() {},
		};
	}
}

function createPoseResult() {
	return {
		landmarks: [],
		segmentationMasks: [],
	};
}

export class PoseLandmarker {
	static async createFromOptions(_fileset: unknown, options: MediaPipeCreateOptions) {
		__mediapipeMockState.createCalls += 1;
		__mediapipeMockState.createOptions.push({ task: 'pose', options });
		await maybeDelay(__mediapipeMockState.createDelayMs);
		failCreateIfRequested('pose');
		return {
			async setOptions() {
				__mediapipeMockState.setOptionsCalls += 1;
				await maybeDelay(__mediapipeMockState.setOptionsDelayMs);
			},
			detectForVideo(source: { currentTime: number }, _now: number) {
				__mediapipeMockState.detectCalls.push({ mode: 'video', time: source.currentTime });
				return createPoseResult();
			},
			detect(source: { width: number }) {
				__mediapipeMockState.detectCalls.push({ mode: 'image', time: source.width });
				return createPoseResult();
			},
			close() {},
		};
	}
}

function createSegmenterResult() {
	return {
		categoryMask: undefined,
		confidenceMasks: [],
	};
}

export class ImageSegmenter {
	static async createFromOptions(_fileset: unknown, options: MediaPipeCreateOptions) {
		__mediapipeMockState.createCalls += 1;
		__mediapipeMockState.createOptions.push({ task: 'segmenter', options });
		await maybeDelay(__mediapipeMockState.createDelayMs);
		failCreateIfRequested('segmenter');
		return {
			async setOptions() {
				__mediapipeMockState.setOptionsCalls += 1;
				await maybeDelay(__mediapipeMockState.setOptionsDelayMs);
			},
			segmentForVideo(source: { currentTime: number }, _now: number) {
				__mediapipeMockState.detectCalls.push({ mode: 'video', time: source.currentTime });
				return createSegmenterResult();
			},
			segment(source: { width: number }) {
				__mediapipeMockState.detectCalls.push({ mode: 'image', time: source.width });
				return createSegmenterResult();
			},
			getLabels() {
				return ['background'];
			},
			close() {},
		};
	}
}
