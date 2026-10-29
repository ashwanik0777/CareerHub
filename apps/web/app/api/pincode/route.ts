import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pincode = searchParams.get('pincode');

  if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
    return NextResponse.json({ error: 'Invalid PIN code' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from postal API');
    }

    const data = await res.json();
    
    if (data && data.length > 0 && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      return NextResponse.json({
        city: postOffice.Block || postOffice.Region || postOffice.Name,
        district: postOffice.District,
        state: postOffice.State,
        country: postOffice.Country
      });
    }

    return NextResponse.json({ error: 'PIN code not found' }, { status: 404 });
  } catch (error) {
    console.error('Pincode fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
