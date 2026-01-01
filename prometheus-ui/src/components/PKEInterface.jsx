/**
 * PKEInterface - PKE Interaction Window Component
 *
 * B5: 100% size increase from previous dimensions
 * - Previous: 454px × 38px
 * - New: 908px × 76px
 *
 * B11: Glow effect on activation:
 * - 3px burnt orange (#FF6600) glow/shadow around border
 * - Subtle pulse animation (~3s cycle) when active
 *
 * Activation/Deactivation:
 * - Click inside PKE window to activate
 * - Click outside PKE window to deactivate
 */

import { useRef, useEffect, useCallback } from 'react'

function PKEInterface({
  isActive = false,
  onToggle, // Handler to toggle active state
  onClose,
  // Delete workflow props
  deleteLoNumber = null, // LO number being deleted (1-indexed)
  deleteStep = null, // 'confirm' | 'keep-confirm' | 'delete-confirm'
  onKeep = null, // Handler for KEEP selection
  onDelete = null, // Handler for DELETE selection
  onCancel = null // Handler for cancel (click away)
}) {
  const containerRef = useRef(null)

  // Handle click inside to activate
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (!isActive) {
      onToggle?.(true)
    }
  }, [isActive, onToggle])

  // Handle click outside to deactivate
  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onToggle?.(false)
        onCancel?.()
      }
    }

    // Add listener with slight delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isActive, onToggle, onCancel])
  // A7: New gradient style - lightest at center, darker toward ends
  const defaultGradient = 'linear-gradient(to right, #3b3838, #767171 25%, #ffffff 50%, #767171 75%, #3b3838)'

  // Render delete workflow content
  const renderDeleteContent = () => {
    if (deleteStep === 'confirm') {
      return (
        <div className="flex items-center" style={{ gap: '1.48vh', padding: '0 1.48vh' }}>
          <span className="font-prometheus tracking-wide" style={{ color: '#ff3333', fontSize: '1.3vh' }}>
            THIS WILL DELETE LO {deleteLoNumber}
          </span>
          <div className="flex" style={{ gap: '1.11vh' }}>
            <button
              onClick={onKeep}
              className="font-prometheus tracking-wider bg-transparent rounded-full hover:bg-[#00ff00] hover:text-[#0d0d0d] transition-all"
              style={{
                padding: '0.37vh 1.48vh',
                fontSize: '1.11vh',
                border: '0.09vh solid #00ff00',
                color: '#00ff00'
              }}
            >
              KEEP
            </button>
            <button
              onClick={onDelete}
              className="font-prometheus tracking-wider bg-transparent rounded-full hover:bg-[#ff3333] hover:text-[#0d0d0d] transition-all"
              style={{
                padding: '0.37vh 1.48vh',
                fontSize: '1.11vh',
                border: '0.09vh solid #ff3333',
                color: '#ff3333'
              }}
            >
              DELETE
            </button>
          </div>
        </div>
      )
    } else if (deleteStep === 'keep-confirm') {
      return (
        <div className="flex items-center" style={{ gap: '1.48vh', padding: '0 1.48vh' }}>
          <span className="font-prometheus tracking-wide text-center" style={{ color: '#00ff00', fontSize: '1.2vh' }}>
            Topics and Subtopics will be kept and renumbered. Click wastebin again to confirm.
          </span>
        </div>
      )
    } else if (deleteStep === 'delete-confirm') {
      return (
        <div className="flex items-center" style={{ gap: '1.48vh', padding: '0 1.48vh' }}>
          <span className="font-prometheus tracking-wide text-center" style={{ color: '#ff3333', fontSize: '1.2vh' }}>
            THIS WILL DELETE RELATED TOPICS AND SUBTOPICS. Click wastebin again to confirm.
          </span>
        </div>
      )
    }
    return null
  }

  // Check if in delete workflow
  const isDeleteWorkflow = deleteStep !== null && deleteLoNumber !== null

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'pke-glow-pulse' : ''}`}
      style={{
        width: 'var(--pke-w)',            /* 908px @ 1920 */
        height: 'var(--pke-h)',           /* 76px @ 1080 */
        borderRadius: 'var(--pke-r)',     /* 38px @ 1080 - half height for lozenge */
        padding: '0.09vh',                /* 1px @ 1080 */
        background: isActive
          ? '#FF6600' // Burnt orange when active
          : defaultGradient, // A7: New gradient when inactive
        boxShadow: isActive
          ? '0 0 1.11vh 0.37vh rgba(255, 102, 0, 0.6)' /* 12px 4px @ 1080 */
          : 'none',
        marginLeft: '1.82vw',             /* 35px @ 1920 */
        cursor: isActive ? 'default' : 'pointer'
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: '#0d0d0d',
          borderRadius: 'calc(var(--pke-r) - 0.09vh)'  /* 37px @ 1080 - slightly smaller for inner content */
        }}
      >
        {isDeleteWorkflow ? (
          renderDeleteContent()
        ) : isActive ? (
          <span className="font-prometheus tracking-wide text-center" style={{ color: '#BF9000', fontSize: '1.39vh', padding: '0 1.48vh' }}>
            PKE ACTIVATED. FUNCTIONALITY COMING SOON.
          </span>
        ) : (
          <span className="font-prometheus tracking-wide" style={{ color: '#767171', fontSize: '1.39vh' }}>
            PKE INTERFACE
          </span>
        )}
      </div>
      
      {/* B11: CSS for pulse animation */}
      <style>{`
        @keyframes pke-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 1.11vh 0.37vh rgba(255, 102, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 1.67vh 0.56vh rgba(255, 102, 0, 0.8);
          }
        }
        .pke-glow-pulse {
          animation: pke-glow-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default PKEInterface
