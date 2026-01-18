/**
 * OverviewHeader - Minimal header for OVERVIEW Tab
 *
 * DESCRIPTION moved to PlanningCanvas per design spec.
 * This component is now minimal (0 height) as content has been consolidated.
 */

import { THEME } from '../../../constants/theme'

function OverviewHeader({
  courseData = {},
  onUpdateDescription
}) {
  // DESCRIPTION content moved to PlanningCanvas
  // This component retained for potential future header elements
  return (
    <div
      style={{
        position: 'relative',
        height: '0vh',  // Reduced from 10vh - content moved to PlanningCanvas
        background: THEME.BG_DARK
      }}
    />
  )
}

export default OverviewHeader
