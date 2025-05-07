/**
 * API helper functions to handle common fetch operations and errors
 */

/**
 * Safely parse JSON from a response, with fallback for HTML responses
 * This specifically handles the "Unexpected token '<', "<!DOCTYPE "..." error
 */
export async function safeParseJSON(response: Response) {
  const text = await response.text();
  
  // Check if the response is HTML (starts with <!DOCTYPE or <html)
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    console.error('Received HTML instead of JSON:', text.substring(0, 150) + '...');
    return { 
      success: false, 
      error: 'Received HTML instead of JSON response. API endpoint may be incorrect or server error occurred.'
    };
  }
  
  // If empty response, return empty object
  if (!text.trim()) {
    return { success: false, error: 'Empty response from server' };
  }
  
  // Try to parse as JSON
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse response as JSON:', error);
    return { 
      success: false, 
      error: 'Invalid JSON response from server',
      rawResponse: text.substring(0, 150) + '...' // Include part of the raw response for debugging
    };
  }
}

/**
 * Safe fetch wrapper that handles common errors
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    const data = await safeParseJSON(response);
    
    if (!response.ok) {
      console.error(`API error (${response.status}):`, data);
    }
    
    return { response, data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { 
      response: null, 
      data: { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown fetch error' 
      } 
    };
  }
}
