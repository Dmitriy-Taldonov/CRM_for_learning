import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const courses = await prisma.course.findMany({
    include: {
        _count: {
            select: { modules: true }
        }
    }
  });
  console.log("All courses in DB:", JSON.stringify(courses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
