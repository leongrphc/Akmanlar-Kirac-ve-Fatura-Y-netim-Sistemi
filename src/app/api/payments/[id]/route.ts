import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/payments/[id]/pay - Ödeme yap
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const body = await request.json();

    // Mevcut ödemeyi bul
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: "Ödeme bulunamadı" },
        { status: 404 }
      );
    }

    if (existingPayment.status === "PAID") {
      return NextResponse.json(
        { success: false, error: "Bu ödeme zaten yapılmış" },
        { status: 400 }
      );
    }

    // Ödemeyi güncelle
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidDate: new Date(),
        paidAmount: existingPayment.amount,
        receiptUrl: body.receiptUrl || null,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: "Ödeme başarıyla alındı",
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, error: "Ödeme işlenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// GET /api/payments/[id] - Tek ödeme detayı
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        company: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Ödeme bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { success: false, error: "Ödeme yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
