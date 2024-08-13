import React from 'react'

const Highlight = ({text}) => {
  return (
    <span className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] animate-gradient'>
        {" "}
        {text}
    </span>
  )
}

export default Highlight