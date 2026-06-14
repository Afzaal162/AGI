import Pricing from "../components/Pricing"

const Plans = () => {
  return (
    <div className="max-sm:py-10 sm:pt-20">
      <Pricing/>
      <p className="text-center text-gray-400 max-w-md text-sm my-14 mx-auto px-12"> 
        Create Stunning Images For Just <span className="text-indigo-400 font-medium">5 Credits </span> 
       and Generate Immersive Videos for <span className="text-indigo-400 font-medium">10 Credits</span>
      </p>
    </div>
  )
}

export default Plans