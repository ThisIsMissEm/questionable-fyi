import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    abbr: {
      setAbbr: (attrs: { title: string }) => ReturnType
      toggleAbbr: (attrs: { title: string }) => ReturnType
      unsetAbbr: () => ReturnType
    }
  }
}

export const Abbr = Mark.create({
  name: 'abbr',

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (el) => el.getAttribute('title'),
        renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'abbr[title]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['abbr', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setAbbr:
        (attrs) =>
        ({ commands }) =>
          commands.setMark(this.name, attrs),
      toggleAbbr:
        (attrs) =>
        ({ commands }) =>
          commands.toggleMark(this.name, attrs),
      unsetAbbr:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
