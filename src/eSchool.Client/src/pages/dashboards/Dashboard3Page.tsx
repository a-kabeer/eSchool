import { OverallBalanceCard } from './widgets/OverallBalanceCard';
import { ReturnInvestmentCard } from './widgets/ReturnInvestmentCard';
import { KpiSparkCards } from './widgets/KpiSparkCards';
import { MarketingReportCard } from './widgets/MarketingReportCard';
import { PaymentMethodsCard } from './widgets/PaymentMethodsCard';
import { RecentProjectsCard } from './widgets/RecentProjectsCard';
import { DeliveryAnalyticsCard } from './widgets/DeliveryAnalyticsCard';
import { EarningReportsCard } from './widgets/EarningReportsCard';

export function Dashboard3Page() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Row 1: Overall Balance (8) + Return On Investment (4) */}
      <div className="col-span-12 xl:col-span-8">
        <OverallBalanceCard />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <ReturnInvestmentCard />
      </div>

      {/* Row 2: Total Followers (4) + Total Income (4) + Current Balance (4) */}
      <KpiSparkCards />

      {/* Row 3: Marketing Report (5) + Payment Methods (7) */}
      <div className="col-span-12 xl:col-span-5">
        <MarketingReportCard />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <PaymentMethodsCard />
      </div>

      {/* Row 4: Recent Projects (12) */}
      <div className="col-span-12">
        <RecentProjectsCard />
      </div>

      {/* Row 5: Delivery Analytics (8) + Earning Reports (4) */}
      <div className="col-span-12 xl:col-span-8">
        <DeliveryAnalyticsCard />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <EarningReportsCard />
      </div>
    </div>
  );
}
