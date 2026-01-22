import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Tambahkan bapp_id ke destructuring (kirim ini dari client-side)
    const { status, id, note, session_id, bapp_id } = await request.json();

    // Validasi parameter
    if (!status || !id || !session_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters (id, status, or session_id)",
        },
        { status: 400 },
      );
    }

    const cookieHeader = session_id.startsWith("token=")
      ? session_id
      : `token=${session_id}`;

    // --- 1. HIT ENDPOINT APPROVAL ---
    const approvalPayload = {
      id: id.toString(),
      status: status,
      comments: note || "",
    };

    const approvalUrl =
      "https://api.kemendikdasmen.zyrex.com/api/bapp/approval";

    const approvalRes = await fetch(approvalUrl, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(approvalPayload),
    });

    if (!approvalRes.ok) {
      const errorText = await approvalRes.text();
      throw new Error(`Approval Error: ${approvalRes.status} - ${errorText}`);
    }

    if (bapp_id && note) {
      const commentPayload = {
        bapp_id: bapp_id,
        comment: note,
      };

      const commentUrl = "https://api.kemendikdasmen.zyrex.com/api/comment/";

      const commentRes = await fetch(commentUrl, {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
        },
        body: JSON.stringify(commentPayload),
      });

      if (!commentRes.ok) {
        console.warn("Comment API failed, but approval was successful.");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Approval/Comment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
