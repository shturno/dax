import { GET, PATCH } from '../route'; // Não existe DELETE exportado
// O teste de exclusão será feito via mock do serviço, não do handler DELETE
import { NextRequest } from 'next/server';

jest.mock('@/app/api/projects/projects-service', () => ({
  getProjectById: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
}));

describe('/api/projects/[id] route', () => {
  const mockRequest = (method = 'GET', body?: any) =>
    ({ method, json: async () => body } as unknown as NextRequest);

  it('GET returns 404 if not found', async () => {
    const { getProjectById } = require('@/app/api/projects/projects-service');
    getProjectById.mockResolvedValue({ success: false, statusCode: 404 });
    const res = await GET(mockRequest(), { params: { id: '1' } });
    expect(res.status).toBe(404);
  });

  it('GET returns 200 if found', async () => {
    const { getProjectById } = require('@/app/api/projects/projects-service');
    getProjectById.mockResolvedValue({ success: true, statusCode: 200, project: { _id: '1' } });
    const res = await GET(mockRequest(), { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('PATCH returns 200 on success', async () => {
    const { updateProject } = require('@/app/api/projects/projects-service');
    updateProject.mockResolvedValue({ success: true, statusCode: 200, project: { _id: '1' } });
    const res = await PATCH(mockRequest('PATCH', { name: 'test' }), { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('deleteProject service returns 204 on success', async () => {
    const { deleteProject } = require('@/app/api/projects/projects-service');
    deleteProject.mockResolvedValue({ success: true, statusCode: 204 });
    const result = await deleteProject('some-id');
    expect(result.statusCode).toBe(204);
    expect(result.success).toBe(true);
  });

  it('PATCH returns 400 on error', async () => {
    const { updateProject } = require('@/app/api/projects/projects-service');
    updateProject.mockResolvedValue({ success: false, statusCode: 400 });
    const res = await PATCH(mockRequest('PATCH', {}), { params: { id: '1' } });
    expect(res.status).toBe(400);
  });
});
