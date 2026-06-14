import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// ❌ DO NOT IMPORT FROM '@prisma/client'
// import { PrismaClient } from '@prisma/client'; 

// IMPORT FROM YOUR CUSTOM GENERATED PATH
// (Adjust the number of dots '../' depending on where your config file is relative to 'generated')
import { PrismaClient } from '../generated/prisma/client';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };