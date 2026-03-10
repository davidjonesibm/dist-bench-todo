import { ref, computed } from 'vue'
import { apiFetch } from '../lib/api'
import { usePageRefetch } from './use-page-refetch'
import type {
  Tag,
  CreateTagData,
  UpdateTagData,
  TagOperationResult,
  TagsListResult,
} from '../types/tag.types'

export function useTags() {
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all tags for the current user
   */
  async function fetchTags(): Promise<TagsListResult> {
    loading.value = true
    error.value = null

    try {
      const records = await apiFetch<Tag[]>('/api/tags')
      tags.value = records
      return { success: true, data: records }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch tags'
      error.value = errorMessage
      console.error('Error fetching tags:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new tag
   */
  async function createTag(name: string, color: string): Promise<TagOperationResult> {
    loading.value = true
    error.value = null

    try {
      const record = await apiFetch<Tag>('/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      })

      tags.value.push(record)
      // Re-sort tags alphabetically
      tags.value.sort((a, b) => a.name.localeCompare(b.name))

      return { success: true, data: record }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create tag'
      error.value = errorMessage
      console.error('Error creating tag:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing tag
   */
  async function updateTag(id: string, data: UpdateTagData): Promise<TagOperationResult> {
    loading.value = true
    error.value = null

    try {
      const record = await apiFetch<Tag>(`/api/tags/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })

      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value[index] = record
        // Re-sort tags alphabetically
        tags.value.sort((a, b) => a.name.localeCompare(b.name))
      }

      return { success: true, data: record }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update tag'
      error.value = errorMessage
      console.error('Error updating tag:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a tag
   */
  async function deleteTag(id: string): Promise<TagOperationResult> {
    loading.value = true
    error.value = null

    try {
      await apiFetch<void>(`/api/tags/${id}`, { method: 'DELETE' })

      tags.value = tags.value.filter((t) => t.id !== id)
      return { success: true }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete tag'
      error.value = errorMessage
      console.error('Error deleting tag:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get tag by ID
   */
  const getTagById = computed(() => (id: string): Tag | undefined => {
    return tags.value.find((t) => t.id === id)
  })

  usePageRefetch(fetchTags)

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
  }
}
