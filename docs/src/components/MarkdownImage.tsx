const basePath = '/shaderpad'

export function MarkdownImage(
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
  let src =
    typeof props.src === 'string' &&
    props.src.startsWith('/') &&
    !props.src.startsWith('//')
      ? `${basePath}${props.src}`
      : props.src

  return <img {...props} src={src} />
}
