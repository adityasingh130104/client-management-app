const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(cors());

// JSON File Storage
console.log('Using persistent JSON file storage');

const DATA_DIR = '../data';
const DATA_PATH = `${DATA_DIR}/clients.json`;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let clients = [];
let nextId = 3;

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
      clients = data.clients || [];
      nextId = data.nextId || 3;
    } else {
      clients = [
        { _id: '1', name: 'John Doe', phone: '123-456-7890', expiryDate: '2024-12-31', totalFee: 1200, amountPaid: 600 },
        { _id: '2', name: 'Jane Smith', phone: '098-765-4321', expiryDate: '2024-06-30', totalFee: 600, amountPaid: 0 }
      ];
      nextId = 3;
    }
  } catch (e) {
    clients = [];
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ clients, nextId }, null, 2));
  } catch (e) {}
}

loadData();

app.get('/clients', (req, res) => res.json([...clients].sort((a,b) => new Date(b.expiryDate) - new Date(a.expiryDate))));

app.post('/clients', (req, res) => {
  const newClient = { ...req.body, _id: (nextId++).toString() };
  clients.push(newClient);
  saveData();
  res.json(newClient);
});

app.put('/clients/:id/pay', (req, res) => {
  const index = clients.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    clients[index].amountPaid += Number(req.body.amount);
    saveData();
    res.json(clients[index]);
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    clients.splice(index, 1);
    saveData();
    res.json({ success: true });
  } else {
    res.status(404).send('Not found');
  }
});

module.exports = app;

