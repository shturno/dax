import { render, screen } from "@testing-library/react";

const fakeResponse = {
  ok:   false,
  status: 400,
  statusText: 'Bad Request',
  json: async () => ({ error: 'something went wrong' }),
  headers: new Headers(),
  clone: () => fakeResponse,
  // …you can stub other methods if needed
} as unknown as Response;

beforeEach(() => {
  // @ts-ignore: override global.fetch for mocking
  global.fetch = jest.fn().mockResolvedValueOnce(fakeResponse);
});

afterAll(() => {
  // @ts-ignore
  global.fetch = undefined;
});

jest.mock("@/hooks/useProjectCache", () => ({
  useProjectCache: () => ({
    isLoading: false,
    isError: true,
    projects: [],
    refetch: jest.fn(),
  }),
}));
import { OverviewPage } from "../../components/overview-page";

describe("OverviewPage (error)", () => {
  it("deve lidar com erro de carregamento", async () => {
    render(<OverviewPage />);
    // Usa regex para buscar substring, inclui mensagem de erro e botão
    expect(await screen.findByText(/Erro ao carregar projetos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar Novamente/i })).toBeInTheDocument();
  });
});
