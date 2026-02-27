import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Composable for secure markdown rendering
 * Uses marked for parsing and DOMPurify for sanitization
 */
export function useMarkdownRenderer() {
  // Configure marked for GitHub Flavored Markdown
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  // Configure DOMPurify with strict settings
  const purifyConfig = {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'strong',
      'em',
      'u',
      's',
      'del',
      'ins',
      'blockquote',
      'pre',
      'code',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id', 'align'],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  }

  /**
   * Render markdown to safe HTML
   * @param markdown - Raw markdown string
   * @returns Sanitized HTML string
   */
  function renderMarkdown(markdown: string): string {
    if (!markdown) return ''

    try {
      // Parse markdown to HTML
      const rawHtml = marked.parse(markdown) as string

      // Sanitize HTML
      const cleanHtml = DOMPurify.sanitize(rawHtml, purifyConfig)

      // Add safety attributes to all links (target="_blank" and rel="noopener noreferrer")
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = cleanHtml

      const links = tempDiv.querySelectorAll('a')
      links.forEach((link) => {
        if (link.getAttribute('href')) {
          link.setAttribute('target', '_blank')
          link.setAttribute('rel', 'noopener noreferrer')
        }
      })

      return tempDiv.innerHTML
    } catch (err) {
      console.error('Error rendering markdown:', err)
      return ''
    }
  }

  return {
    renderMarkdown,
  }
}
