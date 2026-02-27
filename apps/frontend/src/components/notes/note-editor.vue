<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'
import type { Note } from '../../types/note.types'

interface Props {
  note: Note | null
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorElement = ref<HTMLTextAreaElement | null>(null)
let editorInstance: EasyMDE | null = null

onMounted(() => {
  if (editorElement.value) {
    initializeEditor()
  }
})

onBeforeUnmount(() => {
  destroyEditor()
})

watch(
  () => props.note?.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      // Note changed, update editor content
      if (editorInstance) {
        editorInstance.value(props.modelValue || '')
      }
    }
  },
)

watch(
  () => props.modelValue,
  (newValue) => {
    // Update editor if value changed externally
    if (editorInstance && editorInstance.value() !== newValue) {
      editorInstance.value(newValue || '')
    }
  },
)

function initializeEditor() {
  if (!editorElement.value) return

  editorInstance = new EasyMDE({
    element: editorElement.value,
    initialValue: props.modelValue || '',
    spellChecker: false,
    autofocus: false,
    placeholder: 'Start writing your note in markdown...',
    status: ['lines', 'words', 'cursor'],
    toolbar: [
      'bold',
      'italic',
      'strikethrough',
      '|',
      'heading-1',
      'heading-2',
      'heading-3',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      'code',
      'table',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ],
    renderingConfig: {
      codeSyntaxHighlighting: true,
    },
  })

  // Handle content changes
  editorInstance.codemirror.on('change', () => {
    const value = editorInstance?.value() || ''
    emit('update:modelValue', value)
    emit('change', value)
  })
}

function destroyEditor() {
  if (editorInstance) {
    editorInstance.toTextArea()
    editorInstance = null
  }
}

function getValue(): string {
  return editorInstance?.value() || ''
}

function setValue(value: string) {
  if (editorInstance) {
    editorInstance.value(value)
  }
}

defineExpose({
  getValue,
  setValue,
})
</script>

<template>
  <div class="note-editor">
    <textarea ref="editorElement"></textarea>
  </div>
</template>

<style scoped>
.note-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.note-editor :deep(.EasyMDEContainer) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-editor :deep(.CodeMirror) {
  flex: 1;
  height: auto;
  border: 1px solid hsl(var(--bc) / 0.2);
  border-radius: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}

.note-editor :deep(.editor-toolbar) {
  border: 1px solid hsl(var(--bc) / 0.2);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  background: hsl(var(--b2));
}

.note-editor :deep(.editor-toolbar button) {
  color: hsl(var(--bc));
}

.note-editor :deep(.editor-toolbar button:hover),
.note-editor :deep(.editor-toolbar button.active) {
  background: hsl(var(--b3));
  border-color: hsl(var(--bc) / 0.2);
}

.note-editor :deep(.editor-toolbar i.separator) {
  border-left: 1px solid hsl(var(--bc) / 0.2);
  border-right: 1px solid hsl(var(--bc) / 0.1);
}

.note-editor :deep(.CodeMirror-cursor) {
  border-left-color: hsl(var(--bc));
}

.note-editor :deep(.editor-preview),
.note-editor :deep(.editor-preview-side) {
  background: hsl(var(--b1));
  color: hsl(var(--bc));
}

.note-editor :deep(.editor-statusbar) {
  color: hsl(var(--bc) / 0.6);
  border-top: 1px solid hsl(var(--bc) / 0.2);
  background: hsl(var(--b2));
}
</style>
