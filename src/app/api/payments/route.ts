import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/payments - Ödemeleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (type) where.type = type;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, floor: true, unit: true },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Ödemeler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Yeni ödeme oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payment = await prisma.payment.create({
      data: {
        companyId: body.companyId,
        type: body.type,
        amount: body.amount,
        dueDate: new Date(body.dueDate),
        period: body.period,
        description: body.description || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, error: "Ödeme oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
