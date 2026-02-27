import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Enable auto cancellation to prevent stale requests
pb.autoCancellation(false)

export { pb }
