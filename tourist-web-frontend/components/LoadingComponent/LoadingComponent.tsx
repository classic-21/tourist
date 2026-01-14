import { useEffect, useState } from "react"

const LoadingComponent = () => {
  const [showReload,setShowReload] = useState(false)

  useEffect(()=>{

    const timeout = setTimeout(() => {

      setShowReload(true)
    }, 10000);

    return ()=>{
      clearTimeout(timeout)
    }
  },[])

  return ( showReload? <>
  <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
        <div className="text-center bg-white shadow-lg p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">Some error has occurred.</p>
          <button
            className="px-4 py-2 text-blue-500">
            Please try Again later
          </button>
          </div>
          </div>
  </>:
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-8 border-t-8 border-gray-200 border-t-[#8E170D] rounded-full animate-spin mb-4"></div>
        <h3 className="text-md font-semibold text-gray-600">Please Wait...</h3>
    </div>
  )
}

export default LoadingComponent