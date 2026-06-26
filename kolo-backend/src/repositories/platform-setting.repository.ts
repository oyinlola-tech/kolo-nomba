import { PrismaDatabase } from "../database/prisma";
import type { PlatformSetting } from "../generated/prisma/client";

export class PlatformSettingRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findByKey(key: string): Promise<PlatformSetting | null> {
    return this.db.platformSetting.findUnique({ where: { key } });
  }

  async findAll(): Promise<PlatformSetting[]> {
    return this.db.platformSetting.findMany({ orderBy: { key: "asc" } });
  }

  async upsert(key: string, value: string, type: string, description: string | null, updatedBy: string | null): Promise<PlatformSetting> {
    return this.db.platformSetting.upsert({
      where: { key },
      update: { value, type, description, updatedBy },
      create: { key, value, type, description, updatedBy },
    });
  }

  async findByKeys(keys: string[]): Promise<PlatformSetting[]> {
    return this.db.platformSetting.findMany({
      where: { key: { in: keys } },
    });
  }
}
