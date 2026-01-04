declare module '*.glsl' {
	const value: string;
	export default value;
}

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: 'development' | 'production' | 'test';
	}
}

declare var process: {
	env: NodeJS.ProcessEnv;
} | undefined;
