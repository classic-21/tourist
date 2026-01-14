import React from 'react'

interface LayoutProps {
  children: React.ReactNode;  // Explicitly define the type of children
}

const HomeLayout = ({children}: LayoutProps) => {
  return (
    <>
    {children}
    </>
  )
}

export default HomeLayout