import { expect, test } from '@playwright/test';
import { createHarness } from './support';

test.describe('browser transfer paths', () => {
	test('same-canvas chaining stays on GPU in a real browser', async ({ page }, testInfo) => {
		await createHarness(page, testInfo);
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

	test('separate canvases fall back to CPU readback in a real browser', async ({ page }, testInfo) => {
		await createHarness(page, testInfo);
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

	test('cross-context render formats transfer without WebGL errors', async ({ page }, testInfo) => {
		await createHarness(page, testInfo);
		const results = await page.evaluate(async () => {
			const results = [];
			for (const format of ['RGBA16F', 'R16F', 'RG16F', 'R11F_G11F_B10F', 'RGB10_A2', 'R8', 'R8UI']) {
				const harness = await (window as any).__shaderpadBrowserHarness.createTransferHarness({
					sharedCanvas: false,
					format,
				});
				results.push([format, harness.getErrors()]);
				harness.destroy();
			}
			return results;
		});

		expect(results).toEqual([
			['RGBA16F', { source: 0, dest: 0 }],
			['R16F', { source: 0, dest: 0 }],
			['RG16F', { source: 0, dest: 0 }],
			['R11F_G11F_B10F', { source: 0, dest: 0 }],
			['RGB10_A2', { source: 0, dest: 0 }],
			['R8', { source: 0, dest: 0 }],
			['R8UI', { source: 0, dest: 0 }],
		]);
	});

	test('format inference accepts float and packed arrays', async ({ page }, testInfo) => {
		await createHarness(page, testInfo);
		const errors = await page.evaluate(() => (window as any).__shaderpadBrowserHarness.auditFormatUploads());
		expect(errors).toEqual([
			['RGBA16F', 0],
			['RGB565', 0],
			['RGB5_A1', 0],
			['RGBA4', 0],
			['R11F_G11F_B10F', 0],
			['RGB9_E5', 0],
			['RGBA16F Float32Array update', 0],
			['RGB9_E5 Uint32Array update', 0],
			['RGBA16F null history', 0],
			['RGBA16F Uint16Array history update', 0],
		]);
	});
});
