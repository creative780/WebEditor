import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PrintStudio</h3>
            <p className="text-gray-400">
              The ultimate print design platform for professionals and businesses.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Features</Link></li>
              <li><Link href="#" className="hover:text-white">Templates</Link></li>
              <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white">Status</Link></li>
              <li><Link href="/health" className="hover:text-white">System Health</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">About</Link></li>
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PrintStudio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

