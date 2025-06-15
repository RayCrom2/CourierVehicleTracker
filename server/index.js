// server/index.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

// --- Simple login endpoint (mocked) ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const company = await prisma.company.findUnique({ where: { email } });
  if (!company || password !== 'test123') return res.sendStatus(401);

  const token = jwt.sign({ companyId: company.id }, JWT_SECRET);
  res.json({ token });
});

// --- Middleware to check auth ---
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.companyId = user.companyId;
    next();
  });
}

// --- Save objects on the grid ---
app.post('/grid', authenticate, async (req, res) => {
  const { objects } = req.body;
  await prisma.gridObject.deleteMany({ where: { companyId: req.companyId } });
  for (const obj of objects) {
    await prisma.gridObject.create({
      data: {
        companyId: req.companyId,
        type: obj.type,
        x: obj.x,
        y: obj.y,
        metadata: obj.metadata,
      }
    });
  }
  res.sendStatus(200);
});

// --- Load grid objects ---
app.get('/grid', authenticate, async (req, res) => {
  const objects = await prisma.gridObject.findMany({ where: { companyId: req.companyId } });
  res.json(objects);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
