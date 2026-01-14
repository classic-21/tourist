import BottomNavbar from '@/components/bottomNavbar/bottomNavbar';
import React from 'react'

const LikedLayout = ({children}:Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <div style={{position:'relative'}} >
    {children}
    <BottomNavbar/>
    </div>
  )
}

export default LikedLayout