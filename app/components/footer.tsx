import Link from 'next/link'
import Image from 'next/image'
import { Github, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="footer border-t border-gray-200 font-satoshi">
      <div className="container w-full mx-auto px-6">
        <div className="footer-wrapper w-full py-16">
          <Link href="/" className="footer-brand inline-block">
            <div className="flex items-center gap-3">
              <Image
                src="/images/okapi-logo.png"
                alt="The Okapi Store Logo"
                width={56}
                height={56}
                className="w-14"
              />
              <h2 className="text-xl font-bold text-gray-900 md:text-3xl md:font-extrabold md:text-gray-800">
                The Okapi Store
              </h2>
            </div>
          </Link>

          <div className="footer-content grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="footer-block">
              <div className="footer-title-small text-xs font-medium tracking-wider text-gray-500 mb-4">
                NAVIGATION
              </div>
              <div className="flex flex-col space-y-3">
                <Link href="/products" className="footer-link text-gray-600 hover:text-black">
                  Shop
                </Link>
                <Link href="/about" className="footer-link text-gray-600 hover:text-black">
                  About
                </Link>
              </div>
            </div>

            <div className="footer-block">
              <div className="footer-title-small text-xs font-medium tracking-wider text-gray-500 mb-4">
                CATEGORIES
              </div>
              <div className="flex flex-col space-y-3">
                <Link href="/" className="footer-link text-gray-600 hover:text-black">
                  Apparel
                </Link>
                {/* <Link href="/products?category=accessories" className="footer-link text-gray-600 hover:text-black">
                  Accessories
                </Link>
                <Link href="/products?category=prints" className="footer-link text-gray-600 hover:text-black">
                  Art Prints
                </Link> */}
              </div>
            </div>

            <div className="footer-block">
              <div className="footer-title-small text-xs font-medium tracking-wider text-gray-500 mb-4">
                SUPPORT
              </div>
              <div className="flex flex-col space-y-3">
                <Link href="/shipping" className="footer-link text-gray-600 hover:text-black">
                  Shipping Info
                </Link>
                <Link href="/returns" className="footer-link text-gray-600 hover:text-black">
                  Returns & Exchanges
                </Link>
                <Link href="/contact" className="footer-link text-gray-600 hover:text-black">
                  Contact Us <strong>→</strong>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="divider border-t border-gray-200"></div>

        <div className="footer-row w-full flex flex-col md:flex-row justify-between items-center py-8">
          <div className="footer-2-left text-gray-600 text-sm mb-4 md:mb-0">
            © 2024 The Okapi Store | Built by{' '}
            <a
              href="https://sennebels.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:text-black"
            >
              Senne Bels
            </a>
          </div>

          <div className="footer-2-right ml-auto">
            <ul className="social-icons-list flex space-x-4 items-center">
              <li className="list-item">
                <a
                  href="https://github.com/snenenenenenene"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footersocialicons w-8 h-8 flex items-center justify-center hover:opacity-75 text-gray-600 hover:text-black"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
              </li>
              <li className="list-item">
                <a
                  href="https://linkedin.com/in/sennebels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footersocialicons w-8 h-8 flex items-center justify-center hover:opacity-75 text-gray-600 hover:text-black"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </li>
              <li className="list-item">
                <a
                  href="mailto:sennebels@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footersocialicons w-8 h-8 flex items-center justify-center hover:opacity-75 text-gray-600 hover:text-black"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}