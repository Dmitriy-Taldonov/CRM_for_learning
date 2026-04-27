async function testQuizApi() {
  const url = `http://localhost:3000/api/admin/quizzes`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, { method: 'POST', body: '{}' });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log("Response starts with:", text.substring(0, 500));
  } catch (error) {
    console.error("Error:", error);
  }
}

testQuizApi();
