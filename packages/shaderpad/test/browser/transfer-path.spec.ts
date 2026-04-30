import { expect, test } from '@playwright/test';

async function createHarness(page: any) {
	await page.goto('/');
	await page.waitForFunction(() => Boolean((window as any).__shaderpadBrowserHarness));
}

test.describe('browser transfer paths', () => {
	test('same-canvas chaining stays on GPU in a real browser', async ({ page }) => {
		await createHarness(page);
		const ops = await page.evaluate(async () => {
			const harness = await (window as any).__shaderpadBrowserHarness.createTransferHarness({
				sharedCanvas: true,
			});
			const result = harness.getOps();
			harness.destroy();
			return result;
		});

		expect(ops.filter((op: any) => op.method === 'readPixels')).toHaveLength(0);
		expect(ops.filter((op: any) => op.method === 'copyTexSubImage3D')).toHaveLength(1);
	});

	test('separate canvases fall back to CPU readback in a real browser', async ({ page }) => {
		await createHarness(page);
		const ops = await page.evaluate(async () => {
			const harness = await (window as any).__shaderpadBrowserHarness.createTransferHarness({
				sharedCanvas: false,
			});
			const result = harness.getOps();
			harness.destroy();
			return result;
		});

		expect(ops.filter((op: any) => op.method === 'readPixels')).toHaveLength(1);
		expect(ops.filter((op: any) => op.method === 'copyTexSubImage3D')).toHaveLength(0);
	});
});
