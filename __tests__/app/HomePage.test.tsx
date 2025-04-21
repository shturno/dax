import { render } from "@testing-library/react";
jest.mock("@/components/dashboard-layout", () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
jest.mock("@/components/overview-page", () => ({
  OverviewPage: () => <div>Visão Geral</div>,
}));
import Home from "../../app/page";

describe("Home Page", () => {
  it("renders DashboardLayout and OverviewPage", () => {
    const { getByTestId, getByText } = render(<Home />);
    expect(getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(getByText("Visão Geral")).toBeInTheDocument();
  });
});
