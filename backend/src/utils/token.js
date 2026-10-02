import jwt from 'jsonwebtoken';

export function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add a long random value to backend/.env');
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add a long random value to backend/.env');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}
