// generate-hash.js
const bcrypt = require('bcrypt');

async function generateHashes() {
    const passwordAdmin = 'Admin123*';
    const passwordWrussi = 'Colombia9.'; // La contraseña de texto plano para wrussi

    const saltRounds = 10; // Un buen número de rondas para bcrypt

    const hashedAdminPassword = await bcrypt.hash(passwordAdmin, saltRounds);
    const hashedWrussiPassword = await bcrypt.hash(passwordWrussi, saltRounds);

    console.log(`Hash para 'Admin123*': ${hashedAdminPassword}`);
    console.log(`Hash para 'Colombia9.': ${hashedWrussiPassword}`);
}

generateHashes();