# Dominio de prueba y configuración
# Si tienes problemas con papirodigital.net.ar, usa el dominio por defecto de Netlify

## Para encontrar tu dominio por defecto:
1. Ve a: https://app.netlify.com/sites/papirodigital/settings/domain
2. Busca algo como: papirodigital-abc123.netlify.app
3. Prueba el sitio ahí primero

## Problemas comunes con dominios personalizados:

### 1. DNS no configurado correctamente
- El dominio papirodigital.net.ar debe apuntar a Netlify
- Registros CNAME o A records mal configurados

### 2. Certificado SSL pendiente
- Netlify no ha podido generar certificado para el dominio personalizado
- Puede tomar hasta 24 horas

### 3. Dominio no verificado
- El dominio puede estar agregado pero no verificado en Netlify

## Solución temporal:
Usa el dominio por defecto de Netlify (.netlify.app) para probar que todo funciona.

## Solución permanente:
1. Verifica configuración DNS del dominio
2. Re-configura el dominio personalizado en Netlify
3. Espera a que se genere el certificado SSL