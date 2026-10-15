import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NextActionCard } from "./next-action-card";

const mockUseNextAction = vi.fn();

vi.mock("@/http/generated/dashboard/dashboard", () => ({
  useGetDashboardNextAction: (options?: unknown) => mockUseNextAction(options),
}));

function renderCard() {
  return render(
    <MemoryRouter>
      <NextActionCard />
    </MemoryRouter>,
  );
}

describe("NextActionCard", () => {
  // O queryClient do app tem `refetchOnMount: false` (src/lib/react-query.ts),
  // então voltar ao painel depois de cadastrar um cliente servia a fase antiga
  // do cache e o cartão continuava pedindo o primeiro cliente. Enumerar quem
  // escreve não resolve — cálculo, caso, perfil, convite e outro membro da
  // organização também mudam a fase.
  it("always refetches on mount", () => {
    mockUseNextAction.mockReturnValue({ data: undefined });
    renderCard();
    expect(mockUseNextAction).toHaveBeenCalledWith({
      query: { refetchOnMount: "always" },
    });
  });

  it("renders nothing while loading", () => {
    mockUseNextAction.mockReturnValue({ data: undefined });
    const { container } = renderCard();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the progress counter in the setup phase", () => {
    mockUseNextAction.mockReturnValue({
      data: {
        phase: "setup",
        title: "Cadastre o primeiro cliente",
        hint: "O reclamante da sua causa",
        to: "/clients/new",
        progress: { completed: 1, total: 4 },
      },
    });
    renderCard();
    expect(screen.getByText("Cadastre o primeiro cliente")).toBeInTheDocument();
    expect(screen.getByText("1 de 4")).toBeInTheDocument();
  });

  it("offers the example case only in the setup phase", () => {
    mockUseNextAction.mockReturnValue({
      data: {
        phase: "setup",
        title: "Cadastre o primeiro cliente",
        hint: "O reclamante",
        to: "/clients/new",
        progress: { completed: 0, total: 4 },
      },
    });
    renderCard();
    expect(
      screen.getByRole("link", { name: /caso de exemplo/i }),
    ).toBeInTheDocument();
  });

  it("shows the named item without a counter in the attention phase", () => {
    mockUseNextAction.mockReturnValue({
      data: {
        phase: "attention",
        title: "Prazo vencido no caso Maria x Empresa",
        hint: "Um prazo passou da data",
        to: "/cases/abc/prazos",
      },
    });
    renderCard();
    expect(
      screen.getByText("Prazo vencido no caso Maria x Empresa"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/de 4/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /caso de exemplo/i }),
    ).not.toBeInTheDocument();
  });

  it("links to the action target in the resume phase", () => {
    mockUseNextAction.mockReturnValue({
      data: {
        phase: "resume",
        title: "Retome o cálculo de Maria Silva",
        hint: "Você trabalhou nele recentemente",
        to: "/calculations/xyz",
      },
    });
    renderCard();
    expect(screen.getByRole("link", { name: /continuar/i })).toHaveAttribute(
      "href",
      "/calculations/xyz",
    );
  });

  it("falls back to a calculation in the idle phase", () => {
    mockUseNextAction.mockReturnValue({
      data: {
        phase: "idle",
        title: "Faça um cálculo",
        hint: "Liquidação completa",
        to: "/calculations/new",
      },
    });
    renderCard();
    expect(screen.getByRole("link", { name: /começar/i })).toHaveAttribute(
      "href",
      "/calculations/new",
    );
  });
});
