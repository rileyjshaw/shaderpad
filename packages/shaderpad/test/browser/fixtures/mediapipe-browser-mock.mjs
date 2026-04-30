const state = (globalThis.__mediapipeTestState ??= {
	createCalls: 0,
	createDelayMs: 0,
	detectCalls: [],
	filesetCalls: 0,
	sequence: [],
	reset() {
		this.createCalls = 0;
		this.createDelayMs = 0;
		this.detectCalls = [];
		this.filesetCalls = 0;
		this.sequence = [];
	},
});

function getFrameIndexFromTime(time) {
	return Math.max(0, Math.round(time * 30));
}

function createLandmarks(time) {
	const frameIndex = getFrameIndexFromTime(time);
	const entry = state.sequence[frameIndex] ?? state.sequence[state.sequence.length - 1] ?? { x: 0.5, y: 0.5 };
	return Array.from({ length: 21 }, (_, index) => ({
		x: index === 8 ? entry.x : 0.5,
		y: index === 8 ? entry.y : 0.5,
		z: 0,
	}));
}

export const __mediapipeMockState = state;

export const FilesetResolver = {
	async forVisionTasks() {
		state.filesetCalls += 1;
		return {};
	},
};

export class HandLandmarker {
	static async createFromOptions(_fileset, _options) {
		state.createCalls += 1;
		if (state.createDelayMs > 0) {
			await new Promise(resolve => setTimeout(resolve, state.createDelayMs));
		}

		return {
			async setOptions() {},
			detectForVideo(source, now) {
				state.detectCalls.push({
					mode: 'video',
					time: source.currentTime,
					now,
				});
				return {
					landmarks: [createLandmarks(source.currentTime)],
					handedness: [[{ categoryName: 'Right' }]],
				};
			},
			detect(source) {
				state.detectCalls.push({
					mode: 'image',
					time: source.width,
				});
				return {
					landmarks: [createLandmarks(source.width / 30)],
					handedness: [[{ categoryName: 'Right' }]],
				};
			},
			close() {},
		};
	}
}
