import { apiClient } from "../api/client";

export interface GroupMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data } = await apiClient.get<{ data: GroupMember[] }>(`/groups/${groupId}/members`);
  return data.data;
}
