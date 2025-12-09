function Navigation({ activePage = 'define', onNavigate }) {
  const pages = [
    { id: 'define', label: 'Define' },
    { id: 'design', label: 'Design' },
    { id: 'build', label: 'Build' },
    { id: 'export', label: 'Export' },
    { id: 'format', label: 'Format' }
  ]

  return (
    <div className="flex items-center gap-3">
      {pages.map((page) => {
        const isActive = activePage === page.id
        return (
          <button
            key={page.id}
            onClick={() => onNavigate?.(page.id)}
            className="flex flex-col items-center gap-1.5 group"
          >
            {/* Circle indicator - enlarged */}
            <div 
              className={`w-[44px] h-[36px] rounded-full border-2 transition-all
                ${isActive 
                  ? 'border-[#FF6600]' 
                  : 'border-[#767171] hover:border-[#a0a0a0]'
                }`}
            />
            {/* Label - enlarged font */}
            <span 
              className={`text-[10px] font-prometheus tracking-wider uppercase transition-colors
                ${isActive 
                  ? 'text-[#FF6600]' 
                  : 'text-[#767171] group-hover:text-[#a0a0a0]'
                }`}
            >
              {page.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default Navigation
