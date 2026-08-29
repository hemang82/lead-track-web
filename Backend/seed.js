const Database = require('better-sqlite3');
const path = require('path');
const moment = require('moment');

const dbPath = path.resolve(__dirname, 'leads.db');
const db = new Database(dbPath);

console.log("Database connection done...");

try {
   
    require('./config/schema'); 
    console.log("Tables check done...");

    // 1. Check kariye ke user already che ke nai, jethi varam-var run karva thi error na aave
    let userId;
    const existingUser = db.prepare(`SELECT id FROM users WHERE email = 'admin@gmail.com'`).get();
    
    const timeNow = moment().utc().format("YYYY-MM-DD HH:mm:ss");

    if (existingUser) {
        userId = existingUser.id;
        console.log("Dummy user pehla thi j database ma che. ID:", userId);
    } else {
        const insertUser = db.prepare(`INSERT INTO users (name, email, password, is_active, created_at) VALUES (@name, @email, @password, 1, @created_at)`);
        
        const userRes = insertUser.run({
            name: "Admin User",
            email: "admin@gmail.com",
            password: "password123", // dummy password
            created_at: timeNow
        });
        userId = userRes.lastInsertRowid;
        console.log("Dummy user add thai gyo. ID:", userId);
    }

    const insertLead = db.prepare(`INSERT INTO leads (user_id, name, email, phone, source, status, description, created_at) VALUES (@user_id, @name, @email, @phone, @source, @status, @description, @created_at)`);
    
    const leadsData = [
        { name: "Rahul Patel", email: "rahul.p@example.com", phone: "9876543210", source: "Website", status: "new", description: "Looking for software" },
        { name: "Amit Shah", email: "amit.shah@gmail.com", phone: "9988776655", source: "Referral", status: "contacted", description: "Needs CRM tool" },
        { name: "Priya Desai", email: "priya123@yahoo.com", phone: "9898989898", source: "Social Media", status: "qualified", description: "Interested in demo" },
        { name: "Sneha Mehta", email: "sneha.m@test.com", phone: "8877665544", source: "Website", status: "lost", description: "Budget issues" },
        { name: "Vikas Joshi", email: "vikas.j@example.com", phone: "7766554433", source: "Cold Call", status: "new", description: "Call again next week" }
    ];

    let leadIds = [];
    for (let lead of leadsData) {
        lead.user_id = userId;
        lead.created_at = timeNow;
        let res = insertLead.run(lead);
        leadIds.push(res.lastInsertRowid);
    }
    console.log(leadIds.length + " Dummy leads add thai gai...");

    const insertNote = db.prepare(`INSERT INTO notes (lead_id, user_id, content, created_at) VALUES (@lead_id, @user_id, @content, @created_at)`);
    
    insertNote.run({ lead_id: leadIds[0], user_id: userId, content: "Tried calling, no response yet.", created_at: timeNow });
    insertNote.run({ lead_id: leadIds[1], user_id: userId, content: "Asked for a quotation.", created_at: timeNow });
    insertNote.run({ lead_id: leadIds[2], user_id: userId, content: "Demo scheduled for tomorrow.", created_at: timeNow });
    insertNote.run({ lead_id: leadIds[2], user_id: userId, content: "Sent demo link on email.", created_at: timeNow });

    console.log("Notes add thai gai...");
    
    console.log("Seed data injected successfully! Have tame database test kari shako cho.");

} catch (err) {
    console.error("Seed script error:", err.message);
} finally {
    db.close();
}
