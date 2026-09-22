export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* BRAND */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              Courier Management
            </h2>

            <p className="text-sm text-gray-400 leading-6">
              Fast, reliable and secure parcel delivery management
              for customers and delivery managers.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Quick Links
            </h3>

            <div className="space-y-2 text-sm">
              <p className="hover:text-white cursor-pointer">
                Home
              </p>

              <p className="hover:text-white cursor-pointer">
                Track Parcel
              </p>

              <p className="hover:text-white cursor-pointer">
                Book Parcel
              </p>

              <p className="hover:text-white cursor-pointer">
                My Parcels
              </p>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Contact Us
            </h3>

            <div className="space-y-2 text-sm text-gray-400">
              <p>📧 support@courier.com</p>
              <p>📞 +880 1572915166</p>
              <p>📍 Bangladesh</p>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-700 mt-8 pt-5 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Courier Management System.
            All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}