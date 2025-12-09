# PROMETHEUS 2.0 - UI MOCKUP SPECIFICATIONS

Extracted from: `ui/Mockups/2.0 Mockup.pptx`

## EMU to Pixel Conversion
- 1 inch = 914,400 EMUs (English Metric Units)
- 1 inch = 96 pixels (at standard DPI)
- **Conversion: pixels = EMUs / 9525**

---

## SLIDE OVERVIEW

| Slide | Name | Description |
|-------|------|-------------|
| 1 | LOGIN | Login page with logo, title, credentials form |
| 2 | DEFINE | Course Information entry (Define phase) |
| 3 | DESIGN | Course Content Scalar view (Design phase) |
| 4 | BUILD | Course building interface (large slide) |
| 5 | BUILD ALT | Alternative/detail build view |
| 6 | EXPORT | Generate Course Materials page |
| 7 | REFERENCE | Screenshot/reference image |

---

## SLIDE 1: LOGIN PAGE

### Global Layout
- **Background**: Dark (#0d0d0d equivalent - schemeClr bg1)
- **Canvas Size**: Standard 16:9 widescreen (12192000 x 6858000 EMU = 1280 x 720 px)

### Logo
- **Position**: x=936000, y=1289792 EMU → **~98px, 135px**
- **Size**: cx=1231089, cy=1214536 EMU → **~129px × 127px**
- **Shape**: Rounded rectangle with blipFill (image fill)
- **3D Effect**: bevelT (top bevel)

### Title: "PROMETHEUS COURSE GENERATION SYSTEM 2.0"
- **Position**: x=2167089, y=1900454 EMU → **~227px, 199px**
- **Size**: cx=3935442, cy=707886 EMU → **~413px × 74px**
- **Font**: Candara
- **Font Size**: sz="2000" → **20pt**
- **Letter Spacing**: spc="300" → **3pt (tracking-wider)**
- **Color**: schemeClr bg1 lumMod 95000 → **#f2f2f2**
- **Effect**: outerShdw (drop shadow) - blur 38100, dist 38100, dir 2700000, alpha 43%

### Horizontal Gradient Line
- **Position**: x=936000, y=2589090 EMU → **~98px, 272px**
- **Width**: cx=10333062 EMU → **~1085px**
- **Height**: w="9525" → **1px**
- **Gradient**: 
  - 0%: schemeClr bg1 → **#ffffff**
  - 85%: schemeClr bg2 lumMod 50000 → **#767171**
  - 100%: schemeClr bg2 lumMod 25000 → **#3b3838**
- **Angle**: 135° (lin ang="13500000")

### "LOGIN:" Label
- **Position**: x=2167089, y=4071794 EMU → **~227px, 427px**
- **Font**: Candara (sz="1800" implied from default)
- **Letter Spacing**: spc="300"
- **Color**: #f2f2f2

### USERNAME Label
- **Position**: x=3925126, y=4132715 EMU → **~412px, 434px**
- **Font**: Candara
- **Font Size**: sz="800" → **8pt**
- **Letter Spacing**: spc="150"
- **Color**: #f2f2f2

### USERNAME Input Field
- **Position**: x=4798131, y=4119754 EMU → **~504px, 432px**
- **Size**: cx=3039308, cy=261609 EMU → **~319px × 27px**
- **Shape**: roundRect with adj="6336" (small corner radius ~6%)
- **Background**: noFill (transparent)
- **Border Width**: w="6350" → **0.67px** (thin)
- **Border**: Gradient fill
  - 0%: #ffffff
  - 21%: #ffffff  
  - 100%: #767171 (bg2 lumMod 50000)
- **Border Style**: path="circle" (radial gradient from center)

### PASSWORD Label
- **Position**: x=3925126, y=4564247 EMU → **~412px, 479px**
- **Same styling as USERNAME label**

### PASSWORD Input Field
- **Position**: x=4798131, y=4551286 EMU → **~504px, 478px**
- **Size**: Same as USERNAME (319px × 27px)
- **Same styling as USERNAME input**

### LOGIN Button
- **Position**: x=4798131, y=4982818 EMU → **~504px, 523px** (inside group)
- **Size**: cx=1324587, cy=413329 EMU (group) → **~139px × 43px**
- **Shape**: roundRect with adj="48177" → **pill shape (48% radius)**
- **Fill Gradient**:
  - 0%: #ffffff (accent5 lumMod 0 + lumOff 100000)
  - 35%: **#D65700** (burnt orange)
  - 100%: **#763000** (dark brown)
- **Gradient Direction**: lin ang="2700000" → **27° (top to bottom)**
- **Border**: Double line (cmpd="dbl"), same gradient style
- **Text**: "LOGIN"
  - Font: Candara
  - Font Size: sz="1100" → **11pt**
  - Letter Spacing: spc="200"
  - Color: schemeClr bg1 → **#ffffff**

### "Forgot Password?" Text
- **Position**: x=4694164, y=5448003 EMU → **~493px, 572px**
- **Font Size**: sz="500" → **5pt**
- **Color**: #f2f2f2

### "Remember Me" Text
- **Position**: x=7151962, y=5460124 EMU → **~751px, 573px**
- **Font Size**: sz="500" → **5pt**
- **Alignment**: Right-aligned

---

## SLIDE 2: DEFINE (Course Information)

### Header Section
- **Logo Position**: x=276225, y=176543 EMU → **~29px, 19px**
- **Logo Size**: cx=434169, cy=450375 EMU → **~46px × 47px**
- **Title Position**: x=710394, y=182652 EMU → **~75px, 19px**
- **Title Font Size**: sz="1400" → **14pt**

### Top-Right Status Panel
- **Position**: x=8935229, y=138685 EMU → **~938px, 15px**
- **Content**: Course Loaded, Duration, Level, Thematic
- **Font**: Candara (labels), values in **#00FF00** (green)
- **Font Size**: sz="500" → **5pt**

### Date/Time Display
- **Position**: x=10063824, y=171652 EMU → **~1057px, 18px**
- **Font**: Cascadia Code
- **Color**: **#00FF00**

### Main Title: "COURSE INFORMATION"
- **Position**: x=4887762, y=1287226 EMU → **~513px, 135px** (centered)
- **Font Size**: sz="1100" → **11pt**
- **Letter Spacing**: spc="300"

### Form Fields (Title, Level, Thematic, Duration, Developer, Code)
- **Input Size**: cx=3039308, cy=261609 EMU → **~319px × 27px**
- **Same border gradient styling as Login page inputs**

### "Select Course" Dropdown
- **Position**: x=4653080, y=3905680 EMU
- **Size**: 319px × 27px
- **Includes dropdown arrow (triangle)**

### Description Text Area
- **Position**: x=6587519, y=1926047 EMU
- **Size**: cx=3039308, cy=1525099 EMU → **~319px × 160px**
- **Has scrollbar with scroll indicators**

### Phase Navigation (Bottom-Left)
- **Phases**: Define, Design, Build, Export, Format
- **Each Phase Circle**: cx=328819, cy=273180 EMU → **~35px × 29px**
- **Active Phase**: Orange border (#FF6600 or accent2)
- **Inactive Phase**: Grey border (bg2 lumMod 50000)
- **Font Size**: sz="400" → **4pt**

### Action Buttons (Bottom-Right)
- **LOAD, SAVE, DELETE, CLEAR buttons**
- **Size**: cx=662697, cy=273180 EMU → **~70px × 29px**
- **Shape**: Pill (roundRect adj="48177")
- **Fill**: Grey gradient (bg2 tones)

### Progress Bar
- **Position**: Near bottom center
- **Shows orange progress line (15% in mockup)**

### Bottom Status Bar
- **Content**: OWNER, START DATE, STATUS, PROGRESS
- **Font**: Cascadia Code
- **Color**: Labels in #f2f2f2, values in **#00FF00**

---

## SLIDE 3: DESIGN (Course Content Scalar)

### Page Title
- **Text**: "COURSE CONTENT SCALAR"
- **Position**: x=4781006, y=1287226 EMU → **~502px, 135px** (center-aligned)
- **Size**: cx=2676701, cy=261610 EMU → **~281px × 27px**
- **Font**: Candara
- **Font Size**: sz="1100" → **11pt**
- **Letter Spacing**: spc="300" → **3pt (tracking-wider)**
- **Color**: #f2f2f2 (bg1 lumMod 95000)

### Import Scalar Link
- **Text**: "Import Scalar" (greyed out, placeholder)
- **Position**: x=5445463, y=1526316 EMU → **~572px, 160px**
- **Font**: Candara, sz="800" (8pt)
- **Color**: #767171 (bg2 lumMod 50000)

### Horizontal Divider Lines
| Line | Y Position (EMU) | Y Position (px) | Purpose |
|------|------------------|-----------------|---------|
| Below header | 705872 | ~74px | Top frame separator |
| Below title area | 1841860 | ~193px | Separates title from module selector |
| Below module selector | 2595018 | ~272px | Separates selector from content columns |
| Bottom frame | 6532962 | ~686px | Above status bar |

### Module Selector
- **Text**: "Module: 1" with dropdown arrow
- **Position**: x=199842, y=1895965 EMU → **~21px, 199px** (after transform)
- **Size**: cx=1301073, cy=215444 EMU → **~137px × 23px**
- **Font**: Candara, sz="800" (8pt)
- **Letter Spacing**: spc="300"
- **Color**: #f2f2f2
- **Dropdown Arrow**: Triangle (80×71 EMU), grey fill (#767171)

### Column Headers (Section Labels)
| Column | Label | X Position (EMU) | X Position (px) | Y Position |
|--------|-------|------------------|-----------------|------------|
| 1 | Learning Objective | 189342 | ~20px | ~217px |
| 2 | Lesson | 2576258 | ~270px | ~218px |
| 3 | Topic | 4932459 | ~518px | ~218px |
| 4 | Subtopic | 7325185 | ~769px | ~218px |
| 5 | Performance Criteria | 9615742 | ~1010px | ~218px |

- **Font**: Candara, sz="600" (6pt)
- **Letter Spacing**: spc="150"
- **Color**: #f2f2f2 (normal), #FF6600 (active - Learning Objective in mockup)

### Column Container Panels
- **Count**: 5 columns
- **Size (each)**: cx=2303365, cy=276999 EMU → **~242px × 29px**
- **Shape**: roundRect with adj="18131" (~18% corner radius)
- **Background**: noFill (transparent)
- **Border**: 
  - Width: w="6350" → **0.67px**
  - Style: Radial gradient (circle at center)
  - Colors: 0% #ffffff, 46% #a8a4a4, 100% #767171
- **Spacing between columns**: ~19px gap

| Column | X Position (EMU) | X Position (px) |
|--------|------------------|-----------------|
| 1 (LO) | 282542 | ~30px |
| 2 (Lesson) | 2643909 | ~278px |
| 3 (Topic) | 5005276 | ~525px |
| 4 (Subtopic) | 7366643 | ~773px |
| 5 (PC) | 9716063 | ~1020px |

### Hierarchical Content Area
- **Position**: Y starts at ~292px (below column headers)
- **Height**: Extends to ~600px (above action buttons)

#### Learning Objectives (Column 1)
- **Numbering**: 1., 2., 3., etc.
- **Sample Content**: "Explain…", "Describe…", "Analyse"
- **Font**: Candara, sz="600" (6pt)
- **Active Item Color**: #FF6600 (orange)
- **Normal Item Color**: #f2f2f2

#### Lessons (Column 2)
- **Numbering**: 1., 2., 3., etc.
- **Sample Content**: "Introduction", "History", "Case Study 1"
- **Font**: Candara, sz="600" (6pt)

#### Topics (Column 3)
- **Numbering**: 1.1, 1.2, 2.1, 2.2, etc.
- **Sample Content**: "Overview", "Relevance", "The beginnings", "Famous Cases"
- **Font**: Candara, sz="600" (6pt)

#### Subtopics (Column 4)
- **Numbering**: 1.1.1, 1.1.2, 1.1.3, 1.2.1, 1.2.2, etc.
- **Sample Content**: "Example 1", "Example 2", etc.
- **Font**: Candara, sz="600" (6pt)

#### Performance Criteria (Column 5)
- **Numbering**: 1.1, 1.2, etc.
- **Sample Content**: "Can explain concepts", "Understands relevance"
- **Font**: Candara, sz="600" (6pt)

### < + > Navigation Controls
- **Position**: Center, above PKE Interface
- **Text**: "< + >" 
- **Font**: Candara, sz="1600" (16pt), bold
- **Letter Spacing**: spc="300"
- **Color**: #f2f2f2

### PKE Interface (Design Page)
- **Position**: x=3542074, y=6076515 EMU → **~372px, 638px** (center-aligned)
- **Size**: cx=5261320, cy=391546 EMU → **~552px × 41px**
- **Shape**: roundRect with adj="50000" (full pill/lozenge)
- **Border**: Radial gradient (same as column containers)

### Action Buttons (Bottom-Right)
| Button | X Position | Text |
|--------|------------|------|
| DELETE | ~1019px | "DELETE" |
| CLEAR | ~1110px | "CLEAR" |
| SAVE | ~1193px | "SAVE" |

- **Size**: cx=662697, cy=273180 EMU → **~70px × 29px**
- **Shape**: Pill (roundRect adj="48177")
- **Font**: Candara, sz="800" (8pt)
- **Letter Spacing**: spc="200"

### Navigation Band (Bottom-Left)
- **Active Phase**: Design (orange #FF6600 border and text)
- **Format Button**: Present with grey border (#a6a6a6), indicating 5th navigation option
- **Same styling as Define page navigation**

### Content Zone Boundaries (for implementation)
| Boundary | Y Coordinate | Notes |
|----------|--------------|-------|
| **Top** | ~193px | Below title divider line |
| **Bottom** | ~638px | Above PKE Interface |
| **Left** | ~20px | Left edge with padding |
| **Right** | ~1260px | Right edge with padding |
| **Usable Height** | ~445px | For scrollable content area |

---

## SLIDE 6: EXPORT (Generate Course Materials)

### Title: "GENERATE COURSE MATERIALS"
- **Position**: x=4467943, y=1287226 EMU
- **Font Size**: sz="1100" → **11pt**
- **Letter Spacing**: spc="300"

### Form Dropdowns
- **Type**: cx=2303365, cy=204511 EMU → **~242px × 21px**
- **Export Format**: Same size
- **Days**: cx=632006 EMU → **~66px**
- **Lessons**: cx=632006 EMU → **~66px**

### Preview Area
- **Position**: x=3542074, y=3021338 EMU
- **Size**: cx=5337543, cy=1764703 EMU → **~560px × 185px**
- **Shape**: roundRect with border gradient

### GENERATE Button
- **Size**: cx=1324587, cy=413329 EMU → **~139px × 43px**
- **Fill**: Orange gradient (same as LOGIN button)
- **Text**: "GENERATE"

### VIEW Button
- **Same size as GENERATE**
- **Fill**: Grey gradient (inactive/secondary)
- **Text**: "VIEW"

### Status Info
- Type | Days 1-3 | Generated | Exported to PPTX

---

## COMMON STYLING PATTERNS

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background Dark | #0d0d0d | Main background |
| Text Light | #f2f2f2 | Primary text (bg1 lumMod 95000) |
| Grey Medium | #767171 | Borders, inactive (bg2 lumMod 50000) |
| Grey Dark | #3b3838 | Border endpoints (bg2 lumMod 25000) |
| Orange | #FF6600 | Active states, highlights |
| Orange Button | #D65700 | Button gradient mid |
| Orange Dark | #763000 | Button gradient end |
| Green | #00FF00 | Data values, status |

### Fonts
| Element | Font Family | Size | Spacing |
|---------|-------------|------|---------|
| Main Title | Candara | 20pt | 3pt |
| Section Headers | Candara | 11pt | 3pt |
| Labels | Candara | 8pt | 1.5pt |
| Small Labels | Candara | 6pt | 1.5pt |
| Tiny Labels | Candara | 5pt | 1.5pt |
| Button Text | Candara | 11pt | 2pt |
| Code/Status | Cascadia Code | 5-6pt | 1.5-2pt |

### Border Gradients
All input fields use radial gradient borders:
```css
background: radial-gradient(circle at center, #ffffff 0%, #ffffff 21%, #767171 100%);
```

### Button Styles
- **Primary (Orange)**: `linear-gradient(to bottom, #ffffff 0%, #D65700 35%, #763000 100%)`
- **Secondary (Grey)**: `linear-gradient(to bottom, #ffffff 0%, #767171 35%, #3b3838 100%)`
- **Shape**: pill (border-radius: 48% of height)
- **Border**: Double-line with same gradient

### Shadows
- **Text Shadow**: `drop-shadow(4px 4px 6px rgba(0,0,0,0.43))`
- **Direction**: 45° (dir="2700000")

---

## NAVIGATION FLOW

```
[Define] → [Design] → [Build] → [Export] → [Format]
    ○         ○          ○          ○          ○
```

- Active phase shown with orange (#FF6600) border
- Inactive phases shown with grey border
- Labels below each circle: Define, Design, Build, Export, Format

