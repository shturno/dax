import { render } from "@testing-library/react";
jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: any) => children
}));
jest.mock("@/components/theme-color-provider", () => ({
  ThemeColorProvider: ({ children }: any) => children
}));
jest.mock("next-themes", () => ({
  NextThemesProvider: ({ children }: any) => children,
  useTheme: () => ({ theme: "light", setTheme: jest.fn() })
}));
import { Providers } from "../../app/providers";

describe("Providers", () => {
  it("renders children", () => {
    const { getByText } = render(
      <Providers>
        <div>Child</div>
      </Providers>
    );
    expect(getByText("Child")).toBeInTheDocument();
  });
});
