import { render } from "@testing-library/react";
jest.mock("@/components/providers", () => ({
  Providers: ({ children }: any) => <div data-testid="providers">{children}</div>,
}));
import RootLayout, { metadata } from "../../app/layout";

describe("RootLayout", () => {
  it("renders children and Providers", () => {
    const { getByText, getByTestId } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByText("Test Child")).toBeInTheDocument();
    expect(getByTestId("providers")).toBeInTheDocument();
  });
});

describe("metadata", () => {
  it("has correct title and description", () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
  });
});
