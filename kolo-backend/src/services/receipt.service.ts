import PDFDocument from "pdfkit";
import { TransactionRepository } from "../repositories/transaction.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { GroupRepository } from "../repositories/group.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthError } from "../errors/auth.error";
import { formatKobo } from "../utils/format.util";

interface ReceiptData {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  groupName: string;
  memberName: string;
  paidAt: string | null;
  transactionId: string | null;
}

export class ReceiptService {
  private readonly transactionRepository: TransactionRepository;
  private readonly paymentRepository: PaymentRepository;
  private readonly groupRepository: GroupRepository;
  private readonly userRepository: UserRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.paymentRepository = new PaymentRepository();
    this.groupRepository = new GroupRepository();
    this.userRepository = new UserRepository();
  }

  async getReceiptData(reference: string, userId: string): Promise<ReceiptData> {
    const transaction = await this.transactionRepository.findByReference(reference);
    if (!transaction) {
      throw new AuthError("Transaction not found");
    }

    const payments = await this.paymentRepository.findByTransaction(transaction.id);
    const payment = payments.length > 0 ? payments[0] : null;

    let groupName = "—";
    let memberName = "—";
    if (payment?.groupId) {
      const group = await this.groupRepository.findById(payment.groupId);
      if (group) groupName = group.name;
    }
    const user = await this.userRepository.findById(userId);
    if (user) memberName = `${user.firstName} ${user.lastName}`;

    return {
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: payment?.paymentMethod ?? null,
      groupName,
      memberName,
      paidAt: payment?.updatedAt.toISOString() ?? null,
      transactionId: transaction.id,
    };
  }

  async generatePdf(reference: string, userId: string): Promise<Buffer> {
    const data = await this.getReceiptData(reference, userId);
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });

    const primaryColor = "#00A86B";
    const darkColor = "#1F2937";
    const lightGray = "#F3F4F6";

    doc.fontSize(24).font("Helvetica-Bold").fillColor(primaryColor).text("KOLO", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#6B7280").text("Payment Receipt", 50, 78);

    doc.moveTo(50, 95).lineTo(545, 95).strokeColor("#E5E7EB").stroke();

    doc.fontSize(16).font("Helvetica-Bold").fillColor(darkColor).text("RECEIPT", 50, 115);
    doc.fontSize(8).font("Helvetica").fillColor("#9CA3AF").text(`#${data.reference}`, 50, 138);

    const topY = 115;
    doc.fontSize(8).font("Helvetica").fillColor("#6B7280").text("Date", 400, topY);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(darkColor).text(
      data.paidAt ? new Date(data.paidAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }) : "—",
      400, topY + 12,
    );

    doc.moveTo(50, 170).lineTo(545, 170).strokeColor("#E5E7EB").stroke();

    const tableTop = 190;
    const rowHeight = 28;
    doc.roundedRect(50, tableTop, 495, rowHeight, 4).fillColor(lightGray).fill();
    doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold");
    doc.text("Description", 65, tableTop + 8, { width: 250 });
    doc.text("Amount", 400, tableTop + 8, { width: 120, align: "right" });

    let y = tableTop + rowHeight + 4;

    const paymentMethod = data.paymentMethod === "card" ? "Card Payment" : data.paymentMethod === "bank_transfer" ? "Bank Transfer" : data.paymentMethod ?? "—";

    doc.fillColor("#374151").fontSize(9).font("Helvetica");
    doc.text(`Contribution: ${data.groupName}`, 65, y + 6, { width: 250 });
    doc.text(formatKobo(data.amount), 400, y + 6, { width: 120, align: "right" });

    y += rowHeight;

    doc.moveTo(50, y + 3).lineTo(545, y + 3).strokeColor("#E5E7EB").stroke();
    y += 10;

    doc.fontSize(9).font("Helvetica-Bold").fillColor(darkColor);
    doc.text("TOTAL", 65, y, { width: 250 });
    doc.text(formatKobo(data.amount), 400, y, { width: 120, align: "right" });

    y += 40;

    doc.moveTo(50, y).lineTo(545, y).strokeColor("#E5E7EB").stroke();
    y += 15;

    doc.fontSize(9).font("Helvetica").fillColor("#6B7280");
    const details = [
      ["Member", data.memberName],
      ["Payment Method", paymentMethod],
      ["Reference", data.reference],
      ["Status", data.status === "SUCCESSFUL" ? "Paid" : data.status],
    ];
    for (const [label, value] of details) {
      doc.font("Helvetica-Bold").fillColor(darkColor).text(label, 65, y, { width: 120 });
      doc.font("Helvetica").fillColor("#374151").text(value, 200, y, { width: 300 });
      y += 18;
    }

    y += 20;
    doc.fontSize(8).font("Helvetica").fillColor("#9CA3AF");
    doc.text("Thank you for your contribution!", 50, y, { align: "center", width: 495 });
    y += 14;
    doc.text("Kolo — Digital Cooperative Savings Platform", 50, y, { align: "center", width: 495 });

    doc.end();
    return pdfPromise;
  }
}
