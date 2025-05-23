// types.ts
export interface TeamMember {
  name: string;
  mail?: string;
}
export interface UserData {
  name: string;
  mail: string;
}

export interface Team {
  teamName: string;
  teamId: number;
  team: string;
  date: string;
  status: string;
  description: string;
  members: TeamMember[];
}

export interface Document {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  fileType: string;
  location: string;
}
