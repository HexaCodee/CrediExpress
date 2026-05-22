import jwt from 'jsonwebtoken';

const secret = 'E$3cr3tK3yF0rKln4lSp0rts@In6am2024';
const url = 'http://localhost:3007/crediExpress/v1/core-banking/transfers';
const token = jwt.sign({ sub: 'test-user', role: 'CLIENT', name: 'Test User' }, secret, {
  issuer: 'CrediExpress',
  audience: 'CrediExpress',
  expiresIn: '1h',
});
const body = {
  fromAccountNumber: '5268268191',
  toAccountNumber: '5973169620',
  amount: 10,
  description: 'Test transfer',
};

const run = async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error(err);
  }
};

run();
