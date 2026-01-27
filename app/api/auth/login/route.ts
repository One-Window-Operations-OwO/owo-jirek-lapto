import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, type } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 },
      );
    }

    // --- LOGIKA LOGIN DAC (DIUBAH KE API ZYREX) ---
    if (type === "dac") {
      const loginUrl = `https://api.kemendikdasmen.zyrex.com/auth/login`;

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
          Origin: "https://kemendikdasmen.zyrex.com",
          Referer: "https://kemendikdasmen.zyrex.com/",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));
      const setCookieHeader = response.headers.get("set-cookie");

      // API Zyrex mengembalikan JSON. Kita cek keberhasilan berdasarkan status atau properti data.
      if (response.status !== 200) {
        return NextResponse.json({
          success: false,
          message: data.message || "Login Zyrex Gagal",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Login Zyrex Berhasil",
        cookie: setCookieHeader, // Mengirim header set-cookie (berisi token) ke client
        data: data,
      });
    }

    // --- LOGIKA LOGIN DATASOURCE (TIDAK DIUBAH / TETAP) ---
    if (type === "datasource") {
      const baseUrl = process.env.NEXT_PUBLIC_DATASOURCE_URL || "";
      const loginUrl = `${baseUrl}/auth/login`;

      if (!baseUrl) {
        return NextResponse.json(
          { success: false, message: "Configuration error: Missing Base URL" },
          { status: 500 },
        );
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("submit", ""); // Menjaga parameter submit tetap ada

      const response = await fetch(loginUrl, {
        method: "POST",
        body: formData,
        redirect: "manual",
      });

      const setCookieHeader = response.headers.get("set-cookie");
      const data = await response.json().catch(() => ({}));

      // Verifikasi Session Cookie
      const match = setCookieHeader?.match(/ci_session=([^;]+)/);
      const cookie = match ? match[1] : "";

      if (!cookie) {
        return NextResponse.json({
          success: false,
          message: "Login failed (No session cookie)",
        });
      }

      // Verifikasi Nama User via Scraping HTML
      const verifyUrl = `${baseUrl}/view_form/84817`;
      const verifyRes = await fetch(verifyUrl, {
        headers: {
          Cookie: `ci_session=${cookie}`,
        },
      });

      let html = await verifyRes.text();
      let name = html.match(/<span\s+class="admin-name">\s*(.*?)\s*<\/span>/i);

      let result = name?.[1] ?? null;

      if (!result) {
        return NextResponse.json({
          success: false,
          message: "Login verification failed",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Login successful",
        cookie: setCookieHeader,
        data: data,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
