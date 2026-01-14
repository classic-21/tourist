import BottomNavbar from '@/components/bottomNavbar/bottomNavbar';
import React from 'react'

const SearchLayout = ({children}:Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <div style={{position:'relative'}}>
    {children}
    <BottomNavbar/>
    </div>
  )
}

export default SearchLayout