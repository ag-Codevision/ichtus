async function test() {
  const res = await fetch("http://localhost:3005/api/v1/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@glessios.com.br",
      password: "Admin@Glessios2026!",
    }),
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
