// @ts-check

/**
 * @typedef {object} ErrorRegistryEntry
 * @property {number} code
 * @property {string} title
 * @property {string} summary
 * @property {ReadonlyArray<string>} causes
 * @property {ReadonlyArray<string>} fixes
 */

export const ERROR_DOCS_BASE_URL = 'https://mry.ac/s/';

/** @type {ReadonlyArray<ErrorRegistryEntry>} */
export const errors = [
	{
		code: 0,
		title: 'WebGL2 Context Unavailable',
		summary: 'ShaderPad could not create a WebGL2 rendering context.',
		causes: [
			'The browser or environment does not support WebGL2.',
			'GPU acceleration is disabled or unavailable.',
			'The requested canvas could not provide a WebGL2 context.',
		],
		fixes: [
			'Run ShaderPad in a browser or environment with WebGL2 support.',
			'Enable hardware acceleration if it is currently disabled.',
			'Verify that the canvas is valid and not blocked by host-environment restrictions.',
		],
	},
	{
		code: 1,
		title: 'Program Allocation Failed',
		summary: 'ShaderPad could not allocate a WebGL program object.',
		causes: [
			'The WebGL context is in an invalid or lost state.',
			'The browser rejected the allocation because of resource pressure.',
		],
		fixes: [
			'Reload the page or recreate the ShaderPad instance after the WebGL context is restored.',
			'Reduce GPU memory pressure and retry the initialization.',
		],
	},
	{
		code: 2,
		title: 'Program Link Failed',
		summary: 'ShaderPad compiled the shaders but failed to link them into a WebGL program.',
		causes: [
			'The vertex and fragment shaders disagree on interface inputs or outputs.',
			'Injected GLSL or precision qualifiers made the final shader program incompatible.',
			'The driver rejected the linked program because of GLSL validation errors.',
		],
		fixes: [
			'In development, read the WebGL link log shown in the error details, then compare the vertex outputs with the fragment inputs.',
			'Check any recent shader or plugin changes that may have changed a varying, precision qualifier, or injected GLSL block.',
			'Make sure both shader stages agree on every shared name, type, and precision.',
		],
	},
	{
		code: 3,
		title: 'Unknown GL Constant',
		summary: 'ShaderPad received a WebGL constant name it does not recognize.',
		causes: [
			'An invalid texture or format option string was provided.',
			'ShaderPad or a plugin asked WebGL for a constant name that is not valid in this environment.',
		],
		fixes: [
			'Check the option name against the documented ShaderPad texture option values.',
			'If this came from your own code or plugin code, check for typos and make sure the value is supported by WebGL2.',
		],
	},
	{
		code: 4,
		title: 'Shader Compilation Failed',
		summary: 'A vertex or fragment shader failed to compile.',
		causes: [
			'The GLSL source contains a syntax or type error.',
			'Plugin-injected GLSL changed the final shader source unexpectedly.',
			'The shader uses a WebGL2 feature that is unsupported by the current driver or environment.',
		],
		fixes: [
			'In development, read the shader compiler log and shader source included in the error details to find the failing line.',
			'Temporarily remove recent shader or plugin changes to isolate the failing section.',
			'Verify that the shader follows WebGL2 GLSL ES 3.00 syntax and type rules.',
		],
	},
	{
		code: 5,
		title: 'Texture Units Exhausted',
		summary: 'ShaderPad tried to reserve more texture units than this device exposes.',
		causes: [
			'Too many textures or texture histories were initialized on the same WebGL context.',
			'Multiple ShaderPad instances on the same canvas exhausted the shared unit pool.',
		],
		fixes: [
			'Reduce the number of simultaneously bound textures or history buffers.',
			'Destroy unused ShaderPad instances so their texture units can be reclaimed.',
			'Split work across fewer textures or fewer passes when possible.',
		],
	},
	{
		code: 6,
		title: 'Float Color Buffer Extension Missing',
		summary: 'ShaderPad requested a float render texture, but EXT_color_buffer_float is unavailable.',
		causes: [
			'The current browser or device does not expose EXT_color_buffer_float.',
			'The selected internal format requires float render support that the context cannot enable.',
		],
		fixes: [
			'Use a non-float render target format such as RGBA8 when float precision is not required.',
			'Run on hardware and a browser combination that exposes EXT_color_buffer_float.',
		],
	},
	{
		code: 7,
		title: 'Uniform Already Initialized',
		summary: 'ShaderPad was asked to register a uniform name that was already registered.',
		causes: [
			'initializeUniform() was called twice for the same uniform name.',
			'A plugin and app code attempted to initialize the same uniform.',
		],
		fixes: [
			'Initialize each uniform name only once per ShaderPad instance.',
			'If multiple writers are involved, centralize the initialization site and only call updateUniforms() afterward.',
		],
	},
	{
		code: 8,
		title: 'Invalid Uniform Type',
		summary: 'ShaderPad received an unsupported uniform type string.',
		causes: [
			'The type argument passed to initializeUniform() is not one of the supported ShaderPad values.',
			'The caller intended a supported type but passed a misspelled string.',
		],
		fixes: [
			'Use one of the supported uniform types: float, int, or uint.',
			'Correct the type string passed to initializeUniform().',
		],
	},
	{
		code: 9,
		title: 'Uniform Array Length Mismatch',
		summary: 'ShaderPad was asked to initialize a uniform array with the wrong number of elements.',
		causes: [
			'The provided array length does not match the declared arrayLength option.',
			'The caller passed a scalar or differently sized array than the initialization contract requires.',
		],
		fixes: [
			'Pass exactly arrayLength values when initializing a uniform array.',
			'Update the arrayLength option if the intended shader contract changed.',
		],
	},
	{
		code: 10,
		title: 'Uniform Array Update Expected An Array',
		summary: 'ShaderPad attempted to update a uniform array, but the provided value was not an array.',
		causes: [
			'updateUniforms() received a scalar or vector for a uniform that was initialized as an array.',
			'The caller mixed scalar and array update paths for the same uniform name.',
		],
		fixes: [
			'Pass an array of values when updating a uniform that was initialized with arrayLength.',
			'Keep the update payload shape consistent with the original uniform initialization.',
		],
	},
	{
		code: 11,
		title: 'Uniform Array Update Too Large',
		summary: 'ShaderPad received more uniform array elements than the initialized array can hold.',
		causes: [
			'The update payload contains more items than the uniform arrayLength.',
			'The caller is trying to write a larger slice than the shader declares.',
		],
		fixes: [
			'Trim the update payload so it does not exceed the initialized array length.',
			'Increase the shader-side array size and the ShaderPad initialization if more elements are needed.',
		],
	},
	{
		code: 12,
		title: 'Uniform Array Element Size Mismatch',
		summary: 'At least one uniform array element has the wrong scalar or vector length.',
		causes: [
			'One or more array items do not match the initialized vector width.',
			'The update payload mixes scalar and vector shapes within the same uniform array.',
		],
		fixes: [
			'Ensure every updated element has the same component count as the initialized uniform.',
			'Normalize the update payload before calling updateUniforms().',
		],
	},
	{
		code: 13,
		title: 'Uniform Array Start Index Invalid',
		summary: 'ShaderPad could not find the requested starting index for a uniform array.',
		causes: [
			'updateUniforms() received an invalid startIndex for the target array uniform.',
			'That array element is not available in the compiled program, often because the shader never uses it.',
		],
		fixes: [
			'Check that startIndex points at a valid element within the initialized uniform array.',
			'Make sure the shader actually reads the array elements you plan to update. Unused elements can be removed by the compiler.',
		],
	},
	{
		code: 14,
		title: 'Uniform Value Length Invalid',
		summary: 'ShaderPad received a scalar or vector uniform update with the wrong component count.',
		causes: [
			'The update payload length does not match the initialized uniform length.',
			'The caller is updating a scalar, vec2, vec3, or vec4 uniform with the wrong number of values.',
		],
		fixes: [
			'Pass exactly the number of values that the uniform was initialized with.',
			'If the shader contract changed, update the original initializeUniform() call accordingly.',
		],
	},
	{
		code: 15,
		title: 'Texture Allocation Failed',
		summary: 'ShaderPad could not create a WebGL texture object.',
		causes: [
			'The WebGL context is lost or out of resources.',
			'Texture allocation failed because of GPU memory pressure.',
		],
		fixes: [
			'Reduce texture count or texture dimensions and retry.',
			'Reload the page or recreate the ShaderPad instance after the WebGL context is restored.',
		],
	},
	{
		code: 16,
		title: 'Texture Already Initialized',
		summary: 'ShaderPad was asked to initialize a texture name that is already registered.',
		causes: [
			'initializeTexture() was called more than once for the same name.',
			'A plugin and app code attempted to initialize the same texture name.',
		],
		fixes: [
			'Initialize each texture name only once per ShaderPad instance.',
			'Switch to updateTextures() after the initial texture registration.',
		],
	},
	{
		code: 17,
		title: 'Texture Source Dimensions Invalid',
		summary: 'ShaderPad could not determine valid width and height values for the texture source.',
		causes: [
			'The source image, video, canvas, or custom texture has zero or missing dimensions.',
			'The source was used before it finished loading or before dimensions became available.',
		],
		fixes: [
			'Wait until the source has valid dimensions before calling initializeTexture().',
			'For custom textures, pass explicit non-zero width and height values.',
		],
	},
	{
		code: 18,
		title: 'Texture Not Initialized',
		summary: 'ShaderPad was asked to update a texture name that has not been initialized.',
		causes: [
			'updateTextures() was called before initializeTexture() for this name.',
			'The texture name passed to updateTextures() does not match the initialized name.',
		],
		fixes: [
			'Initialize the texture once before updating it.',
			'Check the texture name for typos and keep it aligned with the GLSL sampler name.',
		],
	},
	{
		code: 19,
		title: 'Uniform Missing During Initialization',
		summary: 'ShaderPad could not initialize a uniform because the shader program does not contain that symbol.',
		causes: [
			'The JavaScript uniform name does not match the GLSL symbol.',
			'The shader never reads that uniform, so the compiler removed it.',
			'A built-in or plugin-provided uniform was optional, but it was treated like a required one.',
		],
		fixes: [
			'Confirm that the GLSL name exactly matches the JavaScript name.',
			'Make sure the shader actually reads the uniform if you expect it to exist at runtime.',
			'If the uniform is intentionally optional, pass { allowMissing: true }.',
		],
	},
	{
		code: 20,
		title: 'Uniform Missing During Update',
		summary: 'ShaderPad could not update a uniform because the shader program does not contain that symbol.',
		causes: [
			'The uniform was never initialized because the shader does not contain it.',
			'The shader never reads that uniform, or the name passed to updateUniforms() is wrong.',
			'A built-in or plugin-provided uniform was optional, but it was treated like a required one.',
		],
		fixes: [
			'Check the uniform name and make sure the shader actually reads it.',
			'Use the same name consistently in initializeUniform() and updateUniforms().',
			'If the uniform is intentionally optional, pass { allowMissing: true }.',
		],
	},
	{
		code: 60,
		title: 'Face Mask Renderer Context Unavailable',
		summary: 'The face plugin could not create the offscreen WebGL2 context used for face-mask rendering.',
		causes: [
			'The environment cannot provide a WebGL2 context for the face mask canvas.',
			'GPU acceleration is disabled or unavailable for the offscreen renderer.',
		],
		fixes: [
			'Run the face plugin in an environment with WebGL2 support and hardware acceleration.',
			'Try a different browser/device if offscreen WebGL2 contexts are unavailable.',
		],
	},
	{
		code: 61,
		title: 'Face Mask Shader Setup Failed',
		summary: 'The face plugin could not build the shaders it uses for face-mask rendering.',
		causes: [
			'The browser or GPU driver rejected part of the face mask shader pipeline while creating, compiling, or linking it.',
			'The offscreen face mask renderer could not allocate the shader or program objects it needs.',
		],
		fixes: [
			'In development, read the programName and WebGL logs in the error details to see which shader program failed.',
			'Try a different browser or device if this environment rejects the face mask shader pipeline.',
			'If you changed the face plugin internals, verify the face mask shader sources still compile and link as a pair.',
		],
	},
	{
		code: 62,
		title: 'Face Mask Renderer Initialization Failed',
		summary: 'The face plugin could not finish setting up its internal face-mask renderer.',
		causes: [
			'The renderer could not allocate one of its internal WebGL resources, such as a buffer, texture, or framebuffer.',
			'A required attribute or uniform was missing from the renderer program.',
			'The current browser or GPU driver rejected the renderer framebuffer configuration.',
		],
		fixes: [
			'Reload the page or recreate the ShaderPad instance that uses the face plugin after the WebGL context is restored.',
			'Try a different browser or device if this environment rejects the face mask renderer setup.',
			'If you are modifying ShaderPad internals, inspect initMaskRenderer() and the dev error details to see which setup step failed.',
		],
	},
];
