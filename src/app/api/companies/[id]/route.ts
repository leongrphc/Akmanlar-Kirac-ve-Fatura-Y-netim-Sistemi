import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/companies/[id] - Firma detayı
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        payments: {
          orderBy: { dueDate: "desc" },
        },
        invoices: {
          orderBy: { uploadedAt: "desc" },
        },
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Firma bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { success: false, error: "Firma yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Firma güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name: body.name,
        floor: body.floor,
        unit: body.unit,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        rentAmount: body.rentAmount,
        rentDueDay: body.rentDueDay,
      },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { success: false, error: "Firma güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Firma sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Firma başarıyla silindi",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { success: false, error: "Firma silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
