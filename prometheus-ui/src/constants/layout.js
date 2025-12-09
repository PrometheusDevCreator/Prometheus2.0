/**
 * Layout Constants - Single source of truth for UI positioning
 * 
 * All measurements in pixels unless noted
 * Positive X = right of center, Negative X = left of center
 * 
 * Grid: 95px ≈ 25mm at 96 DPI
 */

export const LAYOUT = {
  // Grid reference
  GRID_SPACING: 95,  // 25mm in pixels
  
  // Core reference points
  CENTERLINE: '50%',
  
  // Horizontal offsets from centerline (in pixels)
  LEFT_FORM_RIGHT_EDGE: -95,    // Right edge of left-side inputs (25mm left of center)
  RIGHT_FORM_LEFT_EDGE: 95,     // Left edge of Description (25mm right of center)
  
  // Input dimensions
  INPUT_WIDTH: 477,              // Standard input width
  INPUT_HEIGHT: 39,              // Standard input height
  DURATION_WIDTH: 135,           // Duration field width
  
  // Form positioning
  FORM_TOP_OFFSET: 58,           // Top margin for form area
  FORM_LEFT_OFFSET: 76,          // Additional left offset for form labels
  LABEL_WIDTH: 115,              // Width for label column in grid
  
  // Row spacing
  ROW_GAP: 16,                   // Gap between form rows (gap-y-4 = 16px)
  DEVELOPER_SELECT_GAP: 19,      // Extra gap between Developer and Select Course (5mm)
  
  // PKE Interface (100% increase from original)
  PKE_WIDTH: 908,                // 454px * 2
  PKE_HEIGHT: 76,                // 38px * 2
  PKE_BORDER_RADIUS: 38,         // Half of height for lozenge
  
  // Navigation
  NAV_LEFT_OFFSET: -15,          // Move navigation left by 15px
  
  // Status bar
  STATUS_BAR_CONTENT_OFFSET: -15, // Move content up by 15px
  
  // Vertical reference points (Y coordinates)
  HEADER_HEIGHT: 90,              // Approximate header height including padding
  CONTENT_START_Y: 100,           // Where main content area begins
  
  // Description textarea
  DESCRIPTION_WIDTH: 477,         // Same as input width
  DESCRIPTION_MIN_HEIGHT: 250,    // Minimum height
  
  // ============================================
  // DESIGN PAGE (Course Content Scalar)
  // ============================================
  
  // Content Zone boundaries (per UI_DOCTRINE.md)
  CONTENT_ZONE_TOP: 180,          // Below top horizontal line
  CONTENT_ZONE_BOTTOM: 780,       // Above PKE Interface and action buttons
  
  // Design page specific
  DESIGN_TITLE_Y: 135,            // Y position for "COURSE CONTENT SCALAR" title
  DESIGN_MODULE_Y: 199,           // Y position for Module selector
  DESIGN_DIVIDER_1_Y: 193,        // Horizontal line below title area
  DESIGN_DIVIDER_2_Y: 272,        // Horizontal line below module selector
  
  // Column dimensions
  DESIGN_COLUMN_WIDTH: 242,       // Width of each column panel
  DESIGN_COLUMN_HEIGHT: 29,       // Height of column header containers
  DESIGN_COLUMN_GAP: 19,          // Gap between columns
  
  // Column X positions (from left edge)
  DESIGN_COL_1_X: 30,             // Learning Objectives
  DESIGN_COL_2_X: 278,            // Lessons
  DESIGN_COL_3_X: 525,            // Topics
  DESIGN_COL_4_X: 773,            // Subtopics
  DESIGN_COL_5_X: 1020,           // Performance Criteria
  
  // Column header Y position
  DESIGN_COLUMN_HEADER_Y: 232,    // Y position for column container panels
  
  // Content area
  DESIGN_CONTENT_START_Y: 292,    // Where scrollable content begins
  DESIGN_CONTENT_END_Y: 638,      // Where content area ends (above PKE)
  DESIGN_CONTENT_HEIGHT: 346,     // Usable height for content (638-292)
}

// Helper function to calculate position from centerline
export const fromCenter = (offset, elementWidth = 0) => {
  if (offset < 0) {
    // Left of center: position so RIGHT edge is at offset
    return `calc(50% + ${offset}px - ${elementWidth}px)`
  } else {
    // Right of center: position so LEFT edge is at offset
    return `calc(50% + ${offset}px)`
  }
}

// Helper for right-edge positioning
export const rightEdgeAt = (offset, elementWidth) => {
  return `calc(50% + ${offset}px - ${elementWidth}px)`
}

// Helper for left-edge positioning
export const leftEdgeAt = (offset) => {
  return `calc(50% + ${offset}px)`
}

export default LAYOUT

