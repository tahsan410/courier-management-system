import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">
        Fast, Reliable & Secure Courier Service
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mb-8">
        Book, track, and manage your package deliveries seamlessly across the country with real-time tracking updates.
      </p>
      <div className="flex gap-4">
        <Link to="/book" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
          Book a Parcel
        </Link>
        <Link to="/track" className="bg-white hover:bg-gray-100 text-slate-800 border px-6 py-3 rounded-lg font-semibold shadow">
          Track Parcel
        </Link>
      </div>
    </div>
  );
}