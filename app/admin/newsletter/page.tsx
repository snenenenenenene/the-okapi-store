// app/admin/newsletter/page.tsx
'use client';

import { Download, Loader2, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Subscriber {
	id: string;
	email: string;
	status: string;
	createdAt: string;
}

export default function NewsletterAdmin() {
	const { data: session, status } = useSession();
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSubscribers = async () => {
			const response = await fetch('/api/newsletter/subscribers');
			const data = await response.json();
			setSubscribers(data);
			setLoading(false);
		};

		if (session?.user?.role === 'admin') {
			fetchSubscribers();
		}
	}, [session]);

	const downloadCsv = () => {
		const csvContent = [
			['Email', 'Status', 'Subscribed Date'],
			...subscribers.map(sub => [
				sub.email,
				sub.status,
				new Date(sub.createdAt).toLocaleDateString()
			])
		].map(row => row.join(',')).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
	};

	if (status === 'loading' || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	if (session?.user?.role !== 'admin') {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-error">Access denied</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-serif text-neutral">Newsletter Subscribers</h1>
				<div className="flex gap-2">
					<button
						onClick={downloadCsv}
						className="btn btn-outline btn-sm gap-2"
					>
						<Download size={16} />
						Export CSV
					</button>
				</div>
			</div>

			<div className="bg-base-100 rounded-lg shadow">
				<div className="overflow-x-auto">
					<table className="table">
						<thead>
							<tr>
								<th>Email</th>
								<th>Status</th>
								<th>Date</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{subscribers.map((sub) => (
								<tr key={sub.id}>
									<td>{sub.email}</td>
									<td>
										<span className={`badge ${sub.status === 'subscribed' ? 'badge-success' : 'badge-error'
											}`}>
											{sub.status}
										</span>
									</td>
									<td>{new Date(sub.createdAt).toLocaleDateString()}</td>
									<td>
										<button
											className="btn btn-ghost btn-sm"
											onClick={() => {/* Add email sending logic */ }}
										>
											<Send size={16} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}