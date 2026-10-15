import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersIcon } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState icon={UsersIcon} title="Sem clientes" description="Cadastre um" />);
    expect(screen.getByText("Sem clientes")).toBeInTheDocument();
    expect(screen.getByText("Cadastre um")).toBeInTheDocument();
  });

  it("fires the action onClick", async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={UsersIcon}
        title="Sem clientes"
        action={{ label: "Novo cliente", onClick }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Novo cliente" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders no action button when action is absent", () => {
    render(<EmptyState icon={UsersIcon} title="Vazio" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links to the help article when helpArticle is set", () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={UsersIcon}
          title="Sem clientes"
          helpArticle="cadastro-de-clientes"
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /como funciona/i })).toHaveAttribute(
      "href",
      "/ajuda?artigo=cadastro-de-clientes",
    );
  });

  it("renders no help link when helpArticle is absent", () => {
    render(<EmptyState icon={UsersIcon} title="Vazio" />);
    expect(
      screen.queryByRole("link", { name: /como funciona/i }),
    ).not.toBeInTheDocument();
  });
});
