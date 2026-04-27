import { getSession } from "./lib/auth"; // this won't work easily from ts-node

async function testCoursesApi() {
  // We can't easily mock the session cookie in a simple fetch from script
  // But we can check what the API returns for an unauthenticated request
  const url = `http://localhost:3000/api/courses`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

testCoursesApi();
