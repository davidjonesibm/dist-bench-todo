import { ref, onUnmounted, computed } from 'vue'
import { pb } from '../lib/pocketbase'
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

  let unsubscribe: (() => void) | null = null

  /**
   * Fetch all tags for the current user
   */
  async function fetchTags(): Promise<TagsListResult> {
    loading.value = true
    error.value = null

    try {
      const records = await pb.collection('tags').getFullList<Tag>({
        sort: 'name',
        filter: `userId = "${pb.authStore.model?.id}"`,
      })

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
      const record = await pb.collection('tags').create<Tag>({
        name,
        color,
        userId: pb.authStore.model?.id,
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
      const record = await pb.collection('tags').update<Tag>(id, data)

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
      await pb.collection('tags').delete(id)

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

  /**
   * Subscribe to real-time tag updates
   */
  async function subscribeToTags() {
    if (!pb.authStore.model?.id) {
      console.warn('Cannot subscribe to tags: user not authenticated')
      return
    }

    unsubscribe = await pb.collection('tags').subscribe<Tag>('*', (e) => {
      // Only process tags for the current user
      if (e.record?.userId !== pb.authStore.model?.id) {
        return
      }

      if (e.action === 'create') {
        const exists = tags.value.some((tag) => tag.id === e.record.id)
        if (!exists) {
          tags.value.push(e.record)
          tags.value.sort((a, b) => a.name.localeCompare(b.name))
        }
      } else if (e.action === 'update') {
        const index = tags.value.findIndex((tag) => tag.id === e.record.id)
        if (index !== -1) {
          tags.value[index] = e.record
          tags.value.sort((a, b) => a.name.localeCompare(b.name))
        }
      } else if (e.action === 'delete') {
        tags.value = tags.value.filter((tag) => tag.id !== e.record.id)
      }
    })
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribeFromTags() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribeFromTags()
  })

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    subscribeToTags,
    unsubscribeFromTags,
  }
}
