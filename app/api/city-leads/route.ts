/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Airtable from 'airtable';

interface AirtableRecord {
  id: string;
  fields: {
    Email?: string;
    'First Name'?: string;
    'Last Name'?: string;
    LinkedIn?: string;
    City?: string;
    Attachments?: Array<{
      id: string;
      url: string;
      filename: string;
      size: number;
      type: string;
    }>;
    [key: string]: any;
  };
  createdTime: string;
}

export async function GET() {
  try {
    // Initialize Airtable with API key from environment variables
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = 'appNETNphSQEogK9M';
    
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Airtable API key is not configured' }),
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const base = new Airtable({ apiKey }).base(baseId);
    
    // Fetch records from the database
    const records = await new Promise<AirtableRecord[]>((resolve, reject) => {
      const allRecords: AirtableRecord[] = [];
      
      base('Build Club City Lead Database')
        .select({
          view: "Grid view"
        })
        .eachPage(
          function page(pageRecords: Airtable.Records<any>, fetchNextPage: () => void) {
            // Process records and ensure we get the full attachment data
            pageRecords.forEach(record => {
              const processedRecord = {
                ...record._rawJson,
                fields: {
                  ...record._rawJson.fields,
                  // Ensure attachments are properly processed
                  Attachments: record.get('Attachments') as Array<{
                    id: string;
                    url: string;
                    filename: string;
                    size: number;
                    type: string;
                  }>
                }
              };
              allRecords.push(processedRecord);
            });
            
            fetchNextPage();
          },
          function done(err: Error | null) {
            if (err) {
              reject(err);
              return;
            }
            resolve(allRecords);
          }
        );
    });

    // Return all records with CORS headers
    return new NextResponse(JSON.stringify({ records }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch data from Airtable' }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 