import { expect, test } from '@playwright/test';
import { createHarness } from './support';

function dedupeConsecutive(values: number[]) {
	return values.filter((value, index) => index === 0 || value !== values[index - 1]);
}

test.describe('finger-pens browser harness', () => {
	test('advances history on every explicit trails update even when video time is unchanged', async ({
		page,
	}, testInfo) => {
		await createHarness(page, testInfo);
		const result = await page.evaluate(async () => {
			const harness = await (window as any).__shaderpadBrowserHarness.createFingerPensHarness();
			await harness.runScenario({ outputFrames: 8, trailEvery: 1, videoEvery: 4 });
			const snapshot = {
				state: harness.getState(),
			};
			harness.destroy();
			return snapshot;
		});

		expect(dedupeConsecutive(result.state.frameOffsets)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		expect(result.state.createCalls).toBe(1);
		expect(result.state.detectCalls.map((call: any) => call.time)).toEqual([0, 1 / 30, 2 / 30]);
	});

	test('non-history sibling updates do not advance the trails history ring', async ({ page }, testInfo) => {
		await createHarness(page, testInfo);
		const result = await page.evaluate(async () => {
			const harness = await (window as any).__shaderpadBrowserHarness.createFingerPensHarness();
			await harness.runScenario({ outputFrames: 8, trailEvery: 4, videoEvery: 1 });
			const snapshot = {
				state: harness.getState(),
			};
			harness.destroy();
			return snapshot;
		});

		expect(dedupeConsecutive(result.state.frameOffsets)).toEqual([0, 1, 2]);
		expect(result.state.outputResults.length).toBeGreaterThan(result.state.trailsResults.length);
	});

	test('decimating updates changes trail length by request cadence, not camera cadence', async ({
		page,
	}, testInfo) => {
		await createHarness(page, testInfo);
		const result = await page.evaluate(async () => {
			const fastHarness = await (window as any).__shaderpadBrowserHarness.createFingerPensHarness();
			await fastHarness.runScenario({ outputFrames: 16, trailEvery: 1, videoEvery: 100 });
			const fast = {
				state: fastHarness.getState(),
			};
			fastHarness.destroy();

			const slowHarness = await (window as any).__shaderpadBrowserHarness.createFingerPensHarness();
			await slowHarness.runScenario({ outputFrames: 16, trailEvery: 8, videoEvery: 100 });
			const slow = {
				state: slowHarness.getState(),
			};
			slowHarness.destroy();

			return { fast, slow };
		});

		expect(dedupeConsecutive(result.fast.state.frameOffsets)).toEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
		]);
		expect(dedupeConsecutive(result.slow.state.frameOffsets)).toEqual([0, 1, 2]);
		expect(result.fast.state.detectCalls).toHaveLength(2);
		expect(result.slow.state.detectCalls).toHaveLength(2);
	});
});
