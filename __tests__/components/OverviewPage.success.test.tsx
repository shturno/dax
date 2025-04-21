import { render, screen } from "@testing-library/react";

beforeAll(() => {
  const mockResponse = {
    ok: true,
    json: () =>
      Promise.resolve({
        projects: [
          {
            _id: "1",
            name: "Projeto Teste",
            description: "Descrição",
            ownerId: "owner1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
  } as Response;
  global.fetch = jest.fn().mockResolvedValue(mockResponse);
});

afterAll(() => {
  // @ts-ignore
  global.fetch = undefined;
});

jest.mock("@/hooks/useProjectCache", () => ({
  useProjectCache: () => ({
    isLoading: false,
    isError: false,
    projects: [
      { id: "1", name: "Projeto Teste" },
      { id: "2", name: "Outro Projeto" }
    ],
    refetch: jest.fn(),
  }),
}));
import { OverviewPage } from "../../components/overview-page";

describe("OverviewPage (success)", () => {
  it("renders project name", async () => {
    render(<OverviewPage />);
    expect(await screen.findByText("Projeto Teste")).toBeInTheDocument();
  });

  it("shows card title Nome do Projeto", async () => {
    render(<OverviewPage />);
    expect(await screen.findByText("Nome do Projeto")).toBeInTheDocument();
  });
});
