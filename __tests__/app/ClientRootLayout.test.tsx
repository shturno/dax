import { render } from "@testing-library/react";
jest.mock("@/components/providers", () => ({
  Providers: ({ children }: any) => <div data-testid="providers">{children}</div>,
}));
import ClientRootLayout, { metadata } from "../../app/client-layout";

describe("ClientRootLayout", () => {
  it("renders children and Providers", () => {
    const { getByText, getByTestId } = render(
      <ClientRootLayout>
        <div>Test Child</div>
      </ClientRootLayout>
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
