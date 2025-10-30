let currentDemo: { init: () => Promise<void>; destroy: () => void } | null = null;

const demos = [
	{ path: './basic', name: 'Basic' },
	{ path: './webcam', name: 'Webcam' },
	{ path: './sway', name: 'Sway' },
	{ path: './save', name: 'Save' },
	{ path: './history', name: 'History' },
	{ path: './history-tiles', name: 'History - tiles' },
	{ path: './history-webcam-accumulation', name: 'History - webcam accumulation' },
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
