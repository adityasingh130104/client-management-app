const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// -----------------------------
// JSON File Storage
// -----------------------------

console.log('Using persistent JSON file storage (data/clients.json)');

const DATA_DIR = './data';
const DATA_PATH = `${DATA_DIR}/clients.json`;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let clients = [];
let nextId = 3;

// Load data
function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
      clients = data.clients || [];
      nextId = data.nextId || 3;
      console.log(`Loaded ${clients.length} clients`);
    } else {

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
          createdAt: new Date().toISOString(),
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
    }
  } catch (error) {
    console.error('Load error:', error);
    clients = [];
  }
}

// Save data
function saveData() {
  try {
    const data = { clients, nextId };
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Save error:', error);
  }
}

loadData();


// -----------------------------
// API ROUTES
// -----------------------------

// GET all clients
app.get('/api/clients', (req, res) => {
  try {
    const sorted = [...clients].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: 'Fetch error' });
  }
});


// ADD client
app.post('/api/clients', (req, res) => {
  try {
    const { name, phone, weight, joiningDate, expiryDate, totalFee, amountPaid = 0 } = req.body;

    if (!name || !phone || !joiningDate || !expiryDate || totalFee === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
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


// ADD PAYMENT
app.put('/api/clients/:id/pay', (req, res) => {
  try {

    const index = clients.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Client not found' });

    const amount = Number(req.body.amount);

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' });

    clients[index].amountPaid += amount;
    clients[index].updatedAt = new Date();

    saveData();

    res.json(clients[index]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// EXTEND MEMBERSHIP
app.put('/api/clients/:id/extend', (req, res) => {
  try {

    const index = clients.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Client not found' });

    const newDate = req.body.newDate;
    if (!newDate) return res.status(400).json({ message: 'Date required' });

    clients[index].expiryDate = newDate;
    clients[index].updatedAt = new Date();

    saveData();

    res.json(clients[index]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE CLIENT
app.delete('/api/clients/:id', (req, res) => {
  try {

    const index = clients.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Client not found' });

    clients.splice(index, 1);

    saveData();

    res.json({ message: 'Client deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// FULL EDIT
app.put('/api/clients/:id', (req, res) => {
  try {

    const index = clients.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Client not found' });

    const { name, phone, weight, joiningDate, expiryDate, totalFee, amountPaid } = req.body;

    clients[index] = {
      ...clients[index],
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

    res.json(clients[index]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// EXPORT APP (required for Vercel)
module.exports = app;