/**
 * indexedDBStorage.js - IndexedDB Persistence Layer for Template Profiles
 *
 * FORMAT Page - Template Mapping Engine
 *
 * Provides:
 * - Template Profile storage (TemplateSpec objects)
 * - Binary asset storage (PPTX, XLSX, DOCX files)
 * - CRUD operations with Promise-based API
 *
 * Database: prometheus-templates
 * Stores: profiles, assets
 */

const DB_NAME = 'prometheus-templates'
const DB_VERSION = 1

const STORES = {
  PROFILES: 'profiles',
  ASSETS: 'assets'
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

let dbInstance = null

/**
 * Open the IndexedDB database
 * Creates object stores on first run or version upgrade
 */
export async function openDatabase() {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create profiles store if it doesn't exist
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' })
        profileStore.createIndex('name', 'name', { unique: false })
        profileStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Create assets store if it doesn't exist
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        db.createObjectStore(STORES.ASSETS, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

// ============================================
// PROFILE OPERATIONS
// ============================================

/**
 * Save a template profile
 * @param {TemplateSpec} profile - The profile to save
 * @returns {Promise<void>}
 */
export async function saveProfile(profile) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROFILES], 'readwrite')
    const store = transaction.objectStore(STORES.PROFILES)

    // Update timestamp
    const profileToSave = {
      ...profile,
      updatedAt: new Date().toISOString()
    }

    const request = store.put(profileToSave)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Error saving profile:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Load a single profile by ID
 * @param {string} id - Profile ID
 * @returns {Promise<TemplateSpec|null>}
 */
export async function loadProfile(id) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROFILES], 'readonly')
    const store = transaction.objectStore(STORES.PROFILES)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => {
      console.error('Error loading profile:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Load all template profiles
 * @returns {Promise<TemplateSpec[]>}
 */
export async function loadAllProfiles() {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROFILES], 'readonly')
    const store = transaction.objectStore(STORES.PROFILES)
    const request = store.getAll()

    request.onsuccess = () => {
      const profiles = request.result || []
      // Sort by updatedAt descending (most recent first)
      profiles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      resolve(profiles)
    }
    request.onerror = () => {
      console.error('Error loading profiles:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Delete a template profile
 * @param {string} id - Profile ID to delete
 * @returns {Promise<void>}
 */
export async function deleteProfile(id) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROFILES], 'readwrite')
    const store = transaction.objectStore(STORES.PROFILES)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Error deleting profile:', request.error)
      reject(request.error)
    }
  })
}

// ============================================
// ASSET OPERATIONS
// ============================================

/**
 * Save a binary asset (template file)
 * @param {string} id - Asset ID
 * @param {Blob} blob - File blob
 * @param {object} metadata - Additional metadata (filename, mimeType, etc.)
 * @returns {Promise<void>}
 */
export async function saveAsset(id, blob, metadata = {}) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readwrite')
    const store = transaction.objectStore(STORES.ASSETS)

    const asset = {
      id,
      blob,
      filename: metadata.filename || 'unknown',
      mimeType: metadata.mimeType || 'application/octet-stream',
      size: blob.size,
      uploadedAt: new Date().toISOString()
    }

    const request = store.put(asset)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Error saving asset:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Load a binary asset
 * @param {string} id - Asset ID
 * @returns {Promise<{blob: Blob, metadata: object}|null>}
 */
export async function loadAsset(id) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readonly')
    const store = transaction.objectStore(STORES.ASSETS)
    const request = store.get(id)

    request.onsuccess = () => {
      const result = request.result
      if (result) {
        resolve({
          blob: result.blob,
          metadata: {
            filename: result.filename,
            mimeType: result.mimeType,
            size: result.size,
            uploadedAt: result.uploadedAt
          }
        })
      } else {
        resolve(null)
      }
    }
    request.onerror = () => {
      console.error('Error loading asset:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Delete a binary asset
 * @param {string} id - Asset ID to delete
 * @returns {Promise<void>}
 */
export async function deleteAsset(id) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readwrite')
    const store = transaction.objectStore(STORES.ASSETS)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('Error deleting asset:', request.error)
      reject(request.error)
    }
  })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique ID for profiles or assets
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new empty TemplateSpec
 * @param {string} name - Profile name
 * @returns {TemplateSpec}
 */
export function createEmptyTemplateSpec(name) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name: name || 'New Template Profile',
    createdAt: now,
    updatedAt: now,
    assets: {
      pptx: null,
      xlsx: null,
      docx: null
    },
    analysis: {
      pptx: null,
      xlsx: null,
      docx: null
    },
    mapping: {
      pptx: null,
      xlsx: null,
      docx: null
    }
  }
}

/**
 * Check if IndexedDB is available
 * @returns {boolean}
 */
export function isIndexedDBAvailable() {
  return typeof indexedDB !== 'undefined'
}

/**
 * Clear all data (for testing/reset)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROFILES, STORES.ASSETS], 'readwrite')

    transaction.objectStore(STORES.PROFILES).clear()
    transaction.objectStore(STORES.ASSETS).clear()

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => {
      console.error('Error clearing data:', transaction.error)
      reject(transaction.error)
    }
  })
}
