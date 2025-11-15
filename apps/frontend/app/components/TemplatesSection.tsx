export default function TemplatesSection() {
  return (
    <section id="templates" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose from thousands of templates
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started quickly with professionally designed templates for every need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Template 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Business Card</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Professional Business Card</h3>
              <p className="text-sm text-gray-600 mt-1">Clean and modern design</p>
            </div>
          </div>

          {/* Template 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Flyer</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Event Flyer</h3>
              <p className="text-sm text-gray-600 mt-1">Eye-catching promotional design</p>
            </div>
          </div>

          {/* Template 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Poster</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Marketing Poster</h3>
              <p className="text-sm text-gray-600 mt-1">Bold and impactful design</p>
            </div>
          </div>

          {/* Template 4 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Banner</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Web Banner</h3>
              <p className="text-sm text-gray-600 mt-1">Perfect for digital marketing</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold">
            Browse All Templates
          </button>
        </div>
      </div>
    </section>
  );
}

