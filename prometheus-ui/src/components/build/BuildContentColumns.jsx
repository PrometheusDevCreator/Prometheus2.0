/**
 * BuildContentColumns - Container for 5 Content Columns
 *
 * Layout:
 * - 3 primary columns (full opacity, equal width)
 * - 2 optional columns (60% opacity, narrower)
 */

import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import BuildContentColumn from './BuildContentColumn'

function BuildContentColumns() {
  const { buildSelection } = useDesign()

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        padding: '16px 20px',
        overflowX: 'auto',
        overflowY: 'hidden',
        minHeight: 0
      }}
    >
      {/* Primary Columns (0-2) */}
      <BuildContentColumn columnIndex={0} isPrimary={true} />
      <BuildContentColumn columnIndex={1} isPrimary={true} />
      <BuildContentColumn columnIndex={2} isPrimary={true} />

      {/* Optional Columns (3-4) - de-emphasized */}
      <BuildContentColumn columnIndex={3} isPrimary={false} />
      <BuildContentColumn columnIndex={4} isPrimary={false} />

      {/* Empty state overlay when no lesson selected */}
      {!buildSelection.lessonId && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '20px 40px',
              background: THEME.BG_DARK,
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '8px'
            }}
          >
            <div
              style={{
                fontSize: '1.2vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: THEME.AMBER,
                marginBottom: '8px'
              }}
            >
              SELECT A LESSON
            </div>
            <div
              style={{
                fontSize: '0.8vh',
                fontFamily: THEME.FONT_MONO,
                color: THEME.TEXT_DIM
              }}
            >
              Choose a lesson from the dropdown above to begin editing slides
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuildContentColumns
