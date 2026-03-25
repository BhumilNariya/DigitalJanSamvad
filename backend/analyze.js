const mongoose = require('mongoose');
require('dotenv').config();

async function analyze() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get database stats
    const stats = await db.stats();
    console.log('\n--- DATABASE STATS ---');
    console.log('Database Name:', stats.db);
    console.log('Collections:', stats.collections);
    
    // Get collections
    const collections = await db.listCollections().toArray();
    console.log('\n--- COLLECTIONS ---');
    
    for (let col of collections) {
      const colName = col.name;
      const count = await db.collection(colName).countDocuments();
      let indexInfo = '';
      try {
        const indexes = await db.collection(colName).indexes();
        indexInfo = indexes.map(idx => `${idx.name} [${Object.keys(idx.key).join(',')}] ${idx.unique ? 'UNIQUE' : ''}`).join(' | ');
      } catch(e) {}
      
      console.log(`\ncollection: ${colName}`);
      console.log(`  documents: ${count}`);
      if (indexInfo) console.log(`  indexes: ${indexInfo}`);
    }
    
    await mongoose.disconnect();
    console.log('\nDone.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
analyze();
