import { useState, useEffect } from "react";
import { Building2, FileText, Archive, MapPin, Banknote, Calendar, Check, Loader2 } from "lucide-react";
import { Card } from "../../../components/shared/Card";
import { Input } from "../../../components/shared/Input";
import { Button } from "../../../components/shared/Button";
import { useCooperatives } from "../../../hooks/use-cooperatives";
import { useGroupSettings, useUpdateGroupSettings } from "../../../hooks/use-group-settings";

const FREQUENCY_OPTIONS = ["WEEKLY", "MONTHLY"] as const;

export function GASettings() {
  const { data: groups } = useCooperatives();
  const groupId = (groups && groups.length > 0) ? groups[0].id : "";
  const { data: settings, isLoading } = useGroupSettings(groupId);
  const updateSettings = useUpdateGroupSettings(groupId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<string>("MONTHLY");
  const [collectionDay, setCollectionDay] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [rulesSaved, setRulesSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setDescription(settings.description ?? "");
      setCategory(settings.category ?? "");
      setLocation(settings.location ?? "");
      setAmount(settings.contributionAmount ? String(settings.contributionAmount) : "");
      setFrequency(settings.frequency);
      setCollectionDay(settings.collectionDay ? String(settings.collectionDay) : "");
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Group Settings</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateSettings.mutate(
      { name, description: description || null, category: category || null, location: location || null },
      {
        onSuccess: () => {
          setProfileSaved(true);
          setTimeout(() => setProfileSaved(false), 2000);
        },
      },
    );
  };

  const handleSaveRules = () => {
    updateSettings.mutate(
      {
        contributionAmount: amount ? parseInt(amount, 10) : null,
        frequency,
        collectionDay: collectionDay ? parseInt(collectionDay, 10) : null,
      },
      {
        onSuccess: () => {
          setRulesSaved(true);
          setTimeout(() => setRulesSaved(false), 2000);
        },
      },
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Group Settings</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">Manage your group configuration.</p>
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Group Profile</p>
          <Input label="Group Name" value={name} onChange={setName} icon={Building2} />
          <Input label="Description" value={description} onChange={setDescription} icon={FileText} />
          <Input label="Category" value={category} onChange={setCategory} icon={Archive} />
          <Input label="Location" value={location} onChange={setLocation} icon={MapPin} />
          <Button onClick={handleSaveProfile} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileSaved ? (
              <><Check className="w-4 h-4" />Saved!</>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Contribution Rules</p>
          <Input label="Amount per Member" value={amount} onChange={setAmount} icon={Banknote} type="number" />
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Frequency</label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFrequency(opt)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                    frequency === opt
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 dark:border-border text-gray-600 dark:text-gray-400 hover:border-primary/50"
                  }`}
                >
                  {opt.charAt(0) + opt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <Input label="Collection Day" value={collectionDay} onChange={setCollectionDay} icon={Calendar} type="number" />
          <Button variant="secondary" onClick={handleSaveRules} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : rulesSaved ? (
              <><Check className="w-4 h-4" />Updated!</>
            ) : (
              "Update Rules"
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
