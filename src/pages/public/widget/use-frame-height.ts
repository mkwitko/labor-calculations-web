import { useEffect } from "react";

/**
 * Informa ao site hospedeiro a altura do conteúdo.
 *
 * Um iframe não cresce com o que tem dentro: sem isso, o wizard ganha barra de
 * rolagem própria a cada passo mais alto que o anterior. O `ResizeObserver`
 * cobre o que a troca de passo não avisa — banner de erro que aparece, lista de
 * verbas que abre, teclado do celular que reflui o texto.
 *
 * `frameId` volta na mensagem porque uma página pode hospedar dois widgets, e o
 * loader precisa saber qual iframe redimensionar.
 */
export function useFrameHeight(frameId: string | null): void {
	useEffect(() => {
		if (!frameId || window.parent === window) return;

		function post() {
			// `scrollHeight` do body, e não `offsetHeight`: margem de filho conta.
			const height = Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight,
			);

			// `"*"` porque a origem do site hospedeiro não é conhecida de antemão —
			// o widget é feito para rodar em qualquer domínio. O que sai daqui é um
			// número de pixels: nada que importe quem escute.
			window.parent.postMessage(
				{ type: "lexlaboral:height", frameId, height },
				"*",
			);
		}

		post();

		const observer = new ResizeObserver(post);
		observer.observe(document.body);

		return () => observer.disconnect();
	}, [frameId]);
}
