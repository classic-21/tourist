/* eslint-disable @next/next/no-img-element */
const CustomerSupport = () => {
    return (
        <div className="p-6 max-w-sm mx-auto bg-gradient-to-r from-red-400 via-orange-500 to-orange-600 rounded-xl shadow-md flex items-center space-x-4">
            <div className="shrink-0">
                <img className="h-16 w-16 rounded-full" src="/images/contact_avatar.png" alt="Contact Avatar" />
            </div>
            <div>
                <h4 className="text-white text-lg font-semibold">Customer Support</h4>
                <p className="text-orange-200 text-sm">Mobile: +1234567890</p>
                <p className="text-orange-200 text-sm">Email: support@example.com</p>
                <button className="mt-2 px-4 py-2 bg-white text-orange-700 font-medium rounded-lg shadow hover:bg-orange-100 focus:outline-none">
                    Contact Us
                </button>
            </div>
        </div>
    )
}
export default CustomerSupport;