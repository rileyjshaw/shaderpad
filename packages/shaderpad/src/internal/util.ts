import { errorUrl, type ErrorCode } from './error-codes.gen.js';
import { DEV_ERRORS } from './error-codes.dev.gen.js';

type DevContext = Record<string, unknown> | false | undefined;
type ShaderPadError = Error & { code: ErrorCode };

function withCode(message: string, code: ErrorCode): ShaderPadError {
	const error = new Error(message) as ShaderPadError;
	error.code = code;
	return error;
}

function renderContext(context: Record<string, unknown>) {
	const lines = ['Context:'];

	for (const [key, value] of Object.entries(context)) {
		if (value === undefined) continue;

		const rendered =
			typeof value === 'string'
				? value
				: (JSON.stringify(value, null, 2) ??
					(typeof value === 'bigint' ||
					typeof value === 'number' ||
					typeof value === 'boolean' ||
					value == null
						? String(value)
						: ''));

		if (!rendered) continue;
		lines.push(rendered.includes('\n') ? `${key}:\n${rendered}` : `${key}: ${rendered}`);
	}

	return lines.length > 1 ? lines.join('\n') : '';
}

function renderDevMessage(code: ErrorCode, context?: DevContext) {
	const error = DEV_ERRORS?.[code];
	const parts = error
		? [`[ShaderPad ${code}] ${error.title}`, error.summary, `Docs: ${errorUrl(code)}`]
		: [`[ShaderPad ${code}] ${errorUrl(code)}`];

	if (context) {
		const renderedContext = renderContext(context);
		if (renderedContext) parts.push(renderedContext);
	}

	return parts.join('\n\n');
}

export function spError(code: ErrorCode, context?: DevContext) {
	return withCode(__SHADERPAD_DEV__ ? renderDevMessage(code, context) : `ShaderPad error: ${errorUrl(code)}`, code);
}

export function safeMod(i: number, m: number): number {
	return ((i % m) + m) % m;
}
