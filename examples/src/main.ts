let currentDemo: { init: () => Promise<void>; destroy: () => void } | null = null;

const demos = [
	{ path: './basic', name: 'Basic' },
	{ path: './webcam', name: 'Webcam' },
	{ path: './webcam-bw', name: 'Webcam B/W' },
	{ path: './sway', name: 'Sway' },
	{ path: './save', name: 'Save' },
	{ path: './history', name: 'History' },
	{ path: './history-tiles', name: 'History - tiles' },
	{ path: './history-webcam-delay', name: 'History - webcam delay' },
	{ path: './history-webcam-channels', name: 'History - webcam channel delay' },
	{ path: './history-webcam-channels-multi', name: 'History - webcam channel multi delay' },
	{ path: './jitter', name: 'History - jitter' },
	{ path: './history-webcam-grid', name: 'History - webcam grid' },
	{ path: './face', name: 'Face Detection' },
	{ path: './face-camo', name: 'Face Camo' },
	{ path: './face-dual', name: 'Face Dual' },
	{ path: './pose', name: 'Pose Detection' },
	{ path: './pose-background-blur', name: 'Pose - Background blur' },
	{ path: './body-camo', name: 'Body Camo' },
	{ path: './hands', name: 'Hands Detection' },
	{ path: './hands-elastic', name: 'Hands - Elastic' },
	{ path: './hands-finger-pens', name: 'Hands - Finger Pens' },
	{ path: './segmenter', name: 'Segmenter' },
	{ path: './resize-test', name: 'Resize Test' },
	{ path: './god-rays', name: 'God rays' },
	{ path: './fragmentum', name: 'Fragmentum' },
] as const;

async function loadDemo(demoPath: string) {
	if (currentDemo) {
		currentDemo.destroy();
		currentDemo = null;
	}

	try {
		const demoExists = demos.some(demo => demo.path === demoPath);
		if (!demoExists) {
			throw new Error(`Unknown demo: ${demoPath}`);
		}

		const demoModule = await import(/* @vite-ignore */ demoPath);
		currentDemo = demoModule;
		await demoModule.init();

		const errorDiv = document.getElementById('error')!;
		errorDiv.style.display = 'none';
	} catch (error) {
		console.error('Failed to load demo:', error);
		const errorDiv = document.getElementById('error')!;
		errorDiv.textContent = `Failed to load demo: ${error}`;
		errorDiv.style.display = 'block';
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const select = document.getElementById('demo-select') as HTMLSelectElement;

	demos.forEach((demo, index) => {
		const option = document.createElement('option');
		option.value = demo.path;
		option.textContent = demo.name;
		if (index === 0) {
			option.selected = true;
		}
		select.appendChild(option);
	});

	select.addEventListener('change', e => {
		const target = e.target as HTMLSelectElement;
		loadDemo(target.value);
	});

	loadDemo(select.value);
});
