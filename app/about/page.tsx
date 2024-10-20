/* eslint-disable @next/next/no-img-element */
export default function AboutPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold text-neutral mb-6">About Me</h1>

			<div className="flex w-full gap-8">
				<div className='flex flex-col'>
					<img
						src="/images/me.jpg"
						alt="me"
						className="mb-4 object-cover h-1/2"
					/>
					<p className="text-primary font-mono italic">&quot;Okapi lover, web developer, and conservation enthousiast&quot;</p>
				</div>

				<div className="flex flex-col">
					<h2 className="text-2xl font-bold text-neutral mb-4">My Okapi Journey</h2>
					<p className=" mb-4">
						I&quot;m Senne Bels, a passionate Okapi enthusiast from Antwerp, Belgium. My love for these remarkable creatures began in my childhood, nurtured by frequent visits to the Antwerp Zoo, renowned for its Okapi conservation efforts.
					</p>
					<p className="mb-4">
						As I grew up, my fascination with Okapis only deepened. They&quot;ve been my favorite animal for as long as I can remember. A few years ago, when I discovered old files from the early 2000s on a USB stick from my dad, it reignited my lifelong passion.
					</p>
					<p className="mb-4">
						My dedication to learning everything about Okapis has also made me acutely aware of the challenges they face. As an animal lover at heart and a web developer by profession, I&quot;ve decided to combine my passions to make a difference.
					</p>
					<h2 className="text-2xl font-bold text-neutral mb-4">The Okapi Store</h2>
					<p className="mb-4">
						I&quot;ve recently been working on creating a web shop that sells Okapi-themed items. From ethically sourced and durable shirts to innovative products, my goal is to raise awareness and support Okapi conservation efforts.
					</p>
					<p className="mb-4">
						Every purchase contributes to Okapi conservation projects, helping to protect these magnificent creatures and their habitat.
					</p>
				</div>
			</div>

			<div className="mt-8">
				<h2 className="text-2xl font-bold text-neutral mb-4">My Okapi Connection</h2>
				<div className="grid md:grid-cols-3 gap-4">
					<img
						src="/images/okapi-antwerp-zoo.jpg"
						alt="Okapi at Antwerp Zoo"
						width={300}
						height={200}
						className="active w-full h-full object-cover"
					/>
					<img
						src="/images/okapi-tattoo.jpg"
						alt="Senne's Okapi Tattoo"
						width={300}
						height={200}
						className="active w-full h-full object-cover"
					/>
					<img
						src="/images/okapi-wild.jpg"
						alt="Okapi in the Wild"
						width={300}
						height={200}
						className="active w-full h-full object-cover"
					/>
				</div>
				<p className="mt-4">
					My connection to Okapis runs deep. I even have an Okapi tattoo as a permanent reminder of my commitment to these incredible animals.
				</p>
			</div>
		</div>
	)
}