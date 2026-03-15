const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json()); // Allows us to read JSON data sent from the frontend
app.use(cors()); // Allows the frontend to communicate with this server

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// MongoDB Atlas Connection (DISABLED - cluster unavailable)
    /*
mongoose.connect('mongodb+srv://gymadmin:gym123@gym-cluster.hlcca5b.mongodb.net/?appName=gym-cluster')
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection failed:', err));
    */

console.log('Using persistent JSON file storage (data/clients.json)');

// Persistent JSON storage
const DATA_DIR = './data';
const DATA_PATH = `${DATA_DIR}/clients.json`;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
      clients = data.clients || [];
      nextId = data.nextId || 3;
      console.log(`Loaded ${clients.length} clients from ${DATA_PATH}`);
    } else {
      // Init with sample data
      clients = [
        {
          _id: '1',
          name: 'John Doe',
          phone: '123-456-7890',
          weight: 75,
          joiningDate: '2024-01-01',
          expiryDate: '2024-12-31',
          totalFee: 1200,
          amountPaid: 600,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Jane Smith',
          phone: '098-765-4321',
          weight: 65,
          joiningDate: '2024-06-01',
          expiryDate: '2024-06-30',
          totalFee: 600,
          amountPaid: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      nextId = 3;
      saveData();
      console.log('Initialized sample data in', DATA_PATH);
    }
  } catch (error) {
    console.error('Load data error:', error);
    // Fallback to empty
    clients = [];
    nextId = 3;
  }
}

// Save data to file
function saveData() {
  try {
    const data = { clients, nextId };
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Save data error:', error);
  }
}

let clients = [];
let nextId = 3;

// Load data on startup
loadData();

// Removed simulateAsync - using real file persistence



// 3. API Routes

// GET: Fetch all clients (in-memory)
app.get('/api/clients', async (req, res) => {
    try {
        const sortedClients = [...clients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sortedClients);
    } catch (error) {
        console.error('Fetch clients error:', error);
        res.status(500).json({ message: 'Server error - Failed to fetch clients' });
    }
});




// POST: Add a new client (in-memory)
app.post('/api/clients', async (req, res) => {
    try {
        const { name, phone, weight, joiningDate, expiryDate, totalFee, amountPaid = 0 } = req.body;
        if (!name || !phone || !joiningDate || !expiryDate || totalFee === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newClient = {
            _id: (nextId++).toString(),
            name,
            phone,
            weight: weight ? parseFloat(weight) : undefined,
            joiningDate,
            expiryDate,
            totalFee: parseFloat(totalFee),
            amountPaid: parseFloat(amountPaid),
            createdAt: new Date(),
            updatedAt: new Date()
        };


        clients.push(newClient);
        saveData();
        res.status(201).json(newClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// PUT: Add Payment (Update balance) (in-memory)
app.put('/api/clients/:id/pay', async (req, res) => {
    try {
        const clientIndex = clients.findIndex(c => c._id === req.params.id);
        if (clientIndex === -1) return res.status(404).send('Client not found');

        const amount = Number(req.body.amount);
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        clients[clientIndex].amountPaid += amount;
        clients[clientIndex].updatedAt = new Date();

        saveData();
        res.json(clients[clientIndex]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// PUT: Extend Membership (Update expiry date) (in-memory)
app.put('/api/clients/:id/extend', async (req, res) => {
    try {
        const clientIndex = clients.findIndex(c => c._id === req.params.id);
        if (clientIndex === -1) return res.status(404).send('Client not found');

        const newDate = req.body.newDate;
        if (!newDate) return res.status(400).json({ message: 'New date required' });

        clients[clientIndex].expiryDate = new Date(newDate);
        clients[clientIndex].updatedAt = new Date();

        saveData();
        res.json(clients[clientIndex]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE: Remove a client (in-memory)
app.delete('/api/clients/:id', async (req, res) => {
    try {
        const clientIndex = clients.findIndex(c => c._id === req.params.id);
        if (clientIndex === -1) return res.status(404).json({ message: 'Client not found' });

        clients.splice(clientIndex, 1);
        saveData();
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT: Full Edit Client (in-memory)
app.put('/api/clients/:id', async (req, res) => {
    try {
        const clientIndex = clients.findIndex(c => c._id === req.params.id);
        if (clientIndex === -1) return res.status(404).json({ message: 'Client not found' });

        const { name, phone, weight, joiningDate, expiryDate, totalFee, amountPaid } = req.body;
        if (!name || !phone || !joiningDate || !expiryDate || totalFee === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        clients[clientIndex] = {
            ...clients[clientIndex],
            name,
            phone,
            weight: weight ? parseFloat(weight) : undefined,
            joiningDate,
            expiryDate,
            totalFee: parseFloat(totalFee),
            amountPaid: parseFloat(amountPaid),
            updatedAt: new Date()
        };

        saveData();
        res.json(clients[clientIndex]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});