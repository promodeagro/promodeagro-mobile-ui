import sql from "@/app/api/utils/sql";

// Google Maps API Integration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode';

async function logApiUsage(provider, endpoint, requestData, responseStatus, responseTime, errorMessage = null, cost = 0.002) {
  try {
    await sql`
      INSERT INTO api_usage_logs (api_provider, endpoint, request_data, response_status, response_time, error_message, cost_estimate)
      VALUES (${provider}, ${endpoint}, ${JSON.stringify(requestData)}, ${responseStatus}, ${responseTime}, ${errorMessage}, ${cost})
    `;
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

async function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine formula to calculate distance between two points
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function findNearbyStores(lat, lng, radiusKm = 25) {
  const stores = await sql`
    SELECT 
      id, store_name, store_type, latitude, longitude, address, phone,
      operating_hours, services, is_active, max_delivery_radius
    FROM store_locations
    WHERE is_active = true
      AND ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radiusKm * 1000}
      )
    ORDER BY ST_Distance(
      ST_MakePoint(longitude, latitude)::geography,
      ST_MakePoint(${lng}, ${lat})::geography
    )
    LIMIT 10
  `.catch(async () => {
    // Fallback if PostGIS is not available
    const allStores = await sql`
      SELECT 
        id, store_name, store_type, latitude, longitude, address, phone,
        operating_hours, services, is_active, max_delivery_radius
      FROM store_locations
      WHERE is_active = true
    `;
    
    return allStores.filter(store => {
      const distance = calculateDistance(lat, lng, store.latitude, store.longitude);
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = calculateDistance(lat, lng, a.latitude, a.longitude);
      const distB = calculateDistance(lat, lng, b.latitude, b.longitude);
      return distA - distB;
    });
  });

  // Add calculated distance to each store
  return stores.map(store => ({
    ...store,
    distance: calculateDistance(lat, lng, store.latitude, store.longitude)
  }));
}

async function getDeliveryZones(lat, lng) {
  // Simple polygon check - in production you'd use PostGIS ST_Contains
  const zones = await sql`
    SELECT 
      dz.*, sl.store_name
    FROM delivery_zones dz
    JOIN store_locations sl ON dz.store_id = sl.id
    WHERE dz.is_active = true
      AND sl.is_active = true
    ORDER BY dz.delivery_fee ASC
  `;
  
  // For simplicity, return zones where the point is within reasonable distance
  const nearbyZones = [];
  for (const zone of zones) {
    const store = await sql`
      SELECT latitude, longitude FROM store_locations WHERE id = ${zone.store_id}
    `;
    
    if (store.length > 0) {
      const distance = calculateDistance(lat, lng, store[0].latitude, store[0].longitude);
      if (distance <= 30) { // 30km radius
        nearbyZones.push({
          ...zone,
          distance,
          estimated_delivery_time: Math.max(zone.estimated_delivery_time, Math.floor(distance * 2)) // 2 min per km base
        });
      }
    }
  }
  
  return nearbyZones.sort((a, b) => a.distance - b.distance);
}

async function getLocationOffers(lat, lng) {
  const offers = await sql`
    SELECT *
    FROM location_offers
    WHERE is_active = true
      AND starts_at <= NOW()
      AND expires_at > NOW()
      AND current_uses < total_max_uses
    ORDER BY discount_value DESC
  `;
  
  const validOffers = [];
  
  for (const offer of offers) {
    const criteria = offer.location_criteria;
    
    if (offer.offer_type === 'radius') {
      const distance = calculateDistance(lat, lng, criteria.lat, criteria.lng);
      if (distance <= criteria.radius) {
        validOffers.push({
          ...offer,
          distance
        });
      }
    } else if (offer.offer_type === 'city') {
      // For city-wide offers, you'd typically check against city boundaries
      // For now, we'll include all city offers
      validOffers.push(offer);
    }
  }
  
  return validOffers;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const action = searchParams.get('action') || 'nearby';
    
    if (!lat || !lng) {
      return Response.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    let result = {};
    
    switch (action) {
      case 'nearby':
        const [nearbyStores, deliveryZones, locationOffers] = await Promise.all([
          findNearbyStores(latitude, longitude),
          getDeliveryZones(latitude, longitude),
          getLocationOffers(latitude, longitude)
        ]);
        
        result = {
          stores: nearbyStores,
          deliveryZones: deliveryZones,
          offers: locationOffers,
          location: { lat: latitude, lng: longitude }
        };
        break;
        
      case 'stores':
        result.stores = await findNearbyStores(latitude, longitude);
        break;
        
      case 'delivery':
        result.deliveryZones = await getDeliveryZones(latitude, longitude);
        break;
        
      case 'offers':
        result.offers = await getLocationOffers(latitude, longitude);
        break;
        
      default:
        return Response.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
    
    return Response.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Location API error:', error);
    return Response.json({
      error: 'Failed to fetch location data',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'save_location':
        return await saveUserLocation(data);
        
      case 'geocode':
        return await geocodeAddress(data);
        
      case 'reverse_geocode':
        return await reverseGeocode(data);
        
      case 'place_details':
        return await getPlaceDetails(data);
        
      case 'autocomplete':
        return await autocompletePlace(data);
        
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Location POST error:', error);
    return Response.json({
      error: 'Failed to process location request',
      details: error.message
    }, { status: 500 });
  }
}

async function saveUserLocation(data) {
  const { userId, locationType, name, latitude, longitude, formattedAddress, placeId, components, isDefault, deliveryNotes } = data;
  
  if (!userId || !latitude || !longitude) {
    throw new Error('User ID, latitude, and longitude are required');
  }
  
  // If setting as default, unset other default locations
  if (isDefault) {
    await sql`
      UPDATE user_locations 
      SET is_default = false 
      WHERE user_id = ${userId} AND location_type = ${locationType}
    `;
  }
  
  const result = await sql`
    INSERT INTO user_locations (
      user_id, location_type, name, latitude, longitude, formatted_address, 
      place_id, components, is_default, delivery_notes
    ) VALUES (
      ${userId}, ${locationType || 'home'}, ${name || 'My Location'}, 
      ${latitude}, ${longitude}, ${formattedAddress || ''}, ${placeId || null}, 
      ${JSON.stringify(components || {})}, ${isDefault || false}, ${deliveryNotes || null}
    ) RETURNING *
  `;
  
  return Response.json({
    success: true,
    data: result[0]
  });
}

async function geocodeAddress(data) {
  const { address } = data;
  
  if (!address) {
    throw new Error('Address is required');
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API not configured');
  }
  
  const startTime = Date.now();
  
  try {
    const url = `${GOOGLE_GEOCODING_BASE_URL}/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      await logApiUsage('google_places', 'geocode', { address }, response.status, responseTime, `HTTP ${response.status}`);
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    await logApiUsage('google_places', 'geocode', { address }, response.status, responseTime);
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
    
    const result = data.results[0];
    const location = result.geometry.location;
    
    return Response.json({
      success: true,
      data: {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        components: result.address_components,
        types: result.types
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiUsage('google_places', 'geocode', { address }, 500, responseTime, error.message);
    throw error;
  }
}

async function reverseGeocode(data) {
  const { lat, lng } = data;
  
  if (!lat || !lng) {
    throw new Error('Latitude and longitude are required');
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API not configured');
  }
  
  const startTime = Date.now();
  
  try {
    const url = `${GOOGLE_GEOCODING_BASE_URL}/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      await logApiUsage('google_places', 'reverse_geocode', { lat, lng }, response.status, responseTime, `HTTP ${response.status}`);
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    await logApiUsage('google_places', 'reverse_geocode', { lat, lng }, response.status, responseTime);
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    }
    
    const result = data.results[0];
    
    return Response.json({
      success: true,
      data: {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        components: result.address_components,
        types: result.types
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiUsage('google_places', 'reverse_geocode', { lat, lng }, 500, responseTime, error.message);
    throw error;
  }
}

async function autocompletePlace(data) {
  const { input, location, radius = 50000 } = data;
  
  if (!input) {
    throw new Error('Input is required');
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API not configured');
  }
  
  const startTime = Date.now();
  
  try {
    let url = `${GOOGLE_PLACES_BASE_URL}/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=${radius}`;
    }
    
    url += '&components=country:in'; // Restrict to India
    
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      await logApiUsage('google_places', 'autocomplete', { input, location }, response.status, responseTime, `HTTP ${response.status}`);
      throw new Error(`Places autocomplete API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    await logApiUsage('google_places', 'autocomplete', { input, location }, response.status, responseTime);
    
    if (data.status !== 'OK') {
      throw new Error(`Places autocomplete failed: ${data.status}`);
    }
    
    return Response.json({
      success: true,
      data: {
        predictions: data.predictions.map(prediction => ({
          placeId: prediction.place_id,
          description: prediction.description,
          matchedSubstrings: prediction.matched_substrings,
          structuredFormatting: prediction.structured_formatting,
          types: prediction.types
        }))
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiUsage('google_places', 'autocomplete', { input, location }, 500, responseTime, error.message);
    throw error;
  }
}

async function getPlaceDetails(data) {
  const { placeId, fields = ['geometry', 'formatted_address', 'name', 'types'] } = data;
  
  if (!placeId) {
    throw new Error('Place ID is required');
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API not configured');
  }
  
  const startTime = Date.now();
  
  try {
    const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=${fields.join(',')}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      await logApiUsage('google_places', 'place_details', { placeId }, response.status, responseTime, `HTTP ${response.status}`);
      throw new Error(`Place details API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    await logApiUsage('google_places', 'place_details', { placeId }, response.status, responseTime);
    
    if (data.status !== 'OK') {
      throw new Error(`Place details failed: ${data.status}`);
    }
    
    const place = data.result;
    
    return Response.json({
      success: true,
      data: {
        placeId: placeId,
        name: place.name,
        formattedAddress: place.formatted_address,
        location: place.geometry?.location,
        types: place.types
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logApiUsage('google_places', 'place_details', { placeId }, 500, responseTime, error.message);
    throw error;
  }
}