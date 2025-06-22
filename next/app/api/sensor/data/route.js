// app/api/sensor/data/route.js

import { getDatabase } from '@/lib/database';

export async function POST(request) {
  const body = await request.json();
  const { suhu, kelembapan, cahaya } = body;

  if (typeof suhu !== 'number' || typeof kelembapan !== 'number' || typeof cahaya !== 'number') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid data format. Expected numbers for suhu, kelembapan, cahaya'
    }), { status: 400 });
  }

  if (suhu < -50 || suhu > 70 || kelembapan < 0 || kelembapan > 100) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Sensor values out of range'
    }), { status: 400 });
  }

  try {
    const db = await getDatabase();
    const result = await db.insertReading(suhu, kelembapan, cahaya);

    return new Response(JSON.stringify({
      success: true,
      message: 'Data received successfully',
      id: result.id,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { status: 500 });
  }
}


export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const hours = searchParams.get('hours');
    
    let data;
    if (hours) {
      data = await db.getReadingsByTimeRange(parseInt(hours));
    } else {
      data = await db.getLatestReadings(parseInt(limit));
    }

    return new Response(JSON.stringify({
      success: true,
      data: data,
      count: data.length
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch data'
    }), { status: 500 });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}


