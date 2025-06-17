// Script para probar que el email único funciona
// Ejecutar desde la consola del navegador en tu frontend

async function testUniqueEmail() {
  const testEmail = 'test@unique.com';
  
  try {
    // Primer intento - debe crear el usuario
    console.log('🔄 Creando primer usuario...');
    const user1 = await fetch('http://localhost:1337/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: testEmail,
          nombre: 'Usuario Test 1',
          tipo: 'invitado'
        }
      })
    });
    
    const result1 = await user1.json();
    console.log('✅ Primer usuario creado:', result1);
    
    // Segundo intento - debe fallar por email duplicado
    console.log('🔄 Intentando crear segundo usuario con mismo email...');
    const user2 = await fetch('http://localhost:1337/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: testEmail,
          nombre: 'Usuario Test 2',
          tipo: 'invitado'
        }
      })
    });
    
    const result2 = await user2.json();
    
    if (user2.status === 400) {
      console.log('✅ Email único funcionando - Error esperado:', result2);
    } else {
      console.log('❌ Email único NO funcionando - Usuario duplicado creado:', result2);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
// testUniqueEmail();
