// netlify/functions/proxy-pdf.js
// Función Netlify para hacer proxy de PDFs y evitar CORS

exports.handler = async (event, context) => {
  // Solo permitir GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { url } = event.queryStringParameters;
    
    if (!url || !url.startsWith('https://firebasestorage.googleapis.com/')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL de Firebase Storage requerida' })
      };
    }

    // Hacer fetch del PDF desde Firebase Storage
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error al obtener PDF' })
      };
    }

    const pdfBuffer = await response.arrayBuffer();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': 'https://papirodigital.net.ar',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=3600'
      },
      body: Buffer.from(pdfBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error en proxy PDF:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};