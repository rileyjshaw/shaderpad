import { withBasePath } from '@/lib/site';

export function MarkdownImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
	let src =
		typeof props.src === 'string' && props.src.startsWith('/') && !props.src.startsWith('//')
			? withBasePath(props.src)
			: props.src;

	return <img {...props} src={src} />;
}
