import {
  shaderpadStandardImportGzip,
  shaderpadStandardImportGzipLabel,
} from '@/generated/shaderpad-size'

export function ShaderPadSizeBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium  text-sky-100">
      <span className="text-sky-300">Core library</span>
      <span>{shaderpadStandardImportGzipLabel}</span>
    </div>
  )
}

export function ShaderPadSizeInline() {
  return <>{shaderpadStandardImportGzip}</>
}
