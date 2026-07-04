import type { FastifyInstance } from "fastify";
import { HealthController } from "../controllers/health.controller";
import { ContactController } from "../controllers/contact.controller";
import { AuthRoute } from "./auth.route";
import { UserRoute } from "./user.route";
import { GroupRoute } from "./group.route";
import { ContributionRoute } from "./contribution.route";
import { PaymentRoute } from "./payment.route";
import { WebhookRoute } from "./webhook.route";
import { WalletRoute } from "./wallet.route";
import { LedgerRoute } from "./ledger.route";
import { FinancialTransactionRoute } from "./financial-transaction.route";
import { ReconciliationRoute } from "./reconciliation.route";
import { PayoutRoute } from "./payout.route";
import { WithdrawalRoute } from "./withdrawal.route";
import { VirtualAccountRoute } from "./virtual-account.route";
import { NotificationRoute } from "./notification.route";
import { AdminRoute } from "./admin.route";
import { AnalyticsRoute } from "./analytics.route";
import { AppConfig } from "../config/app.config";
import { Logger } from "../logger/core/logger";

export class RouteRegistry {
  private readonly app: FastifyInstance;
  private readonly config: AppConfig;
  private readonly logger: Logger;
  private readonly healthController: HealthController;
  private readonly contactController: ContactController;
  private readonly authRoute: AuthRoute;
  private readonly userRoute: UserRoute;
  private readonly groupRoute: GroupRoute;
  private readonly contributionRoute: ContributionRoute;
  private readonly paymentRoute: PaymentRoute;
  private readonly webhookRoute: WebhookRoute;
  private readonly walletRoute: WalletRoute;
  private readonly ledgerRoute: LedgerRoute;
  private readonly financialTransactionRoute: FinancialTransactionRoute;
  private readonly reconciliationRoute: ReconciliationRoute;
  private readonly payoutRoute: PayoutRoute;
  private readonly withdrawalRoute: WithdrawalRoute;
  private readonly virtualAccountRoute: VirtualAccountRoute;
  private readonly notificationRoute: NotificationRoute;
  private readonly adminRoute: AdminRoute;
  private readonly analyticsRoute: AnalyticsRoute;

  constructor(app: FastifyInstance) {
    this.app = app;
    this.config = new AppConfig();
    this.logger = new Logger("route-registry");
    this.healthController = new HealthController();
    this.contactController = new ContactController();
    this.authRoute = new AuthRoute();
    this.userRoute = new UserRoute();
    this.groupRoute = new GroupRoute();
    this.contributionRoute = new ContributionRoute();
    this.paymentRoute = new PaymentRoute();
    this.webhookRoute = new WebhookRoute();
    this.walletRoute = new WalletRoute();
    this.ledgerRoute = new LedgerRoute();
    this.financialTransactionRoute = new FinancialTransactionRoute();
    this.reconciliationRoute = new ReconciliationRoute();
    this.payoutRoute = new PayoutRoute();
    this.withdrawalRoute = new WithdrawalRoute();
    this.virtualAccountRoute = new VirtualAccountRoute();
    this.notificationRoute = new NotificationRoute();
    this.adminRoute = new AdminRoute();
    this.analyticsRoute = new AnalyticsRoute();
  }

  register(): void {
    const prefix = this.config.apiPrefix;

    this.app.get(`${prefix}/config`, {
      config: { rateLimit: { max: 10, timeWindow: "10 seconds" } },
    }, this.healthController.getConfig.bind(this.healthController));

    this.app.post(`${prefix}/contact`, {
      config: { rateLimit: { max: 3, timeWindow: "15 minutes" } },
    }, this.contactController.submit.bind(this.contactController));

    this.authRoute.register(this.app, prefix);
    this.userRoute.register(this.app, prefix);
    this.groupRoute.register(this.app, prefix);
    this.contributionRoute.register(this.app, prefix);
    this.paymentRoute.register(this.app, prefix);
    this.webhookRoute.register(this.app, prefix);
    this.walletRoute.register(this.app, prefix);
    this.ledgerRoute.register(this.app, prefix);
    this.financialTransactionRoute.register(this.app, prefix);
    this.reconciliationRoute.register(this.app, prefix);
    this.payoutRoute.register(this.app, prefix);
    this.withdrawalRoute.register(this.app, prefix);
    this.virtualAccountRoute.register(this.app, prefix);
    this.notificationRoute.register(this.app, prefix);
    this.adminRoute.register(this.app, prefix);
    this.analyticsRoute.register(this.app, prefix);

    this.logger.info("All routes registered", { prefix });
  }
}
