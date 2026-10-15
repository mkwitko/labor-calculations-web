/**
 * Loader do widget embutível da LexLaboral.
 *
 * O advogado cola uma linha no site dele:
 *
 *   <script src="https://app.lexlaboral.com.br/widget.js" data-key="SUA_CHAVE"></script>
 *
 * O wizard entra num iframe, e não direto na página, porque o CSS do site
 * hospedeiro e o nosso não podem se ver: um `reset` agressivo do outro lado
 * desmontaria o layout, e o nosso Tailwind vazaria para o site dele. O preço é
 * negociar a altura por postMessage, que é o que o resto deste arquivo faz.
 *
 * Escrito em ES5 sem dependência: roda como está, sem build, e não assume nada
 * sobre o site que o hospeda.
 */
(function () {
  var script = document.currentScript;

  if (!script) {
    // Sem `currentScript` não há como descobrir nossa origem nem a chave.
    // Acontece se alguém copiar o conteúdo do arquivo para dentro de um bundle.
    console.error("[lexlaboral] widget.js precisa ser carregado por <script src>");
    return;
  }

  var key = script.getAttribute("data-key");

  if (!key) {
    console.error("[lexlaboral] falta o atributo data-key no <script>");
    return;
  }

  var origin = new URL(script.src, window.location.href).origin;
  var frameId = "lexlaboral-widget-" + Math.random().toString(36).slice(2);

  var url =
    origin +
    "/widget/calculadora?k=" +
    encodeURIComponent(key) +
    "&h=" +
    encodeURIComponent(window.location.host) +
    "&f=" +
    encodeURIComponent(frameId);

  var iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.id = frameId;
  iframe.title = "Calculadora de rescisão";
  iframe.loading = "lazy";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  // Altura inicial generosa: o primeiro passo do wizard já cabe, então o
  // visitante não vê um recorte enquanto a primeira mensagem de altura não
  // chega. Se o postMessage nunca chegar (bloqueio de script), o widget fica
  // usável com rolagem interna em vez de vazio.
  iframe.style.minHeight = "620px";
  iframe.style.colorScheme = "normal";

  var target = script.getAttribute("data-target");
  var mount = target ? document.querySelector(target) : null;

  if (mount) {
    mount.appendChild(iframe);
  } else {
    // Sem alvo declarado, entra onde o script está — é onde o advogado colou, e
    // é o que ele espera ver.
    script.parentNode.insertBefore(iframe, script.nextSibling);
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== origin) return;

    var data = event.data;
    if (!data || data.type !== "lexlaboral:height") return;
    // Uma página pode hospedar dois widgets; a mensagem diz de qual iframe veio.
    if (data.frameId !== frameId) return;

    var height = Number(data.height);
    if (!Number.isFinite(height) || height <= 0) return;

    iframe.style.height = Math.ceil(height) + "px";
    iframe.style.minHeight = "0";
  });
})();
