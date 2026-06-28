export interface CreateGroupDto {
  name: string;
  description?: string;
  category?: string;
  location?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  category?: string;
  location?: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  location: string | null;
  contributionAmount: number | null;
  currency: string;
  frequency: string;
  collectionDay: number | null;
  status: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupDetailResponse extends GroupResponse {
  members: GroupMemberResponse[];
}

export interface GroupMemberResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface InviteMemberDto {
  email?: string;
  phone?: string;
}

export interface AcceptInvitationDto {
  invitationId: string;
}

export interface GroupSettingsResponse {
  name: string;
  description: string | null;
  category: string | null;
  location: string | null;
  contributionAmount: number | null;
  currency: string;
  frequency: string;
  collectionDay: number | null;
}

export interface UpdateGroupSettingsDto {
  name?: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  contributionAmount?: number | null;
  currency?: string;
  frequency?: string;
  collectionDay?: number | null;
}

export interface InvitationResponse {
  id: string;
  groupId: string;
  groupName: string;
  email: string | null;
  phone: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}
