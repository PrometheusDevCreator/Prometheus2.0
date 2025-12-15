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
 * Deactivation triggers (handled by parent):
 * - Second press of PKE button (toggle)
 * - Navigation button press
 * - SAVE, LOAD, CLEAR, DELETE button press
 */

import { LAYOUT } from '../constants/layout'

function PKEInterface({
  isActive = false,
  onClose,
  // Delete workflow props
  deleteLoNumber = null, // LO number being deleted (1-indexed)
  deleteStep = null, // 'confirm' | 'keep-confirm' | 'delete-confirm'
  onKeep = null, // Handler for KEEP selection
  onDelete = null, // Handler for DELETE selection
  onCancel = null // Handler for cancel (click away)
}) {
  // A7: New gradient style - lightest at center, darker toward ends
  const defaultGradient = 'linear-gradient(to right, #3b3838, #767171 25%, #ffffff 50%, #767171 75%, #3b3838)'

  // Render delete workflow content
  const renderDeleteContent = () => {
    if (deleteStep === 'confirm') {
      return (
        <div className="flex items-center gap-4 px-4">
          <span className="text-[#ff3333] text-[14px] font-prometheus tracking-wide">
            THIS WILL DELETE LO {deleteLoNumber}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onKeep}
              className="px-4 py-1 text-[12px] tracking-wider font-prometheus border border-[#00ff00] text-[#00ff00] bg-transparent rounded-full hover:bg-[#00ff00] hover:text-[#0d0d0d] transition-all"
            >
              KEEP
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-1 text-[12px] tracking-wider font-prometheus border border-[#ff3333] text-[#ff3333] bg-transparent rounded-full hover:bg-[#ff3333] hover:text-[#0d0d0d] transition-all"
            >
              DELETE
            </button>
          </div>
        </div>
      )
    } else if (deleteStep === 'keep-confirm') {
      return (
        <div className="flex items-center gap-4 px-4">
          <span className="text-[#00ff00] text-[13px] font-prometheus tracking-wide text-center">
            Topics and Subtopics will be kept and renumbered. Click wastebin again to confirm.
          </span>
        </div>
      )
    } else if (deleteStep === 'delete-confirm') {
      return (
        <div className="flex items-center gap-4 px-4">
          <span className="text-[#ff3333] text-[13px] font-prometheus tracking-wide text-center">
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
      className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'pke-glow-pulse' : ''}`}
      style={{
        width: `${LAYOUT.PKE_WIDTH}px`,   // B5: 908px (100% increase)
        height: `${LAYOUT.PKE_HEIGHT}px`, // B5: 76px (100% increase)
        borderRadius: `${LAYOUT.PKE_BORDER_RADIUS}px`, // Half of height for lozenge
        padding: '1px',
        background: isActive
          ? '#FF6600' // Burnt orange when active
          : defaultGradient, // A7: New gradient when inactive
        boxShadow: isActive
          ? '0 0 12px 4px rgba(255, 102, 0, 0.6)' // B11: Scaled glow for larger size
          : 'none',
        marginLeft: '35px' // Horizontal shift right 35px (all pages)
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: '#0d0d0d',
          borderRadius: `${LAYOUT.PKE_BORDER_RADIUS - 1}px` // Slightly smaller for inner content
        }}
      >
        {isDeleteWorkflow ? (
          renderDeleteContent()
        ) : isActive ? (
          <span className="text-[#BF9000] text-[15px] font-prometheus tracking-wide text-center px-4">
            PKE ACTIVATED. FUNCTIONALITY COMING SOON.
          </span>
        ) : (
          <span className="text-[#767171] text-[15px] font-prometheus tracking-wide">
            PKE INTERFACE
          </span>
        )}
      </div>
      
      {/* B11: CSS for pulse animation */}
      <style>{`
        @keyframes pke-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 12px 4px rgba(255, 102, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 18px 6px rgba(255, 102, 0, 0.8);
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
