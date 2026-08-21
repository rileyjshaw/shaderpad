import { expect, test } from '@playwright/test';
import { createHarness } from './support';

test('web-component texture sources begin loading concurrently', async ({ page }, testInfo) => {
	await createHarness(page, testInfo);
	const listening = await page.evaluate(() =>
		(window as any).__shaderpadBrowserHarness.auditConcurrentTextureLoading(),
	);
	expect(listening).toEqual([true, true]);
});
