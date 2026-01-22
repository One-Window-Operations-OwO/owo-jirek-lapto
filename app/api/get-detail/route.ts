import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { npsn, session_id, no_bapp } = await request.json();

    if (!npsn || !session_id) {
      return NextResponse.json(
        { success: false, message: "NPSN atau Session missing" },
        { status: 400 },
      );
    }
    const headers = {
      Accept: "application/json, text/plain, */*",
      Cookie: `token=${session_id}`,
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
      Origin: "https://kemendikdasmen.zyrex.com",
      Referer: "https://kemendikdasmen.zyrex.com/",
    };

    // TAHAP 1: Cari data BAPP berdasarkan NPSN untuk mendapatkan nomor_resi
    const searchUrl = `https://api.kemendikdasmen.zyrex.com/api/bapp/?page=1&limit=50&status=&jenjang=SD&search=${npsn}`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();

    // Pastikan ada data yang ditemukan
    if (!searchData || searchData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Data BAPP tidak ditemukan untuk NPSN ini",
      });
    }

    const bappSummary = searchData.find((item: any) => {
      // Jika no_bapp disediakan, cocokkan juga
      if (no_bapp) {
        return item.bapp_id === no_bapp;
      } else {
        return true;
      }
    });

    const noResi = bappSummary.nomor_resi;
    const bappIdUnique = bappSummary.ID; // ID: 35900
    const bappIdString = bappSummary.bapp_id; // ZMB/02/50046

    // TAHAP 2: Hit detail lengkap (AWB untuk foto, dan Comment untuk log approval) secara paralel
    const [resAwb, resComment] = await Promise.all([
      fetch(`https://api.kemendikdasmen.zyrex.com/api/awb/${noResi}`, {
        headers,
      }),
      fetch(
        `https://api.kemendikdasmen.zyrex.com/api/comment/${encodeURIComponent(bappIdString)}`,
        { headers },
      ).catch(() => null),
    ]);

    const awbDetail = await resAwb.json().catch(() => ({}));
    const comments = resComment ? await resComment.json().catch(() => []) : [];
    return NextResponse.json({
      success: true,
      data: {
        summary: bappSummary, // Berisi school_name, provinsi, kabupaten
        awb: awbDetail, // Berisi ListPhotoJSON dan History logistik
        comments: comments, // Berisi riwayat catatan approval
        extractedId: bappIdUnique,
      },
    });
  } catch (error: any) {
    console.error("Zyrex Detail Flow Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
