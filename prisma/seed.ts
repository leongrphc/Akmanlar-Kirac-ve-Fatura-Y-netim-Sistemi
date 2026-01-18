import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı seed başlatılıyor...");

  // Admin kullanıcısı oluştur
  const adminPassword = await hash("demo123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@akmanlar.com" },
    update: {},
    create: {
      email: "admin@akmanlar.com",
      password: adminPassword,
      name: "Bina Yöneticisi",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin kullanıcısı oluşturuldu:", admin.email);

  // Demo firmalar
  const companiesData = [
    { name: "Teknoloji A.Ş.", floor: "3", unit: "301", contactName: "Ahmet Yılmaz", contactPhone: "0532 111 2233", contactEmail: "ahmet@teknoloji.com", rentAmount: 8000, rentDueDay: 1 },
    { name: "Danışmanlık Ltd.", floor: "2", unit: "205", contactName: "Mehmet Kaya", contactPhone: "0533 222 3344", contactEmail: "mehmet@danismanlik.com", rentAmount: 6500, rentDueDay: 5 },
    { name: "Yazılım Stüdyosu", floor: "4", unit: "402", contactName: "Elif Demir", contactPhone: "0534 333 4455", contactEmail: "elif@yazilim.com", rentAmount: 7500, rentDueDay: 1 },
    { name: "Mühendislik Ofisi", floor: "1", unit: "101", contactName: "Can Öztürk", contactPhone: "0535 444 5566", contactEmail: "can@muhendislik.com", rentAmount: 5500, rentDueDay: 10 },
    { name: "Hukuk Bürosu", floor: "5", unit: "501", contactName: "Av. Zeynep Aksoy", contactPhone: "0536 555 6677", contactEmail: "zeynep@hukuk.com", rentAmount: 9000, rentDueDay: 1 },
    { name: "Mimarlık Atölyesi", floor: "3", unit: "305", contactName: "Burak Şahin", contactPhone: "0537 666 7788", contactEmail: "burak@mimarlik.com", rentAmount: 6000, rentDueDay: 15 },
    { name: "Finans Grubu", floor: "6", unit: "601", contactName: "Selin Yıldız", contactPhone: "0538 777 8899", contactEmail: "selin@finans.com", rentAmount: 10000, rentDueDay: 1 },
    { name: "Medya Ajansı", floor: "2", unit: "202", contactName: "Kaan Arslan", contactPhone: "0539 888 9900", contactEmail: "kaan@medya.com", rentAmount: 5000, rentDueDay: 1 },
  ];

  for (const data of companiesData) {
    // Firma oluştur
    const company = await prisma.company.create({
      data: {
        name: data.name,
        floor: data.floor,
        unit: data.unit,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        rentAmount: data.rentAmount,
        rentDueDay: data.rentDueDay,
      },
    });
    console.log("✅ Firma oluşturuldu:", company.name);

    // Kiracı kullanıcısı oluştur
    const tenantPassword = await hash("demo123", 12);
    await prisma.user.create({
      data: {
        email: data.contactEmail,
        password: tenantPassword,
        name: data.contactName,
        role: "TENANT",
        companyId: company.id,
      },
    });

    // Son 3 ay için ödemeler oluştur
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const paymentDate = new Date(now.getFullYear(), now.getMonth() - i, data.rentDueDay);
      const period = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;

      // Kira ödemesi
      let status = "PENDING";
      let paidDate = null;
      let paidAmount = null;

      if (i > 0) {
        // Geçmiş aylar - çoğu ödendi
        if (Math.random() > 0.2) {
          status = "PAID";
          paidDate = new Date(paymentDate);
          paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 5));
          paidAmount = data.rentAmount;
        } else {
          status = "OVERDUE";
        }
      } else if (now.getDate() > data.rentDueDay) {
        // Bu ay, ödeme günü geçmiş
        if (Math.random() > 0.3) {
          status = "PAID";
          paidDate = new Date(now.getFullYear(), now.getMonth(), data.rentDueDay + 2);
          paidAmount = data.rentAmount;
        } else {
          status = "OVERDUE";
        }
      }

      await prisma.payment.create({
        data: {
          companyId: company.id,
          type: "RENT",
          amount: data.rentAmount,
          dueDate: paymentDate,
          paidDate,
          paidAmount,
          status,
          period,
          description: `${period} dönemi kira ödemesi`,
        },
      });

      // Elektrik ödemesi (rastgele tutar)
      const electricAmount = 300 + Math.floor(Math.random() * 400);
      await prisma.payment.create({
        data: {
          companyId: company.id,
          type: "ELECTRICITY",
          amount: electricAmount,
          dueDate: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 15),
          paidDate: status === "PAID" ? paidDate : null,
          paidAmount: status === "PAID" ? electricAmount : null,
          status: i > 0 ? "PAID" : "PENDING",
          period,
          description: `${period} dönemi elektrik faturası`,
        },
      });

      // Su ödemesi (rastgele tutar)
      const waterAmount = 80 + Math.floor(Math.random() * 120);
      await prisma.payment.create({
        data: {
          companyId: company.id,
          type: "WATER",
          amount: waterAmount,
          dueDate: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 20),
          paidDate: status === "PAID" ? paidDate : null,
          paidAmount: status === "PAID" ? waterAmount : null,
          status: i > 0 ? "PAID" : "PENDING",
          period,
          description: `${period} dönemi su faturası`,
        },
      });
    }
  }

  console.log("🎉 Seed tamamlandı! 8 firma ve ödemeleri oluşturuldu.");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
