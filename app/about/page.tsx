/* eslint-disable @next/next/no-img-element */
export default function AboutPage() {
	return (
		<div className="container mx-auto px-4  py-8">
			<h1 className="text-3xl md:text-4xl font-bold mb-6">About Me</h1>

			<div className="flex flex-col lg:flex-row w-full gap-8">
				{/* Image and Quote Section */}
				<div className='flex flex-col md:max-w-md lg:max-w-xs'>
					<div className="relative w-full aspect-square mb-4">
						<img
							src="/images/me.jpg"
							alt="me"
							className="object-cover w-full h-full rounded-lg"
						/>
					</div>
					<p className="text-primary font-mono italic text-sm md:text-base">
						&quot;Okapi lover, web developer, and conservation enthusiast&quot;
					</p>
				</div>

				{/* Main Content Section */}
				<div className="flex flex-col flex-1">
					<h2 className="text-xl md:text-2xl font-bold text-neutral mb-4">My Okapi Journey</h2>
					<div className="space-y-4">
						<p className="">
							I&apos;m Senne Bels, a passionate Okapi enthusiast from Antwerp, Belgium. My love for these remarkable creatures began in my childhood, nurtured by frequent visits to the Antwerp Zoo, renowned for its Okapi conservation efforts.
						</p>
						<p className="">
							As I grew up, my fascination with Okapis only deepened. They&apos;ve been my favorite animal for as long as I can remember. A few years ago, when I discovered old files from the early 2000s on a USB stick from my dad, it reignited my lifelong passion.
						</p>
						<p className="">
							My dedication to learning everything about Okapis has also made me acutely aware of the challenges they face. As an animal lover at heart and a web developer by profession, I&apos;ve decided to combine my passions to make a difference.
						</p>

						<h2 className="text-xl md:text-2xl font-bold text-neutral mt-6 mb-4">The Okapi Store</h2>
						<p className="">
							I&apos;ve recently been working on creating a web shop that sells Okapi-themed items. From ethically sourced and durable shirts to innovative products, my goal is to raise awareness and support Okapi conservation efforts.
						</p>
						<p className="">
							Every purchase contributes to Okapi conservation projects, helping to protect these magnificent creatures and their habitat.
						</p>
					</div>
				</div>
			</div>

			{/* Gallery Section */}
			<div className="mt-12">
				<h2 className="text-xl md:text-2xl font-bold text-neutral mb-6">My Okapi Connection</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="relative aspect-[4/3]">
						<img
							src="/images/okapi-antwerp-zoo.jpg"
							alt="Okapi at Antwerp Zoo"
							className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
						/>
					</div>
					<div className="relative aspect-[4/3]">
						<img
							src="/images/okapi-tattoo.jpg"
							alt="Senne's Okapi Tattoo"
							className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
						/>
					</div>
					<div className="relative aspect-[4/3]">
						<img
							src="/images/okapi-wild.jpg"
							alt="Okapi in the Wild"
							className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
						/>
					</div>
				</div>
				<p className="mt-6 ">
					My connection to Okapis runs deep. I even have an Okapi tattoo as a permanent reminder of my commitment to these incredible animals.
				</p>
			</div>
		</div>
	)
}