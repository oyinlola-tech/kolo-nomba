import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle, ChevronLeft,
  Building2, FileText, Archive, MapPin, Banknote, Calendar, BarChart2, Plus,
} from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";

interface GACreateGroupProps {
  onDone?: () => void;
}

export function GACreateGroup({ onDone }: GACreateGroupProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", desc: "", category: "", location: "",
    amount: "", frequency: "Monthly", startDate: "",
    members: [{ name: "", phone: "", email: "" }],
  });

  const steps = ["Group Details", "Contributions", "Members", "Review"];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onDone} className="text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Create New Group</p>
      </div>
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 < step ? "bg-primary text-white" : i + 1 === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-gray-100 dark:bg-muted text-gray-400"}`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <p className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i + 1 === step ? "text-primary" : "text-gray-400"}`}>{s}</p>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mb-5 mx-2 ${i + 1 < step ? "bg-primary" : "bg-gray-100 dark:bg-muted"}`} />}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 h-fit lg:col-span-1">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Group Summary</p>
          <div className="space-y-3 text-sm">
            {[["Group Name", form.name || "—"], ["Description", form.desc || "—"], ["Category", form.category || "—"], ["Location", form.location || "—"], ["Contribution", form.amount ? `₦${Number(form.amount).toLocaleString()}/${form.frequency}` : "—"]].map(([k, v]) => (
              <div key={k} className="border-b border-gray-50 dark:border-border pb-3">
                <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                <p className="font-medium text-gray-900 dark:text-white">{v}</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Group Details</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">Set up your group&apos;s basic information.</p>
              <Input label="Group Name" placeholder="e.g. Lagos Women Cooperative" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} icon={Building2} required />
              <Input label="Description / Purpose" placeholder="e.g. Annual equipment fund" value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} icon={FileText} />
              <Input label="Category" placeholder="e.g. Technology, Market, Community" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} icon={Archive} />
              <Input label="Location" placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} icon={MapPin} />
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>Next: Contributions <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </Card>
          )}
          {step === 2 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contribution Rules</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">Define how much and how often members will contribute.</p>
              <Input label="Contribution Amount (Per Member)" placeholder="₦50,000" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} icon={Banknote} required hint="Recommended: Minimum ₦5,000 for meaningful progress." />
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Contribution Frequency</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Weekly", "Monthly"].map(freq => (
                    <button key={freq} onClick={() => setForm(f => ({ ...f, frequency: freq }))}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${form.frequency === freq ? "bg-primary border-primary text-white" : "border-gray-200 dark:border-border text-gray-600 dark:text-gray-400 hover:border-primary/50"}`}>
                      {freq === "Weekly" ? <Calendar className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="First Collection Date" type="date" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} icon={Calendar} />
              <div className="flex justify-between mt-2">
                <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4" />Back</Button>
                <Button onClick={() => setStep(3)}>Next: Add Members <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </Card>
          )}
          {step === 3 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Invite Members</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">Add members to your group. They&apos;ll receive an invite link.</p>
              {form.members.map((m, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 mb-3">
                  <input placeholder="Full Name" value={m.name} onChange={e => { const ms = [...form.members]; ms[i].name = e.target.value; setForm(f => ({ ...f, members: ms })); }}
                    className="col-span-3 sm:col-span-1 px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input placeholder="+234 801..." value={m.phone} onChange={e => { const ms = [...form.members]; ms[i].phone = e.target.value; setForm(f => ({ ...f, members: ms })); }}
                    className="px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input placeholder="Email" value={m.email} onChange={e => { const ms = [...form.members]; ms[i].email = e.target.value; setForm(f => ({ ...f, members: ms })); }}
                    className="px-3 py-2.5 border border-gray-200 dark:border-border rounded-xl text-sm bg-white dark:bg-input-background text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <button onClick={() => setForm(f => ({ ...f, members: [...f.members, { name: "", phone: "", email: "" }] }))}
                className="flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-1 mb-5">
                <Plus className="w-4 h-4" />Add another member
              </button>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4" />Back</Button>
                <Button onClick={() => setStep(4)}>Review Group <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </Card>
          )}
          {step === 4 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Review & Create</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-5">Confirm your group details before launching.</p>
              <div className="space-y-3 mb-6 text-sm">
                {[
                  ["Group Name", form.name || "Tech Founders Savings"],
                  ["Contribution", `₦${form.amount || "50,000"} / ${form.frequency}`],
                  ["Members invited", `${form.members.filter(m => m.name).length || 1}`],
                  ["First collection", form.startDate || "Jul 1, 2026"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 dark:border-border">
                    <span className="text-gray-500 dark:text-muted-foreground">{k}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4" />Back</Button>
                <Button onClick={() => { if (onDone) onDone(); else navigate("../dashboard"); }}><CheckCircle className="w-4 h-4" />Create Group</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
