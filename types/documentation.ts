export interface DocSection {
  id: string;
  title: string;
  content: string;
  isFolder?: boolean;
  parentId?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}
