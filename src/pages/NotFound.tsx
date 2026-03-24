import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const NotFound = () => (
  <>
    <Helmet>
      <title>404 - Page Not Found | DigiStorms</title>
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-5xl font-bold mb-4" style={{ color: '#754BDD' }}>404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 text-base max-w-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#754BDD' }}
          >
            Back to home
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Browse the blog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default NotFound;
