import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

// GET /api/companies - Tüm firmaları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePayments = searchParams.get("includePayments") === "true";

    const companies = await prisma.company.findMany({
      where: { isActive: true },
      include: includePayments
        ? {
            payments: {
              orderBy: { dueDate: "desc" },
              take: 5,
            },
            _count: { select: { payments: true } },
          }
        : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { success: false, error: "Firmalar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Yeni firma ve kullanıcı ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // E-posta kontrolü
    if (body.userEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.userEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Bu e-posta adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Firma oluştur
    const company = await prisma.company.create({
      data: {
        name: body.name,
        floor: body.floor || null,
        unit: body.unit || null,
        contactName: body.contactName || null,
        contactPhone: body.contactPhone || null,
        contactEmail: body.contactEmail || null,
        rentAmount: body.rentAmount,
        rentDueDay: body.rentDueDay || 1,
      },
    });

    // Kullanıcı bilgileri varsa kiracı hesabı oluştur
    let user = null;
    if (body.userEmail && body.userPassword) {
      const hashedPassword = await hash(body.userPassword, 12);

      user = await prisma.user.create({
        data: {
          email: body.userEmail,
          password: hashedPassword,
          name: body.contactName || body.name,
          role: "TENANT",
          companyId: company.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: company,
        user: user ? { id: user.id, email: user.email, name: user.name } : null,
        message: user
          ? "Firma ve kullanıcı hesabı oluşturuldu"
          : "Firma oluşturuldu",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { success: false, error: "Firma oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
