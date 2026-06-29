import { Loader2, TrendingUp, Users, Wallet, Target, CheckCircle2, Clock } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "../../../components/shared/Card";
import { PageHeader } from "../../../components/shared/PageHeader";
import { useGroupPaymentAnalytics } from "../../../hooks/use-payment-analytics";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { formatNaira } from "../../../utils/format";

export function GAPaymentAnalytics() {
  const { data: groups } = useCooperatives();
  const groupId = (groups && groups.length > 0) ? groups[0].id : "";
  const { data: analytics, isLoading } = useGroupPaymentAnalytics(groupId);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Payment Analytics" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const s = analytics?.summary;

  return (
    <div>
      <PageHeader title="Payment Analytics" subtitle="Track contribution payments and collection rates." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-xl font-bold">{formatNaira(s?.totalPaidAmount ?? 0)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected</p>
            <p className="text-xl font-bold">{formatNaira(s?.totalExpectedAmount ?? 0)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Collection Rate</p>
            <p className="text-xl font-bold">{s?.collectionRate ?? 0}%</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Members</p>
            <p className="text-xl font-bold">{s?.activeMembers ?? 0}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Contribution Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Paid
              </span>
              <span className="font-semibold">{s?.paidContributions ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Pending
              </span>
              <span className="font-semibold">{s?.pendingContributions ?? 0}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold">{(s?.paidContributions ?? 0) + (s?.pendingContributions ?? 0)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${s?.collectionRate ?? 0}%` }} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            Amount Overview
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: "Expected", amount: s?.totalExpectedAmount ?? 0 },
              { name: "Collected", amount: s?.totalPaidAmount ?? 0 },
              { name: "Outstanding", amount: s?.outstandingAmount ?? 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatNaira(Number(value))} />
              <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {analytics?.recentPayments && analytics.recentPayments.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{p.id.slice(0, 8)}...</td>
                    <td className="py-2 font-semibold">{formatNaira(p.amount)}</td>
                    <td className="py-2 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
