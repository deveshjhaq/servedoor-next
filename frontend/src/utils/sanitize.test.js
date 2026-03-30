import { sanitize } from './sanitize'

describe('sanitize', () => {
  describe('script tag removal', () => {
    it('should strip basic script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = sanitize(input)
      expect(result).toBe('Hello  World')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should strip script tags with attributes', () => {
      const input = '<script type="text/javascript">alert("xss")</script>'
      const result = sanitize(input)
      expect(result).toBe('')
      expect(result).not.toContain('<script>')
    })

    it('should strip multiple script tags', () => {
      const input = '<script>bad1()</script>text<script>bad2()</script>'
      const result = sanitize(input)
      expect(result).toBe('text')
      expect(result).not.toContain('<script>')
    })

    it('should strip script tags case-insensitively', () => {
      const input = '<SCRIPT>alert("xss")</SCRIPT>'
      const result = sanitize(input)
      expect(result).toBe('')
      expect(result).not.toContain('SCRIPT')
    })

    it('should strip script tags with newlines', () => {
      const input = '<script>\nalert("xss")\n</script>'
      const result = sanitize(input)
      expect(result).toBe('')
    })
  })

  describe('HTML tag removal', () => {
    it('should strip basic HTML tags', () => {
      const input = '<div>Hello</div>'
      const result = sanitize(input)
      expect(result).toBe('Hello')
      expect(result).not.toContain('<div>')
    })

    it('should strip multiple HTML tags', () => {
      const input = '<p><strong>Bold</strong> text</p>'
      const result = sanitize(input)
      expect(result).toBe('Bold text')
    })

    it('should strip self-closing tags', () => {
      const input = 'Line 1<br/>Line 2'
      const result = sanitize(input)
      expect(result).toBe('Line 1Line 2')
    })

    it('should strip tags with attributes', () => {
      const input = '<a href="http://evil.com" onclick="alert()">Link</a>'
      const result = sanitize(input)
      expect(result).toBe('Link')
      expect(result).not.toContain('href')
      expect(result).not.toContain('onclick')
    })

    it('should strip nested HTML tags', () => {
      const input = '<div><span><em>nested</em></span></div>'
      const result = sanitize(input)
      expect(result).toBe('nested')
    })
  })

  describe('javascript: URI removal', () => {
    it('should remove javascript: URIs', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitize(input)
      expect(result).toBe('alert("xss")')
      expect(result).not.toContain('javascript:')
    })

    it('should remove javascript: URIs case-insensitively', () => {
      const input = 'JavaScript:alert("xss")'
      const result = sanitize(input)
      expect(result).not.toContain('JavaScript:')
      expect(result).not.toContain('javascript:')
    })

    it('should remove multiple javascript: URIs', () => {
      const input = 'javascript:bad1() and JAVASCRIPT:bad2()'
      const result = sanitize(input)
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('JAVASCRIPT:')
    })
  })

  describe('combined attacks', () => {
    it('should handle script tags with HTML and javascript: URIs', () => {
      const input = '<script>javascript:alert("xss")</script><div>text</div>'
      const result = sanitize(input)
      expect(result).toBe('text')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('<div>')
    })

    it('should handle complex XSS attempt', () => {
      const input = '<img src="x" onerror="javascript:alert(\'XSS\')"><script>alert("xss")</script>'
      const result = sanitize(input)
      expect(result).not.toContain('<img')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('onerror')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(sanitize('')).toBe('')
    })

    it('should handle plain text without tags', () => {
      const input = 'Just plain text'
      expect(sanitize(input)).toBe('Just plain text')
    })

    it('should trim whitespace', () => {
      const input = '  text with spaces  '
      expect(sanitize(input)).toBe('text with spaces')
    })

    it('should handle non-string input', () => {
      expect(sanitize(null)).toBe(null)
      expect(sanitize(undefined)).toBe(undefined)
      expect(sanitize(123)).toBe(123)
      expect(sanitize({})).toEqual({})
    })

    it('should preserve safe special characters', () => {
      const input = 'Price: $10.99 & free shipping!'
      expect(sanitize(input)).toBe('Price: $10.99 & free shipping!')
    })

    it('should handle strings with only tags', () => {
      const input = '<div></div>'
      expect(sanitize(input)).toBe('')
    })
  })

  describe('real-world scenarios', () => {
    it('should sanitize user name input', () => {
      const input = '<script>alert("xss")</script>John Doe'
      const result = sanitize(input)
      expect(result).toBe('John Doe')
    })

    it('should sanitize address input', () => {
      const input = '123 Main St<script>bad()</script>, Apt 4B'
      const result = sanitize(input)
      expect(result).toBe('123 Main St, Apt 4B')
    })

    it('should sanitize restaurant review', () => {
      const input = 'Great food! <a href="javascript:alert()">Click here</a>'
      const result = sanitize(input)
      expect(result).toBe('Great food! Click here')
    })
  })
})
