'use client';

import { useState, useEffect } from 'react';


interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CityLead {
  id: string;
  fields: {
    Email?: string;
    'First Name'?: string;
    'Last Name'?: string;
    LinkedIn?: string;
    City?: string;
    Attachments?: Attachment[];
    [key: string]: any;
  };
  createdTime: string;
}

export default function Home() {
  const [leads, setLeads] = useState<CityLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/city-leads');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setLeads(data.records || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getFullName = (lead: CityLead) => {
    const firstName = lead.fields['First Name'] || '';
    const lastName = lead.fields['Last Name'] || '';
    return [firstName, lastName].filter(Boolean).join(' ') || '-';
  };

  return (
    <div className="min-h-screen p-8">
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Full size"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">City Leads Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage city leads from Airtable
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md text-red-700 dark:text-red-100">
            <p>Error: {error}</p>
            <p className="text-sm mt-2">
              Make sure your API key is correctly set in the .env.local file.
            </p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p>No city leads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">City</th>
                  <th className="p-4 text-left font-semibold">LinkedIn</th>
                  <th className="p-4 text-left font-semibold">Attachments</th>
                  <th className="p-4 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-4 font-medium">{getFullName(lead)}</td>
                    <td className="p-4">
                      <a 
                        href={`mailto:${lead.fields.Email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {lead.fields.Email || '-'}
                      </a>
                    </td>
                    <td className="p-4">{lead.fields.City || '-'}</td>
                    <td className="p-4">
                      {lead.fields.LinkedIn ? (
                        <a 
                          href={lead.fields.LinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Profile
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {lead.fields.Attachments && lead.fields.Attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {lead.fields.Attachments.map((attachment) => (
                            <div 
                              key={attachment.id}
                              className="relative group cursor-pointer"
                              onClick={() => setSelectedImage(attachment.url)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={attachment.url}
                                alt={attachment.filename}
                                className="w-12 h-12 object-cover rounded-md hover:opacity-75 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(lead.createdTime).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data sourced from Airtable - Build Club City Lead Database
          </p>
        </div>
      </main>
    </div>
  );
}
