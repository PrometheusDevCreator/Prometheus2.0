import logo from '../assets/prometheus-logo.png'

function Header({ courseLoaded = false, courseData = {} }) {
  // Default values for when course is loaded
  const defaults = {
    courseName: 'Example',
    duration: '3 Days',
    level: 'Basic',
    thematic: 'Intelligence'
  }
  
  const data = courseLoaded ? { ...defaults, ...courseData } : {}

  return (
    <div className="flex items-start justify-between px-[2%] pt-[1.5%]">
      {/* Left side - Logo and Title */}
      {/* Logo +30%: from 56px to ~73px, expand down/right only */}
      {/* Gap to gradient line below: ~4px (1mm) */}
      <div className="flex items-start gap-4 pb-[4px]">
        <img 
          src={logo} 
          alt="Prometheus" 
          className="w-[73px] h-[73px] object-contain"
        />
        {/* Title text +30%: from 19px to ~25px */}
        <div className="flex flex-col pt-1">
          <span className="text-[#f2f2f2] text-[25px] tracking-wider font-prometheus uppercase leading-tight">
            PROMETHEUS COURSE
          </span>
          <span className="text-[#f2f2f2] text-[25px] tracking-wider font-prometheus uppercase leading-tight">
            GENERATION SYSTEM 2.0
          </span>
        </div>
      </div>

      {/* Right side - Metadata cluster (date/time moved to StatusBar per A8) */}
      <div className="flex items-start">
        {/* Course info - using grid for aligned values */}
        <div className="grid gap-x-3 gap-y-0.5 text-[11px] font-prometheus" style={{ gridTemplateColumns: 'auto auto' }}>
          <span className="text-[#f2f2f2] text-right">Course Loaded:</span>
          <span className="text-[#00FF00] font-cascadia">
            {courseLoaded ? data.courseName : '---'}
          </span>
          
          <span className="text-[#f2f2f2] text-right">Duration:</span>
          <span className="text-[#00FF00] font-cascadia">
            {courseLoaded ? data.duration : '---'}
          </span>
          
          <span className="text-[#f2f2f2] text-right">Level:</span>
          <span className="text-[#00FF00] font-cascadia">
            {courseLoaded ? data.level : '---'}
          </span>
          
          <span className="text-[#f2f2f2] text-right">Thematic:</span>
          <span className="text-[#00FF00] font-cascadia">
            {courseLoaded ? data.thematic : '---'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Header
