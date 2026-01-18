import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/stats - Dashboard istatistikleri
export async function GET(request: NextRequest) {
  try {
    // Firma sayıları
    const [totalCompanies, activeCompanies] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
    ]);

    // Ödeme durumlarına göre sayılar ve tutarlar
    const [paidPayments, pendingPayments, overduePayments] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PENDING" },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "OVERDUE" },
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    // Son ödemeler
    const recentPayments = await prisma.payment.findMany({
      where: { status: "PAID" },
      include: {
        company: { select: { name: true } },
      },
      orderBy: { paidDate: "desc" },
      take: 5,
    });

    // Firma bazlı özet
    const companySummaries = await prisma.company.findMany({
      where: { isActive: true },
      include: {
        payments: {
          orderBy: { dueDate: "desc" },
          take: 1,
        },
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const stats = {
      totalCompanies,
      activeCompanies,
      totalPaid: paidPayments._count,
      totalPending: pendingPayments._count,
      totalOverdue: overduePayments._count,
      paidAmount: paidPayments._sum.amount || 0,
      pendingAmount: pendingPayments._sum.amount || 0,
      overdueAmount: overduePayments._sum.amount || 0,
      recentPayments,
      companySummaries: companySummaries.map((c) => ({
        id: c.id,
        name: c.name,
        floor: c.floor,
        unit: c.unit,
        rentAmount: c.rentAmount,
        lastPaymentStatus: c.payments[0]?.status || null,
        paymentCount: c._count.payments,
      })),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "İstatistikler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
