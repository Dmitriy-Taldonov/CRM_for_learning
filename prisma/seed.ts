import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@lms.com" },
    update: {
      status: "ACTIVE"
    },
    create: {
      email: "admin@lms.com",
      password: adminPassword,
      role: Role.ADMIN,
      status: "ACTIVE"
    },
  });

  console.log({ admin });

  // Create Sample Course
  const course = await prisma.course.create({
    data: {
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript.",
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      modules: {
        create: [
          {
            title: "Getting Started",
            order: 1,
            lessons: {
              create: [
                {
                  title: "What is the Web?",
                  order: 1,
                  contents: {
                    create: [
                      {
                        type: "TEXT",
                        content: { text: "The World Wide Web is a system of interconnected documents..." },
                        order: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed data created successfully:", { courseId: course.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
