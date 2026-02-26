// View complaints from Render database
const { Client } = require('pg');

const connectionString = 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db';

async function viewComplaints() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        const result = await client.query(`
            SELECT 
                complaint_number,
                citizen_name,
                citizen_mobile,
                title,
                category,
                status,
                created_at
            FROM complaints 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        if (result.rows.length === 0) {
            console.log('📭 No complaints found yet.');
        } else {
            console.log(`📊 Found ${result.rows.length} complaint(s):\n`);
            result.rows.forEach((row, i) => {
                console.log(`${i + 1}. ${row.complaint_number}`);
                console.log(`   Name: ${row.citizen_name}`);
                console.log(`   Mobile: ${row.citizen_mobile}`);
                console.log(`   Title: ${row.title}`);
                console.log(`   Category: ${row.category}`);
                console.log(`   Status: ${row.status}`);
                console.log(`   Created: ${row.created_at}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

viewComplaints();
