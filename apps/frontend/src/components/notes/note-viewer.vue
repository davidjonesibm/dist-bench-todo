<script setup lang="ts">
import { computed } from 'vue'
import { useMarkdownRenderer } from '../../composables/use-markdown-renderer'

interface Props {
  content: string
}

const props = defineProps<Props>()

const { renderMarkdown } = useMarkdownRenderer()

const renderedHtml = computed(() => {
  return renderMarkdown(props.content)
})
</script>

<template>
  <div class="note-viewer prose max-w-none p-6 overflow-y-auto">
    <div v-if="content" v-html="renderedHtml"></div>
    <div v-else class="text-base-content/40 italic">
      No content to display. Switch to edit mode to start writing.
    </div>
  </div>
</template>

<style scoped>
.note-viewer {
  background: hsl(var(--b1));
  color: hsl(var(--bc));
}

/* Tailwind Typography overrides for DaisyUI */
.note-viewer :deep(.prose) {
  --tw-prose-body: hsl(var(--bc));
  --tw-prose-headings: hsl(var(--bc));
  --tw-prose-links: hsl(var(--p));
  --tw-prose-bold: hsl(var(--bc));
  --tw-prose-code: hsl(var(--bc));
  --tw-prose-pre-bg: hsl(var(--b2));
  --tw-prose-pre-code: hsl(var(--bc));
  --tw-prose-quotes: hsl(var(--bc) / 0.8);
  --tw-prose-quote-borders: hsl(var(--bc) / 0.2);
  --tw-prose-hr: hsl(var(--bc) / 0.2);
}

.note-viewer :deep(a) {
  color: hsl(var(--p));
  text-decoration: underline;
}

.note-viewer :deep(a:hover) {
  color: hsl(var(--pf));
}

.note-viewer :deep(code) {
  background: hsl(var(--b2));
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.note-viewer :deep(pre) {
  background: hsl(var(--b2));
  border: 1px solid hsl(var(--bc) / 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}

.note-viewer :deep(pre code) {
  background: transparent;
  padding: 0;
}

.note-viewer :deep(blockquote) {
  border-left: 4px solid hsl(var(--bc) / 0.2);
  padding-left: 1rem;
  font-style: italic;
  color: hsl(var(--bc) / 0.8);
}

.note-viewer :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.note-viewer :deep(th),
.note-viewer :deep(td) {
  border: 1px solid hsl(var(--bc) / 0.2);
  padding: 0.5rem;
}

.note-viewer :deep(th) {
  background: hsl(var(--b2));
  font-weight: bold;
}

.note-viewer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>
