import React from 'react'

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: ()=>void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded shadow p-4 w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
