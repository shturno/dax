export declare function createProject(userId: string, projectData: any): Promise<{
  success: boolean;
  project: any;
  error: any;
  statusCode: number;
}>;

export declare function updateProject(userId: string, projectData: any): Promise<{
  success: boolean;
  project: any;
  error: any;
  statusCode: number;
}>;