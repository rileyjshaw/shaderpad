import { expect, test } from '@playwright/test';
import { createHarness } from './support';

test('deep history compiles and renders without WebGL errors', async ({ page }, testInfo) => {
	await createHarness(page, testInfo);
	const errors = await page.evaluate(() => (window as any).__shaderpadBrowserHarness.auditDeepHistory());

	expect(errors).toEqual({ firstStep: 0, secondStep: 0, draw: 0 });
});

test('deep output history captures completed steps in age order', async ({ page }, testInfo) => {
	await createHarness(page, testInfo);
	const result = await page.evaluate(() => (window as any).__shaderpadBrowserHarness.auditDeepOutputHistory());

	expect(result).toEqual({ ages: [191, 128, 64], error: 0 });
});

test('deep history links eagerly once and keeps warm updates to one write', async ({ page }, testInfo) => {
	await createHarness(page, testInfo);
	const operations = await page.evaluate(() => (window as any).__shaderpadBrowserHarness.auditEagerDeepHistory());

	expect(operations.startup.filter((op: any) => op.method === 'compileShader')).toHaveLength(2);
	expect(operations.startup.filter((op: any) => op.method === 'linkProgram')).toHaveLength(1);
	expect(operations.warm.filter((op: any) => op.method === 'compileShader')).toHaveLength(0);
	expect(operations.warm.filter((op: any) => op.method === 'linkProgram')).toHaveLength(0);
	expect(operations.warm.filter((op: any) => op.method === 'texSubImage3D')).toHaveLength(1);
});

test('normalized, unsigned, and signed deep-history accessors compile in WebGL2', async ({ page }, testInfo) => {
	await createHarness(page, testInfo);
	const errors = await page.evaluate(() =>
		(window as any).__shaderpadBrowserHarness.auditTypedDeepHistoryAccessors(),
	);
	expect(errors).toEqual([
		['RGBA8', 0],
		['RGBA32UI', 0],
		['RGBA32I', 0],
	]);
});

test('deep output history inherits an integer render format', async ({ page }, testInfo) => {
	await createHarness(page, testInfo);
	const error = await page.evaluate(() =>
		(window as any).__shaderpadBrowserHarness.auditDeepOutputFormatInheritance(),
	);
	expect(error).toBe(0);
});

test('deep input and standard output history preserve age order through padding and wraparound', async ({
	page,
}, testInfo) => {
	await createHarness(page, testInfo);
	const chronology = await page.evaluate(() => (window as any).__shaderpadBrowserHarness.auditHistoryChronology());

	expect(chronology.beforeWrap).toEqual([50, 40, 30, 20, 10]);
	expect(chronology.afterWrap).toEqual([60, 50, 40, 30, 20]);
	expect(chronology.outputAges).toEqual([128, 64, 0]);
});
