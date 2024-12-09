// app/shipping/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Truck, PackageCheck, Clock, MapPin, ShieldCheck, HelpCircle } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const shippingZones = [
  {
    region: "Antwerpen",
    time: "1-2 business days",
    cost: "5.00"
  },
  {
    region: "Brussels",
    time: "1-2 business days",
    cost: "5.00"
  },
  {
    region: "Vlaams-Brabant",
    time: "1-2 business days",
    cost: "5.00"
  },
  {
    region: "Waals-Brabant",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "Limburg",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "Luik",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "Namen",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "Henegouwen",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "Luxemburg",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "West-Vlaanderen",
    time: "2-3 business days",
    cost: "5.00"
  },
  {
    region: "Oost-Vlaanderen",
    time: "1-2 business days",
    cost: "5.00"
  }
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="bg-primary/5">
        <div className="container mx-auto px-6 py-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif mb-6 text-neutral"
          >
            Shipping Information
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-light text-neutral/80 max-w-2xl"
          >
            We currently offer shipping exclusively within Belgium, ensuring quick and reliable delivery of your Okapi items.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto px-6 py-24"
      >
        {/* Key Features */}
        <motion.div variants={item} className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
            <Truck className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-serif text-lg mb-3 text-neutral">Fast Delivery</h3>
            <p className="text-neutral/70">1-3 business days delivery across Belgium</p>
          </div>

          <div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
            <PackageCheck className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-serif text-lg mb-3 text-neutral">Order Tracking</h3>
            <p className="text-neutral/70">Track your package every step of the way</p>
          </div>

          <div className="group hover:bg-primary/5 p-8 rounded-lg transition-all duration-300">
            <ShieldCheck className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-serif text-lg mb-3 text-neutral">Secure Packaging</h3>
            <p className="text-neutral/70">Items carefully packaged for safe delivery</p>
          </div>
        </motion.div>

        {/* Shipping Process */}
        <motion.section variants={item} className="mb-24 space-y-12">
          <h2 className="text-2xl font-serif text-neutral">How We Ship</h2>
          
          <div className="grid gap-8">
            {[
              {
                step: "01",
                title: "Order Processing",
                description: "Orders are processed within 24 hours of placement"
              },
              {
                step: "02",
                title: "Production",
                description: "Each item is carefully produced to order"
              },
              {
                step: "03",
                title: "Quality Check",
                description: "Rigorous quality inspection before packaging"
              },
              {
                step: "04",
                title: "Dispatch",
                description: "Items shipped via our trusted courier partner"
              },
              {
                step: "05",
                title: "Delivery",
                description: "Direct delivery to your specified address"
              }
            ].map((step) => (
              <div key={step.step} className="flex gap-8 items-start p-6 hover:bg-primary/5 rounded-lg transition-all duration-300">
                <span className="font-serif text-4xl text-primary/30">{step.step}</span>
                <div>
                  <h3 className="font-serif text-lg text-neutral mb-2">{step.title}</h3>
                  <p className="text-neutral/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Delivery Zones */}
        <motion.section variants={item} className="mb-24 space-y-12">
          <h2 className="text-2xl font-serif text-neutral">Delivery Zones</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shippingZones.map((zone) => (
              <div 
                key={zone.region}
                className="p-6 hover:bg-primary/5 rounded-lg transition-all duration-300 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-serif text-lg text-neutral">{zone.region}</h3>
                </div>
                <p className="text-neutral/70">Delivery: {zone.time}</p>
                <p className="text-neutral/70">Cost: &euro;{zone.cost}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Important Information */}
        <motion.section variants={item} className="space-y-12">
          <h2 className="text-2xl font-serif text-neutral">Important Information</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="font-serif text-lg text-neutral">Shipping Times</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-neutral">Order Processing</p>
                    <p className="text-neutral/70">1-2 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Truck className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-neutral">Transit Time</p>
                    <p className="text-neutral/70">1-3 business days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-serif text-lg text-neutral">Delivery Details</h3>
              <ul className="space-y-2 text-neutral/70">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  Signature required for all deliveries
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  Tracking number provided via email
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  No delivery on weekends or holidays
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section 
          variants={item} 
          className="mt-24 bg-primary/5 p-12 rounded-lg space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-serif text-neutral">Shipping Questions?</h2>
          </div>
          <p className="text-neutral/70 max-w-2xl">
            Our customer service team is ready to assist you with any shipping-related inquiries.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-6">
            <div>
              <p className="font-serif text-neutral">Email</p>
              <p className="text-neutral/70">okapistore@gmail.com</p>
            </div>
            <div>
              <p className="font-serif text-neutral">Phone</p>
              <p className="text-neutral/70">&#43;32 (0) 470 976 709</p>
            </div>
            <div>
              <p className="font-serif text-neutral">Hours</p>
              <p className="text-neutral/70">Mon-Fri, 9:00-17:00 CET</p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}