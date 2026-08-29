const request = require('supertest');
const app = require('../index'); // Aapnu main Express server ahiya thi aavshe

describe('Leads API Testing (Human Written)', () => {

    // Test 1: List API perfect chale che ke nai
    it('Should fetch all leads and return 200 status', async () => {
        // API ne call kariye ane header ma API key pass kariye
        const response = await request(app)
            .get('/api/leads')
            .set('api-key', process.env.API_KEY); // Auth error solve karva

        // Check kariye ke status 200 aavyo che ke nai
        expect(response.status).toBe(200);
        
        // Check kariye ke response.body.data ma leads aavyo che
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('leads');
        expect(Array.isArray(response.body.data.leads)).toBe(true);
    });

    // Test 2: Error handle thay che ke nai (Khoto ID nakhiye to 404 aavvu joiye)
    it('Should return 404 for invalid lead ID', async () => {
        // 99999 ID vadi lead database ma nathi
        const response = await request(app)
            .get('/api/leads/99999')
            .set('api-key', process.env.API_KEY); // Auth error solve karva
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Lead details not found");
    });

});
