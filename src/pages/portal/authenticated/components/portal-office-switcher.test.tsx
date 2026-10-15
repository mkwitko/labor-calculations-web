import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PortalOfficeSwitcher } from "./portal-office-switcher";

const TWO = [
  { id: "org-1", name: "Escritório Um", current: true },
  { id: "org-2", name: "Escritório Dois", current: false },
];

function renderSwitcher(props: Parameters<typeof PortalOfficeSwitcher>[0]) {
  return render(
    <MemoryRouter>
      <PortalOfficeSwitcher {...props} />
    </MemoryRouter>,
  );
}

describe("PortalOfficeSwitcher", () => {
  it("mostra o escritório atual no gatilho", () => {
    renderSwitcher({ organizations: TWO, onSelect: vi.fn() });
    expect(
      screen.getByRole("button", { name: /Escritório Um/ }),
    ).toBeInTheDocument();
  });

  it("não renderiza nada com um escritório só", () => {
    renderSwitcher({
      organizations: [{ id: "org-1", name: "Escritório Um", current: true }],
      onSelect: vi.fn(),
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("chama onSelect com o escritório escolhido", async () => {
    const onSelect = vi.fn();
    renderSwitcher({ organizations: TWO, onSelect });

    await userEvent.click(
      screen.getByRole("button", { name: /Escritório Um/ }),
    );
    await userEvent.click(screen.getByText("Escritório Dois"));

    expect(onSelect).toHaveBeenCalledWith("org-2");
  });

  it("não chama onSelect no escritório atual", async () => {
    const onSelect = vi.fn();
    renderSwitcher({ organizations: TWO, onSelect });

    await userEvent.click(
      screen.getByRole("button", { name: /Escritório Um/ }),
    );
    await userEvent.click(
      screen.getByRole("menuitem", { name: /Escritório Um/ }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });
});
