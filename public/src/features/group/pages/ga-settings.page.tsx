import { useState } from "react";
import { Building2, FileText, Archive, MapPin, Banknote, Calendar, Check } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";

export function GASettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Group Settings</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">Manage your group configuration.</p>
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Group Profile</p>
          <Input label="Group Name" value="Tech Founders Savings" onChange={() => {}} icon={Building2} />
          <Input label="Description" value="Annual Equipment Upgrade Fund" onChange={() => {}} icon={FileText} />
          <Input label="Category" value="Technology" onChange={() => {}} icon={Archive} />
          <Input label="Location" value="Lagos, Nigeria" onChange={() => {}} icon={MapPin} />
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
            {saved ? <><Check className="w-4 h-4" />Saved!</> : "Save Changes"}
          </Button>
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Contribution Rules</p>
          <Input label="Amount per Member" value="50000" onChange={() => {}} icon={Banknote} />
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Frequency</label>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 rounded-xl border border-gray-200 dark:border-border text-sm text-gray-600 dark:text-gray-400 hover:border-primary/50">Weekly</button>
              <button className="py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Monthly</button>
            </div>
          </div>
          <Input label="Collection Day" value="1st of month" onChange={() => {}} icon={Calendar} />
          <Button variant="secondary" onClick={() => {}}>Update Rules</Button>
        </Card>
      </div>
    </div>
  );
}
