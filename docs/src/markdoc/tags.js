import { BuiltInInputsPreview } from '@/components/BuiltInInputsPreview'
import { Callout } from '@/components/Callout'
import { MarkdownImage } from '@/components/MarkdownImage'
import { QuickstartPreview } from '@/components/QuickstartPreview'
import { QuickLink, QuickLinks } from '@/components/QuickLinks'
import { ShaderPadSizeInline } from '@/components/ShaderPadSize'

const tags = {
  callout: {
    attributes: {
      title: { type: String },
      type: {
        type: String,
        default: 'note',
        matches: ['note', 'warning'],
        errorLevel: 'critical',
      },
    },
    render: Callout,
  },
  figure: {
    selfClosing: true,
    attributes: {
      src: { type: String },
      alt: { type: String },
      caption: { type: String },
    },
    render: ({ src, alt = '', caption }) => (
      <figure>
        <MarkdownImage src={src} alt={alt} />
        <figcaption>{caption}</figcaption>
      </figure>
    ),
  },
  'quick-links': {
    render: QuickLinks,
  },
  'quick-link': {
    selfClosing: true,
    render: QuickLink,
    attributes: {
      title: { type: String },
      description: { type: String },
      icon: { type: String },
      href: { type: String },
    },
  },
  'built-in-inputs-preview': {
    selfClosing: true,
    render: BuiltInInputsPreview,
  },
  'quickstart-preview': {
    selfClosing: true,
    render: QuickstartPreview,
  },
  'shaderpad-size': {
    selfClosing: true,
    render: ShaderPadSizeInline,
  },
}

export default tags
