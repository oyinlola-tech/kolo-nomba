import { apiClient } from "../api/client";

export interface GroupSettings {
  name: string;
  description: string | null;
  category: string | null;
  location: string | null;
  contributionAmount: number | null;
  currency: string;
  frequency: string;
  collectionDay: number | null;
}

export interface UpdateGroupSettingsPayload {
  name?: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  contributionAmount?: number | null;
  currency?: string;
  frequency?: string;
  collectionDay?: number | null;
}

export async function getGroupSettings(groupId: string): Promise<GroupSettings> {
  const { data } = await apiClient.get<{ data: GroupSettings }>(`/groups/${groupId}/settings`);
  return data.data;
}

export async function updateGroupSettings(groupId: string, payload: UpdateGroupSettingsPayload): Promise<GroupSettings> {
  const { data } = await apiClient.patch<{ data: GroupSettings }>(
    `/groups/${groupId}/settings`,
    payload,
  );
  return data.data;
}
