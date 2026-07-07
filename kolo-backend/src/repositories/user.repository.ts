import { PrismaDatabase } from "../database/prisma";

export class UserRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  async findByPhone(phone: string) {
    return this.db.user.findUnique({ where: { phone } });
  }

  async findByEmailOrPhone(emailOrPhone: string) {
    return this.db.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
    });
  }

  async create(data: {
    email: string;
    phone: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return this.db.user.create({ data });
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    passwordHash?: string;
    status?: string;
  }) {
    return this.db.user.update({ where: { id }, data: data as never });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.db.user.update({ where: { id }, data: { passwordHash } });
  }

  async updateStatus(id: string, status: string) {
    return this.db.user.update({ where: { id }, data: { status: status as never } });
  }
}
