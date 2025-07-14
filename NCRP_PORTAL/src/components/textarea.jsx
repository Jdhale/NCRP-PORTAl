import React from 'react'

export function Textarea({ placeholder, value, onChange, className = "" }) {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded h-32 ${className}`}
      />
    );
  }
  
export default Textarea