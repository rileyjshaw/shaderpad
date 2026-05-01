import { test, type Page, type TestInfo } from '@playwright/test';

export async function createHarness(page: Page, testInfo: TestInfo) {
	const hasWebGL2 = await page.evaluate(() => {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		gl?.getExtension('WEBGL_lose_context')?.loseContext();
		return Boolean(gl);
	});

	test.skip(!hasWebGL2, `WebGL2 is unavailable in ${testInfo.project.name}`);

	await page.goto('/');
	await page.waitForFunction(() => Boolean((window as any).__shaderpadBrowserHarness));
}
