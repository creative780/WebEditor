import Link from 'next/link';
import FeaturesSection from './components/FeaturesSection';
import TemplatesSection from './components/TemplatesSection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">PrintStudio</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#features" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </Link>
                <Link href="#templates" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Templates
                </Link>
                <Link href="#pricing" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/health" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Status
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </button>
              <Link href="/editor/sample-design" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Design. Print.{' '}
              <span className="text-indigo-600">Deliver.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create stunning print designs with our intuitive drag-and-drop editor. 
              From business cards to banners, bring your ideas to life in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/editor/sample-design" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                Start Creating Free
              </Link>
              <button className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-4xl">
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Design Preview</h3>
                  <p className="text-gray-500">Drag and drop your elements here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Templates Section */}
      <TemplatesSection />

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start creating?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of designers who trust PrintStudio for their print design needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/editor/sample-design" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Get Started Free
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
