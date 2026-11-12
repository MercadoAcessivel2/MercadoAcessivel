
"use strict";

(function () {

    // SELECIONAR ELEMENTOS
    const $ = (seletor, local = document) =>
        local.querySelector(seletor);

    const $$ = (seletor, local = document) =>
        [...local.querySelectorAll(seletor)];


    // MENU DE NAVEGAÇÃO
    const botaoMenu = $("#nav-toggle");
    const menu = $("#site-nav");

    if (botaoMenu && menu) {
        botaoMenu.addEventListener("click", function () {
            const aberto =
                botaoMenu.getAttribute("aria-expanded") === "true";

            botaoMenu.setAttribute(
                "aria-expanded", String(!aberto)
            );

            menu.classList.toggle("open", !aberto);
        });

        $$("#site-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("open");
                botaoMenu.setAttribute("aria-expanded", "false");
            });
        });
    }


    // MENU DE ACESSIBILIDADE
    const botaoAcessibilidade = $("#a11y-toggle");
    const painelAcessibilidade = $("#a11y-panel");

    if (botaoAcessibilidade && painelAcessibilidade) {
        botaoAcessibilidade.addEventListener("click", function () {
            const aberto =
                botaoAcessibilidade.getAttribute("aria-expanded") === "true";

            painelAcessibilidade.classList.toggle("open", !aberto);

            botaoAcessibilidade.setAttribute(
                "aria-expanded", String(!aberto)
            );
        });

        document.addEventListener("click", function (evento) {
            if (!evento.target.closest(".a11y-menu")) {
                painelAcessibilidade.classList.remove("open");
                botaoAcessibilidade.setAttribute(
                    "aria-expanded", "false"
                );
            }
        });
    }


    // SALVAR PREFERÊNCIAS
    function lerPreferencia(chave) {
        try {
            return localStorage.getItem(chave);
        } catch (erro) {
            return null;
        }
    }

    function salvarPreferencia(chave, valor) {
        try {
            localStorage.setItem(chave, valor);
        } catch (erro) {
            // O site continua funcionando sem armazenamento.
        }
    }


    // AUMENTAR E DIMINUIR FONTE
    let tamanhoFonte = Number(
        lerPreferencia("ma-font") || 1
    );

    if (!Number.isFinite(tamanhoFonte)) {
        tamanhoFonte = 1;
    }

    tamanhoFonte = Math.min(
        1.35,
        Math.max(0.9, tamanhoFonte)
    );

    function aplicarFonte() {
        document.documentElement.style.setProperty(
            "--font-scale",
            String(tamanhoFonte)
        );
    }

    aplicarFonte();

    $$("[data-font]").forEach(function (botao) {
        botao.addEventListener("click", function () {
            if (botao.dataset.font === "plus") {
                tamanhoFonte = Math.min(
                    1.35,
                    +(tamanhoFonte + 0.1).toFixed(2)
                );
            } else {
                tamanhoFonte = Math.max(
                    0.9,
                    +(tamanhoFonte - 0.1).toFixed(2)
                );
            }

            aplicarFonte();
            salvarPreferencia("ma-font", String(tamanhoFonte));
        });
    });


    // ALTO CONTRASTE
    const contrasteSalvo =
        lerPreferencia("ma-contrast") === "true";

    document.body.classList.toggle(
        "high-contrast",
        contrasteSalvo
    );

    const botaoContraste = $("#contrast-toggle");

    if (botaoContraste) {
        botaoContraste.addEventListener("click", function () {
            const ativo = document.body.classList.toggle(
                "high-contrast"
            );

            salvarPreferencia(
                "ma-contrast",
                String(ativo)
            );
        });
    }


    // LEITURA EM VOZ ALTA
    const botaoLeitura = $("#read-page");
    let lendo = false;

    function pararLeitura() {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        lendo = false;

        if (botaoLeitura) {
            botaoLeitura.textContent = "Ler página";
        }
    }

    if (botaoLeitura) {
        botaoLeitura.addEventListener("click", function () {

            if (!("speechSynthesis" in window)) {
                alert("Seu navegador não oferece leitura em voz alta.");
                return;
            }

            if (lendo) {
                pararLeitura();
                return;
            }

            const conteudo = $("#conteudo");

            if (!conteudo) {
                return;
            }

            const elementos = $$(
                "h1, h2, h3, p, li, figcaption",
                conteudo
            );

            const texto = elementos
                .filter(function (elemento) {
                    return !elemento.closest(
                        '[aria-hidden="true"]'
                    );
                })
                .map(function (elemento) {
                    return elemento.textContent.trim();
                })
                .filter(Boolean)
                .join(". ");

            if (!texto) {
                return;
            }

            window.speechSynthesis.cancel();

            const fala = new SpeechSynthesisUtterance(texto);

            fala.lang = "pt-BR";
            fala.rate = 0.95;
            fala.pitch = 1;

            fala.onend = function () {
                lendo = false;
                botaoLeitura.textContent = "Ler página";
            };

            fala.onerror = function () {
                lendo = false;
                botaoLeitura.textContent = "Ler página";
            };

            window.speechSynthesis.speak(fala);

            lendo = true;
            botaoLeitura.textContent = "Parar leitura";
        });
    }

    window.addEventListener("pagehide", pararLeitura);


    // ANO AUTOMÁTICO NO RODAPÉ
    $$(".year").forEach(function (elemento) {
        elemento.textContent = new Date().getFullYear();
    });


    // ANIMAÇÕES AO ROLAR A PÁGINA
    const elementosAnimados = $$(".reveal");

    const reduzirMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        "IntersectionObserver" in window &&
        !reduzirMovimento
    ) {
        const observador = new IntersectionObserver(
            function (entradas) {
                entradas.forEach(function (entrada) {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("visible");
                        observador.unobserve(entrada.target);
                    }
                });
            },
            {
                threshold: 0.08
            }
        );

        elementosAnimados.forEach(function (elemento) {
            observador.observe(elemento);
        });
    } else {
        elementosAnimados.forEach(function (elemento) {
            elemento.classList.add("visible");
        });
    }


    // GALERIA DE IMAGENS
    const lightbox = $("#lightbox");

    if (lightbox) {
        const imagemAmpliada = $("img", lightbox);
        const legenda = $("#lightbox-caption");
        const botaoFechar = $(".lightbox-close", lightbox);

        let ultimaImagem = null;

        function fecharImagem() {
            lightbox.classList.remove("open");
            lightbox.setAttribute("aria-hidden", "true");

            document.body.style.overflow = "";

            if (imagemAmpliada) {
                imagemAmpliada.removeAttribute("src");
            }

            if (ultimaImagem) {
                ultimaImagem.focus();
            }
        }

        $$(".gallery-item").forEach(function (item) {

            item.addEventListener("click", function () {
                const imagem = $("img", item);

                if (!imagem || !imagemAmpliada) {
                    return;
                }

                ultimaImagem = item;

                imagemAmpliada.src = imagem.src;
                imagemAmpliada.alt = imagem.alt;

                if (legenda) {
                    legenda.textContent =
                        item.dataset.caption || imagem.alt;
                }

                lightbox.classList.add("open");
                lightbox.setAttribute("aria-hidden", "false");

                document.body.style.overflow = "hidden";

                if (botaoFechar) {
                    botaoFechar.focus();
                }
            });
        });

        if (botaoFechar) {
            botaoFechar.addEventListener(
                "click",
                fecharImagem
            );
        }

        lightbox.addEventListener("click", function (evento) {
            if (evento.target === lightbox) {
                fecharImagem();
            }
        });

        document.addEventListener("keydown", function (evento) {
            if (
                evento.key === "Escape" &&
                lightbox.classList.contains("open")
            ) {
                fecharImagem();
            }
        });
    }


    // DEMONSTRAÇÃO DO APLICATIVO
    const formulario = $("#shopping-form");
    const lista = $("#phone-items");

    if (formulario && lista) {

        function formatarDinheiro(valor) {
            return valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
        }

        let produtos = [];

        try {
            const dados = JSON.parse(
                lerPreferencia("ma-demo-items") || "[]"
            );

            if (Array.isArray(dados)) {
                produtos = dados.filter(function (produto) {
                    return produto &&
                        typeof produto.name === "string" &&
                        Number.isFinite(produto.price) &&
                        produto.price >= 0 &&
                        Number.isSafeInteger(produto.qty) &&
                        produto.qty >= 1;
                });
            }
        } catch (erro) {
            produtos = [];
        }

        let orcamento = Number(
            lerPreferencia("ma-demo-budget") || 100
        );

        if (
            !Number.isFinite(orcamento) ||
            orcamento <= 0
        ) {
            orcamento = 100;
        }

        const campoOrcamento = $("#budget");

        if (campoOrcamento) {
            campoOrcamento.value = orcamento;
        }


        // SALVAR LISTA
        function salvarLista() {
            salvarPreferencia(
                "ma-demo-items",
                JSON.stringify(produtos)
            );

            salvarPreferencia(
                "ma-demo-budget",
                String(orcamento)
            );
        }


        // PROTEGER TEXTO INSERIDO PELO USUÁRIO
        function protegerTexto(texto) {
            return String(texto).replace(
                /[&<>"']/g,
                function (caractere) {
                    const caracteres = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#39;"
                    };

                    return caracteres[caractere];
                }
            );
        }


        // ATUALIZAR A TELA DO APLICATIVO
        function atualizarLista() {

            const total = produtos.reduce(
                function (soma, produto) {
                    return soma + produto.price * produto.qty;
                },
                0
            );

            const totalElemento = $("#total-spent");
            const orcamentoTexto = $("#budget-text");
            const barra = $("#budget-progress");
            const situacao = $("#budget-status");
            const quantidade = $("#item-count");

            if (totalElemento) {
                totalElemento.textContent =
                    formatarDinheiro(total);
            }

            if (orcamentoTexto) {
                orcamentoTexto.textContent =
                    "Orçamento: " + formatarDinheiro(orcamento);
            }

            if (barra) {
                barra.style.width =
                    Math.min(100, total / orcamento * 100) + "%";

                barra.style.background =
                    total > orcamento ? "#ce6150" : "#f08a28";
            }

            if (situacao) {
                if (total > orcamento) {
                    situacao.textContent =
                        "Você ultrapassou o orçamento de demonstração.";
                } else {
                    situacao.textContent =
                        "Restam " +
                        formatarDinheiro(orcamento - total) +
                        " no orçamento.";
                }
            }

            if (quantidade) {
                const unidades = produtos.reduce(
                    function (soma, produto) {
                        return soma + produto.qty;
                    },
                    0
                );

                quantidade.textContent =
                    unidades + " produtos";
            }

            if (produtos.length === 0) {
                lista.innerHTML = `
                    <p class="phone-empty">
                        Sua lista está vazia.<br>
                        Adicione um produto para começar.
                    </p>
                `;
            } else {
                lista.innerHTML = produtos.map(
                    function (produto, indice) {
                        return `
                            <div class="phone-item">
                                <div>
                                    <strong>
                                        ${protegerTexto(produto.name)}
                                    </strong>
                                    <small>
                                        ${produto.qty} un. ×
                                        ${formatarDinheiro(produto.price)}
                                    </small>
                                </div>

                                <span>
                                    ${formatarDinheiro(
                                        produto.price * produto.qty
                                    )}
                                </span>

                                <button
                                    type="button"
                                    class="icon-btn"
                                    data-remove="${indice}"
                                    aria-label="Remover produto"
                                    title="Remover"
                                    style="width:29px;height:29px">
                                    ×
                                </button>
                            </div>
                        `;
                    }
                ).join("");
            }

            $$("[data-remove]", lista).forEach(
                function (botao) {
                    botao.addEventListener("click", function () {
                        const indice = Number(
                            botao.dataset.remove
                        );

                        produtos.splice(indice, 1);

                        salvarLista();
                        atualizarLista();
                    });
                }
            );
        }


        // ADICIONAR PRODUTO
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const nome = $("#product-name").value
                .trim()
                .slice(0, 60);

            const preco = Number(
                $("#product-price").value
            );

            const quantidade = Number(
                $("#product-qty").value
            );

            if (
                !nome ||
                !Number.isFinite(preco) ||
                preco < 0 ||
                !Number.isSafeInteger(quantidade) ||
                quantidade < 1 ||
                quantidade > 99
            ) {
                $("#app-status").textContent =
                    "Confira o nome, preço e quantidade.";
                return;
            }

            produtos.push({
                name: nome,
                price: preco,
                qty: quantidade
            });

            salvarLista();
            atualizarLista();

            $("#product-name").value = "";
            $("#product-price").value = "";
            $("#product-qty").value = 1;

            $("#app-status").textContent =
                nome + " adicionado à lista.";

            $("#product-name").focus();
        });


        // ALTERAR ORÇAMENTO
        if (campoOrcamento) {
            campoOrcamento.addEventListener(
                "change",
                function () {
                    const valor = Number(campoOrcamento.value);

                    if (
                        Number.isFinite(valor) &&
                        valor > 0 &&
                        valor < 1000000
                    ) {
                        orcamento = valor;

                        salvarLista();
                        atualizarLista();
                    }
                }
            );
        }


        // EXEMPLOS DE PRODUTOS
        $$("[data-sample]").forEach(function (botao) {
            botao.addEventListener("click", function () {
                const dados = botao.dataset.sample.split("|");

                const nome = dados[0];
                const preco = Number(dados[1]);

                if (
                    !nome ||
                    !Number.isFinite(preco) ||
                    preco < 0
                ) {
                    return;
                }

                produtos.push({
                    name: nome,
                    price: preco,
                    qty: 1
                });

                salvarLista();
                atualizarLista();

                $("#app-status").textContent =
                    nome + " adicionado.";
            });
        });


        // LIMPAR LISTA
        const botaoLimpar = $("#clear-list");

        if (botaoLimpar) {
            botaoLimpar.addEventListener("click", function () {
                produtos = [];

                salvarLista();
                atualizarLista();

                $("#app-status").textContent =
                    "Lista de demonstração limpa.";
            });
        }


        // OUVIR LISTA DE COMPRAS
        const botaoOuvirLista = $("#speak-list");

        if (botaoOuvirLista) {
            botaoOuvirLista.addEventListener(
                "click",
                function () {

                    if (!("speechSynthesis" in window)) {
                        $("#app-status").textContent =
                            "Leitura em voz alta indisponível.";
                        return;
                    }

                    window.speechSynthesis.cancel();

                    const nomes = produtos.map(
                        function (produto) {
                            return produto.qty +
                                " unidades de " +
                                produto.name;
                        }
                    ).join("; ");

                    let texto;

                    if (produtos.length > 0) {
                        texto = "Sua lista contém: " + nomes + ".";
                    } else {
                        texto = "Sua lista está vazia.";
                    }

                    const fala = new SpeechSynthesisUtterance(texto);

                    fala.lang = "pt-BR";
                    fala.rate = 0.95;

                    window.speechSynthesis.speak(fala);
                }
            );
        }

        atualizarLista();
    }

})();
