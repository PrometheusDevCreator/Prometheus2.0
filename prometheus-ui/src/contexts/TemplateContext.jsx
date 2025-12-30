/**
 * TemplateContext.jsx - Authoritative State for FORMAT Page
 *
 * FORMAT Page - Template Mapping Engine
 *
 * Per CORRECTION #1: This context is AUTHORITATIVE for all template state.
 * App.jsx only wires providers and routing - it does NOT manipulate templateData.
 *
 * Provides:
 * - Template Profile management (CRUD operations)
 * - Active profile selection
 * - Output type selection (Presentation, Timetable, etc.)
 * - Mapping state and operations
 * - IndexedDB persistence
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import {
  loadAllProfiles,
  saveProfile,
  deleteProfile as deleteProfileFromDB,
  saveAsset,
  loadAsset,
  deleteAsset,
  generateId,
  createEmptyTemplateSpec,
  isIndexedDBAvailable
} from '../utils/indexedDBStorage'

// ============================================
// OUTPUT TYPES - Primary and Planned
// ============================================
export const OUTPUT_TYPES = {
  PRIMARY: [
    { id: 'presentation', label: 'PRESENTATION', fileType: '.pptx', icon: 'monitor' },
    { id: 'timetable', label: 'TIMETABLE', fileType: '.xlsx', icon: 'calendar' },
    { id: 'lesson_plan', label: 'LESSON PLAN', fileType: '.docx', icon: 'document' },
    { id: 'qa_form', label: 'QA FORM', fileType: '.docx', icon: 'checklist' }
  ],
  // CORRECTION #7: Planned outputs are DISPLAY-ONLY - no interaction in MVP
  PLANNED: [
    { id: 'learner_handbook', label: 'LEARNER HANDBOOK', status: 'PLANNED' },
    { id: 'assessments', label: 'ASSESSMENTS', status: 'PLANNED' },
    { id: 'course_info_sheet', label: 'COURSE INFO SHEET', status: 'PLANNED' },
    { id: 'user_defined', label: 'USER DEFINED', status: 'PLANNED' }
  ]
}

// ============================================
// SLIDE TYPES - For PPTX Mapping
// ============================================
export const SLIDE_TYPES = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'summary', label: 'Summary' },
  { id: 'lesson_title', label: 'Lesson Title' },
  { id: 'user_defined_1', label: 'User Defined 1' },
  { id: 'user_defined_2', label: 'User Defined 2' },
  { id: 'user_defined_3', label: 'User Defined 3' }
]

// ============================================
// CONTENT SOURCES - For Placeholder Mapping
// ============================================
export const CONTENT_SOURCES = [
  { id: 'lesson_title', label: 'Lesson Title' },
  { id: 'topic_list', label: 'Topic List' },
  { id: 'subtopic_text', label: 'Subtopic Text' },
  { id: 'lo_text', label: 'Learning Objective' },
  { id: 'instructor_notes', label: 'Instructor Notes' },
  { id: 'course_title', label: 'Course Title' },
  { id: 'module_title', label: 'Module Title' },
  { id: 'custom', label: 'Custom Text' }
]

// ============================================
// CONTEXT DEFINITION
// ============================================
const TemplateContext = createContext(null)

// ============================================
// PROVIDER COMPONENT
// ============================================
export function TemplateProvider({ children }) {
  // --------------------------------------------
  // PROFILE STATE (persisted to IndexedDB)
  // --------------------------------------------
  const [profiles, setProfiles] = useState([])
  const [activeProfileId, setActiveProfileId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // --------------------------------------------
  // UI STATE (not persisted)
  // --------------------------------------------
  const [selectedOutput, setSelectedOutput] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [showProfileManager, setShowProfileManager] = useState(false)

  // --------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------
  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || null
  }, [profiles, activeProfileId])

  // CORRECTION #6: Status computed from TemplateSpec ONLY
  const getOutputStatus = useCallback((outputType) => {
    if (!activeProfile) return 'none'

    const assetKey = outputType === 'presentation' ? 'pptx' :
                     outputType === 'timetable' ? 'xlsx' : 'docx'

    const hasAsset = activeProfile.assets?.[assetKey]
    const hasMapping = activeProfile.mapping?.[assetKey]

    if (hasMapping) return 'mapped'
    if (hasAsset) return 'loaded'
    return 'none'
  }, [activeProfile])

  // --------------------------------------------
  // LOAD PROFILES ON MOUNT
  // --------------------------------------------
  useEffect(() => {
    const loadProfiles = async () => {
      if (!isIndexedDBAvailable()) {
        setError('IndexedDB not available')
        setIsLoading(false)
        return
      }

      try {
        const loadedProfiles = await loadAllProfiles()
        setProfiles(loadedProfiles)

        // Auto-select the most recently updated profile
        if (loadedProfiles.length > 0) {
          setActiveProfileId(loadedProfiles[0].id)
        }
      } catch (err) {
        console.error('Error loading profiles:', err)
        setError('Failed to load profiles')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfiles()
  }, [])

  // --------------------------------------------
  // PROFILE CRUD OPERATIONS
  // --------------------------------------------

  /**
   * Create a new template profile
   */
  const createProfile = useCallback(async (name) => {
    try {
      const newProfile = createEmptyTemplateSpec(name)
      await saveProfile(newProfile)
      setProfiles(prev => [newProfile, ...prev])
      setActiveProfileId(newProfile.id)
      return newProfile.id
    } catch (err) {
      console.error('Error creating profile:', err)
      setError('Failed to create profile')
      return null
    }
  }, [])

  /**
   * Update an existing profile
   */
  const updateProfile = useCallback(async (id, updates) => {
    try {
      const profile = profiles.find(p => p.id === id)
      if (!profile) return false

      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await saveProfile(updatedProfile)
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p))
      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
      return false
    }
  }, [profiles])

  /**
   * Rename a profile
   */
  const renameProfile = useCallback(async (id, newName) => {
    return updateProfile(id, { name: newName })
  }, [updateProfile])

  /**
   * Duplicate a profile
   */
  const duplicateProfile = useCallback(async (id) => {
    try {
      const sourceProfile = profiles.find(p => p.id === id)
      if (!sourceProfile) return null

      const now = new Date().toISOString()
      const newProfile = {
        ...sourceProfile,
        id: generateId(),
        name: `${sourceProfile.name} (Copy)`,
        createdAt: now,
        updatedAt: now
      }

      await saveProfile(newProfile)
      setProfiles(prev => [newProfile, ...prev])
      setActiveProfileId(newProfile.id)
      return newProfile.id
    } catch (err) {
      console.error('Error duplicating profile:', err)
      setError('Failed to duplicate profile')
      return null
    }
  }, [profiles])

  /**
   * Delete a profile
   */
  const deleteProfileAction = useCallback(async (id) => {
    try {
      const profile = profiles.find(p => p.id === id)
      if (!profile) return false

      // Delete associated assets
      if (profile.assets?.pptx?.id) await deleteAsset(profile.assets.pptx.id)
      if (profile.assets?.xlsx?.id) await deleteAsset(profile.assets.xlsx.id)
      if (profile.assets?.docx?.id) await deleteAsset(profile.assets.docx.id)

      await deleteProfileFromDB(id)
      setProfiles(prev => prev.filter(p => p.id !== id))

      // Clear selection if deleted profile was active
      if (activeProfileId === id) {
        const remaining = profiles.filter(p => p.id !== id)
        setActiveProfileId(remaining.length > 0 ? remaining[0].id : null)
      }

      return true
    } catch (err) {
      console.error('Error deleting profile:', err)
      setError('Failed to delete profile')
      return false
    }
  }, [profiles, activeProfileId])

  /**
   * Set active profile (Apply button)
   */
  const applyProfile = useCallback((id) => {
    setActiveProfileId(id)
  }, [])

  // --------------------------------------------
  // ASSET OPERATIONS
  // --------------------------------------------

  /**
   * Upload a template file
   */
  const uploadTemplate = useCallback(async (outputType, file) => {
    if (!activeProfileId) return false

    try {
      setIsAnalyzing(true)
      setAnalysisProgress(0)

      // Determine asset key based on output type
      const assetKey = outputType === 'presentation' ? 'pptx' :
                       outputType === 'timetable' ? 'xlsx' : 'docx'

      // Delete old asset if exists
      const profile = profiles.find(p => p.id === activeProfileId)
      if (profile?.assets?.[assetKey]?.id) {
        await deleteAsset(profile.assets[assetKey].id)
      }

      // Save new asset
      const assetId = generateId()
      await saveAsset(assetId, file, {
        filename: file.name,
        mimeType: file.type
      })

      // Update profile with asset reference
      const assetRef = {
        id: assetId,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
      }

      // Simulate analysis progress (stub for MVP)
      for (let i = 0; i <= 100; i += 20) {
        setAnalysisProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Create stub analysis result
      const stubAnalysis = createStubAnalysis(assetKey)

      await updateProfile(activeProfileId, {
        assets: {
          ...profile?.assets,
          [assetKey]: assetRef
        },
        analysis: {
          ...profile?.analysis,
          [assetKey]: stubAnalysis
        }
      })

      setIsAnalyzing(false)
      setAnalysisProgress(0)
      return true
    } catch (err) {
      console.error('Error uploading template:', err)
      setError('Failed to upload template')
      setIsAnalyzing(false)
      setAnalysisProgress(0)
      return false
    }
  }, [activeProfileId, profiles, updateProfile])

  /**
   * Clear template and mapping for an output type
   */
  const clearTemplate = useCallback(async (outputType) => {
    if (!activeProfileId) return false

    try {
      const assetKey = outputType === 'presentation' ? 'pptx' :
                       outputType === 'timetable' ? 'xlsx' : 'docx'

      const profile = profiles.find(p => p.id === activeProfileId)

      // Delete asset if exists
      if (profile?.assets?.[assetKey]?.id) {
        await deleteAsset(profile.assets[assetKey].id)
      }

      // Clear asset, analysis, and mapping
      await updateProfile(activeProfileId, {
        assets: {
          ...profile?.assets,
          [assetKey]: null
        },
        analysis: {
          ...profile?.analysis,
          [assetKey]: null
        },
        mapping: {
          ...profile?.mapping,
          [assetKey]: null
        }
      })

      return true
    } catch (err) {
      console.error('Error clearing template:', err)
      setError('Failed to clear template')
      return false
    }
  }, [activeProfileId, profiles, updateProfile])

  // --------------------------------------------
  // MAPPING OPERATIONS
  // --------------------------------------------

  /**
   * Update PPTX mapping
   */
  const updatePPTXMapping = useCallback(async (mapping) => {
    if (!activeProfileId) return false

    const profile = profiles.find(p => p.id === activeProfileId)
    return updateProfile(activeProfileId, {
      mapping: {
        ...profile?.mapping,
        pptx: mapping
      }
    })
  }, [activeProfileId, profiles, updateProfile])

  /**
   * Update XLSX mapping (anchors only - CORRECTION #5)
   */
  const updateXLSXMapping = useCallback(async (mapping) => {
    if (!activeProfileId) return false

    const profile = profiles.find(p => p.id === activeProfileId)
    return updateProfile(activeProfileId, {
      mapping: {
        ...profile?.mapping,
        xlsx: mapping
      }
    })
  }, [activeProfileId, profiles, updateProfile])

  /**
   * Check mapping (CORRECTION #3: renamed from validateMapping)
   * Returns feedback but does NOT gate anything
   */
  const checkMapping = useCallback((outputType) => {
    if (!activeProfile) return { valid: false, issues: ['No active profile'] }

    const assetKey = outputType === 'presentation' ? 'pptx' :
                     outputType === 'timetable' ? 'xlsx' : 'docx'

    const mapping = activeProfile.mapping?.[assetKey]
    const analysis = activeProfile.analysis?.[assetKey]

    const issues = []

    if (!analysis) {
      issues.push('No template uploaded')
    }

    if (!mapping) {
      issues.push('No mapping configured')
    }

    // Output-specific checks (informational only)
    if (assetKey === 'pptx' && mapping) {
      if (!mapping.slideTypeToLayout || Object.keys(mapping.slideTypeToLayout).length === 0) {
        issues.push('No slide type to layout mappings defined')
      }
    }

    if (assetKey === 'xlsx' && mapping) {
      if (!mapping.timetableSheet) {
        issues.push('No target sheet selected')
      }
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }, [activeProfile])

  // --------------------------------------------
  // UI ACTIONS
  // --------------------------------------------
  const toggleProfileManager = useCallback(() => {
    setShowProfileManager(prev => !prev)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // --------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------
  const value = useMemo(() => ({
    // State
    profiles,
    activeProfileId,
    activeProfile,
    selectedOutput,
    isLoading,
    isAnalyzing,
    analysisProgress,
    error,
    showProfileManager,

    // Profile operations
    createProfile,
    updateProfile,
    renameProfile,
    duplicateProfile,
    deleteProfile: deleteProfileAction,
    applyProfile,

    // Asset operations
    uploadTemplate,
    clearTemplate,

    // Mapping operations
    updatePPTXMapping,
    updateXLSXMapping,
    checkMapping,

    // UI actions
    setSelectedOutput,
    toggleProfileManager,
    clearError,
    getOutputStatus,

    // Constants
    OUTPUT_TYPES,
    SLIDE_TYPES,
    CONTENT_SOURCES
  }), [
    profiles,
    activeProfileId,
    activeProfile,
    selectedOutput,
    isLoading,
    isAnalyzing,
    analysisProgress,
    error,
    showProfileManager,
    createProfile,
    updateProfile,
    renameProfile,
    duplicateProfile,
    deleteProfileAction,
    applyProfile,
    uploadTemplate,
    clearTemplate,
    updatePPTXMapping,
    updateXLSXMapping,
    checkMapping,
    toggleProfileManager,
    clearError,
    getOutputStatus
  ])

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================
export function useTemplate() {
  const context = useContext(TemplateContext)
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider')
  }
  return context
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create stub analysis data (MVP - real parsing deferred)
 */
function createStubAnalysis(assetType) {
  switch (assetType) {
    case 'pptx':
      return {
        layouts: [
          { id: 'layout-title', name: 'Title Slide', placeholderCount: 2 },
          { id: 'layout-content', name: 'Content', placeholderCount: 3 },
          { id: 'layout-two-col', name: 'Two Column', placeholderCount: 4 },
          { id: 'layout-blank', name: 'Blank', placeholderCount: 0 }
        ],
        placeholders: [
          { layoutId: 'layout-title', index: 0, type: 'title' },
          { layoutId: 'layout-title', index: 1, type: 'body' },
          { layoutId: 'layout-content', index: 0, type: 'title' },
          { layoutId: 'layout-content', index: 1, type: 'body' },
          { layoutId: 'layout-content', index: 2, type: 'footer' }
        ],
        fixedSlides: [],
        theme: { primaryColor: '#000000', fontFamily: 'Calibri' }
      }

    case 'xlsx':
      return {
        sheets: [
          { name: 'Timetable', index: 0, rowCount: 100, columnCount: 10 },
          { name: 'Summary', index: 1, rowCount: 50, columnCount: 5 }
        ],
        namedRanges: [
          { name: 'CourseTitle', reference: 'Timetable!A1' },
          { name: 'StartDate', reference: 'Timetable!B1' }
        ],
        tables: []
      }

    case 'docx':
      return {
        styles: [
          { id: 'Heading1', name: 'Heading 1', type: 'paragraph' },
          { id: 'Heading2', name: 'Heading 2', type: 'paragraph' },
          { id: 'Normal', name: 'Normal', type: 'paragraph' },
          { id: 'BodyText', name: 'Body Text', type: 'paragraph' }
        ],
        tokens: [
          { name: '{{COURSE_TITLE}}', occurrences: 1 },
          { name: '{{DATE}}', occurrences: 2 }
        ]
      }

    default:
      return null
  }
}

export default TemplateContext
