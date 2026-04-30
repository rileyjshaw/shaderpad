export const __mediapipeMockState = {
	createDelayMs: 0,
	createCalls: 0,
	detectCalls: [] as Array<{ mode: 'video' | 'image'; time: number }>,
	filesetCalls: 0,
	sequence: [] as Array<{ x: number; y: number }>,
	reset() {
		__mediapipeMockState.createDelayMs = 0;
		__mediapipeMockState.createCalls = 0;
		__mediapipeMockState.detectCalls = [];
		__mediapipeMockState.filesetCalls = 0;
		__mediapipeMockState.sequence = [];
	},
};

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

export const FilesetResolver = {
	async forVisionTasks() {
		__mediapipeMockState.filesetCalls += 1;
		return {};
	},
};

export class HandLandmarker {
	static async createFromOptions(_fileset: unknown, _options: unknown) {
		__mediapipeMockState.createCalls += 1;
		if (__mediapipeMockState.createDelayMs > 0) {
			await new Promise(resolve => setTimeout(resolve, __mediapipeMockState.createDelayMs));
		}
		return {
			async setOptions() {},
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
