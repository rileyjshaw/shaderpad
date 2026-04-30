import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './packages/shaderpad/test/browser',
	fullyParallel: true,
	reporter: 'list',
	timeout: 30000,
	use: {
		baseURL: 'http://127.0.0.1:4173',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		video: 'retain-on-failure',
	},
	webServer: {
		command: 'node packages/shaderpad/test/browser/server.mjs',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
	],
});
