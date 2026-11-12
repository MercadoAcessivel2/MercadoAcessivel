
/*
 MERCADO ACESSÍVEL
 Protótipo 3D interativo do carrinho.

 Modelo conceitual feito com Three.js.
 Os sensores e alertas são simulações.
*/

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const area = document.getElementById("viewer-3d");

if (area) {

    const placeholder = document.getElementById("viewer-placeholder");

    // CENA E CÂMERA

    const cena = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        37, 1, 0.1, 120
    );

    const renderizador = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderizador.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderizador.setClearColor(0xffffff, 0);
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    renderizador.outputColorSpace = THREE.SRGBColorSpace;
    renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    renderizador.toneMappingExposure = 1.4;

    renderizador.domElement.setAttribute("aria-hidden", "true");

    area.appendChild(renderizador.domElement);

    if (placeholder) {
        placeholder.remove();
    }

    // ILUMINAÇÃO

    const luzAmbiente = new THREE.HemisphereLight(
        0xffffff, 0x8a9dac, 2.2
    );

    cena.add(luzAmbiente);

    const luzPrincipal = new THREE.DirectionalLight(
        0xffffff, 3.5
    );

    luzPrincipal.position.set(-3, 8, 7);
    luzPrincipal.castShadow = true;
    luzPrincipal.shadow.mapSize.set(1024, 1024);
    luzPrincipal.shadow.camera.left = -6;
    luzPrincipal.shadow.camera.right = 6;
    luzPrincipal.shadow.camera.top = 6;
    luzPrincipal.shadow.camera.bottom = -6;
    luzPrincipal.shadow.normalBias = 0.025;

    cena.add(luzPrincipal);

    const luzSecundaria = new THREE.DirectionalLight(
        0xd6edff, 1.4
    );

    luzSecundaria.position.set(6, 4, -5);
    cena.add(luzSecundaria);


    // MATERIAIS

    const material = {

        metal: new THREE.MeshStandardMaterial({
            color: 0x90a7b5,
            metalness: 0.78,
            roughness: 0.28
        }),

        metalEscuro: new THREE.MeshStandardMaterial({
            color: 0x5c7385,
            metalness: 0.72,
            roughness: 0.32
        }),

        cromado: new THREE.MeshStandardMaterial({
            color: 0xd0dfe5,
            metalness: 0.78,
            roughness: 0.19
        }),

        borracha: new THREE.MeshStandardMaterial({
            color: 0x273b49,
            roughness: 0.88
        }),

        plastico: new THREE.MeshStandardMaterial({
            color: 0x0d2b47,
            roughness: 0.43
        }),

        sensor: new THREE.MeshStandardMaterial({
            color: 0x18799a,
            metalness: 0.12,
            roughness: 0.46
        }),

        sensorDisco: new THREE.MeshStandardMaterial({
            color: 0xbdd9e4,
            metalness: 0.82,
            roughness: 0.28
        }),

        tela: new THREE.MeshStandardMaterial({
            color: 0x163d56,
            emissive: 0x122f43,
            emissiveIntensity: 0.45
        }),

        telaClara: new THREE.MeshBasicMaterial({
            color: 0x5dcac9
        }),

        luz: new THREE.MeshStandardMaterial({
            color: 0xf59943,
            emissive: 0xcc4519,
            emissiveIntensity: 0.35
        }),

        caixa: new THREE.MeshStandardMaterial({
            color: 0xeec18a
        }),

        caixaAzul: new THREE.MeshStandardMaterial({
            color: 0x6db4c6
        }),

        caixaClara: new THREE.MeshStandardMaterial({
            color: 0xf6e5bd
        }),

        chao: new THREE.MeshStandardMaterial({
            color: 0xe3edf1,
            roughness: 1
        })
    };


    // GRUPO PRINCIPAL DO CARRINHO

    const carrinho = new THREE.Group();
    cena.add(carrinho);

    const materiaisPartes = {
        sensors: [],
        alerts: [],
        screen: [],
        wheels: []
    };

    function adicionar(geometria, mat, grupo, x, y, z) {

        const objeto = new THREE.Mesh(geometria, mat);

        objeto.position.set(x, y, z);
        objeto.castShadow = true;
        objeto.receiveShadow = true;

        grupo.add(objeto);

        return objeto;
    }

    function caixa(largura, altura, profundidade, mat, x, y, z, grupo = carrinho) {

        return adicionar(
            new THREE.BoxGeometry(
                largura, altura, profundidade
            ),
            mat,
            grupo,
            x, y, z
        );
    }

    function vetor(x, y, z) {
        return new THREE.Vector3(x, y, z);
    }

    function barra(inicio, fim, raio = 0.016, mat = material.metal, grupo = carrinho) {

        const a = new THREE.Vector3(...inicio);
        const b = new THREE.Vector3(...fim);

        const direcao = b.clone().sub(a);

        const meio = a.clone()
            .add(b)
            .multiplyScalar(0.5);

        const objeto = adicionar(
            new THREE.CylinderGeometry(
                raio, raio, direcao.length(), 8
            ),
            mat,
            grupo,
            meio.x,
            meio.y,
            meio.z
        );

        objeto.quaternion.setFromUnitVectors(
            vetor(0, 1, 0),
            direcao.normalize()
        );

        return objeto;
    }


    // ESTRUTURA SUPERIOR DO CESTO

    function cantos(altura, inferior = false) {

        const largura = inferior ? 0.59 : 0.78;
        const frente = inferior ? -0.78 : -1;
        const traseira = inferior ? 0.65 : 0.79;

        return [
            [-largura, altura, frente],
            [largura, altura, frente],
            [largura, altura, traseira],
            [-largura, altura, traseira]
        ];
    }

    const superior = cantos(1.94);
    const inferior = cantos(1.09, true);

    function interpolar(a, b, t) {
        return a.map((valor, indice) =>
            valor + (b[indice] - valor) * t
        );
    }

    for (let i = 0; i < 4; i++) {

        barra(
            superior[i],
            superior[(i + 1) % 4],
            0.028,
            material.cromado
        );

        barra(
            inferior[i],
            inferior[(i + 1) % 4],
            0.019,
            material.metal
        );

        barra(
            superior[i],
            inferior[i],
            0.022,
            material.metalEscuro
        );
    }


    // GRADES HORIZONTAIS DO CESTO

    for (let t = 0.17; t < 0.98; t += 0.17) {

        const pontos = superior.map((ponto, i) =>
            interpolar(ponto, inferior[i], t)
        );

        for (let i = 0; i < 4; i++) {

            barra(
                pontos[i],
                pontos[(i + 1) % 4],
                0.010
            );
        }
    }


    // GRADES VERTICAIS

    for (let i = 1; i < 13; i++) {

        const t = i / 13;

        barra(
            interpolar(superior[0], superior[1], t),
            interpolar(inferior[0], inferior[1], t),
            0.009
        );

        barra(
            interpolar(superior[3], superior[2], t),
            interpolar(inferior[3], inferior[2], t),
            0.009
        );
    }

    for (let i = 1; i < 17; i++) {

        const t = i / 17;

        barra(
            interpolar(superior[0], superior[3], t),
            interpolar(inferior[0], inferior[3], t),
            0.008
        );

        barra(
            interpolar(superior[1], superior[2], t),
            interpolar(inferior[1], inferior[2], t),
            0.008
        );
    }


    // FUNDO DO CESTO

    caixa(
        1.17, 0.02, 1.37,
        material.metalEscuro,
        0, 1.07, -0.065
    );

    for (let i = 0; i < 10; i++) {

        const x = -0.52 + i * 0.116;

        barra(
            [x, 1.086, -0.75],
            [x, 1.086, 0.61],
            0.006,
            material.cromado
        );
    }


    // CHASSI INFERIOR

    for (const x of [-0.65, 0.65]) {

        barra(
            [x, 0.61, -0.83],
            [x, 0.61, 0.95],
            0.045,
            material.metalEscuro
        );

        barra(
            [x, 0.61, -0.7],
            [x * 0.89, 1.08, -0.7],
            0.04,
            material.cromado
        );

        barra(
            [x, 0.61, 0.75],
            [x * 0.92, 1.95, 0.79],
            0.046,
            material.cromado
        );
    }

    barra(
        [-0.7, 0.61, -0.83],
        [0.7, 0.61, -0.83],
        0.034,
        material.metalEscuro
    );

    barra(
        [-0.7, 0.61, 0.95],
        [0.7, 0.61, 0.95],
        0.034,
        material.metalEscuro
    );


    // CABO PARA EMPURRAR O CARRINHO

    barra(
        [-0.9, 2.07, 0.96],
        [0.9, 2.07, 0.96],
        0.047,
        material.plastico
    );

    barra(
        [-0.88, 2.07, 0.96],
        [-0.75, 1.94, 0.8],
        0.037,
        material.cromado
    );

    barra(
        [0.88, 2.07, 0.96],
        [0.75, 1.94, 0.8],
        0.037,
        material.cromado
    );


    // SUPORTE INFERIOR

    for (let i = 0; i < 7; i++) {

        const x = -0.56 + i * 0.19;

        barra(
            [x, 0.54, -0.75],
            [x, 0.54, 0.55],
            0.013
        );
    }


    // QUATRO RODAS

    for (const x of [-0.67, 0.67]) {

        for (const z of [-0.72, 0.79]) {

            const roda = adicionar(
                new THREE.CylinderGeometry(
                    0.205, 0.205, 0.098, 26
                ),
                material.borracha,
                carrinho,
                x, 0.26, z
            );

            roda.rotation.z = Math.PI / 2;

            const materialCalota = material.cromado.clone();

            materiaisPartes.wheels.push(materialCalota);

            const calota = adicionar(
                new THREE.CylinderGeometry(
                    0.102, 0.102, 0.103, 24
                ),
                materialCalota,
                carrinho,
                x, 0.26, z
            );

            calota.rotation.z = Math.PI / 2;

            barra(
                [x, 0.44, z],
                [x, 0.63, z - 0.08],
                0.025,
                material.cromado
            );
        }
    }


    // PRODUTOS ILUSTRATIVOS DENTRO DO CARRINHO

    caixa(
        0.34, 0.55, 0.37,
        material.caixa,
        -0.35, 1.34, 0.12
    );

    caixa(
        0.3, 0.41, 0.32,
        material.caixaAzul,
        0.25, 1.28, -0.13
    );

    caixa(
        0.22, 0.52, 0.22,
        material.caixaClara,
        0.05, 1.38, 0.32
    );

    adicionar(
        new THREE.CylinderGeometry(
            0.10, 0.11, 0.38, 20
        ),
        new THREE.MeshStandardMaterial({
            color: 0x568d8c
        }),
        carrinho,
        -0.06, 1.32, -0.42
    );


    // SENSORES ULTRASSÔNICOS

    const feixes = [];

    function criarSensor(x, y, z, rotacao) {

        const grupo = new THREE.Group();

        grupo.position.set(x, y, z);
        grupo.rotation.y = rotacao;

        carrinho.add(grupo);

        const placa = material.sensor.clone();

        materiaisPartes.sensors.push(placa);

        caixa(
            0.34, 0.19, 0.065,
            placa,
            0, 0, 0,
            grupo
        );

        // Dois transdutores circulares

        for (const dx of [-0.092, 0.092]) {

            const disco = adicionar(
                new THREE.CylinderGeometry(
                    0.066, 0.066, 0.037, 24
                ),
                material.sensorDisco,
                grupo,
                dx, 0, 0.06
            );

            disco.rotation.x = Math.PI / 2;

            const centro = adicionar(
                new THREE.CylinderGeometry(
                    0.044, 0.044, 0.041, 24
                ),
                material.metalEscuro,
                grupo,
                dx, 0, 0.063
            );

            centro.rotation.x = Math.PI / 2;
        }

        // Área visual ilustrativa do sensor

        const materialFeixe = new THREE.MeshBasicMaterial({
            color: 0x3bb9dc,
            transparent: true,
            opacity: 0.075,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const feixe = adicionar(
            new THREE.CylinderGeometry(
                0.38, 0.045, 0.93, 32, 1, true
            ),
            materialFeixe,
            grupo,
            0, 0, 0.5
        );

        feixe.quaternion.setFromUnitVectors(
            vetor(0, 1, 0),
            vetor(0, 0, 1)
        );

        feixe.castShadow = false;

        feixes.push(feixe);

    }

    // Sensor frontal
    criarSensor(0, 1.49, -1.035, Math.PI);

    // Sensor esquerdo
    criarSensor(-0.79, 1.48, -0.14, -Math.PI / 2);

    // Sensor direito
    criarSensor(0.79, 1.48, -0.14, Math.PI / 2);


    // LUZES DE ALERTA

    for (const x of [-0.4, 0, 0.4]) {

        const luzMaterial = material.luz.clone();

        materiaisPartes.alerts.push(luzMaterial);

        caixa(
            0.13, 0.07, 0.09,
            material.plastico,
            x, 1.02, -1.03
        );

        adicionar(
            new THREE.SphereGeometry(
                0.047, 12, 12
            ),
            luzMaterial,
            carrinho,
            x, 1.02, -1.082
        );
    }


    // TELA DIGITAL ILUSTRATIVA

    caixa(
        0.49, 0.32, 0.065,
        material.plastico,
        0, 2.13, 1.015
    );

    const materialDisplay = material.tela.clone();

    materiaisPartes.screen.push(materialDisplay);

    caixa(
        0.40, 0.23, 0.014,
        materialDisplay,
        0, 2.13, 1.055
    );

    for (let i = 0; i < 3; i++) {

        caixa(
            0.27 - i * 0.044,
            0.014,
            0.019,
            material.telaClara,
            -0.015,
            2.185 - i * 0.047,
            1.071
        );
    }


    // CHÃO

    const chao = adicionar(
        new THREE.PlaneGeometry(300, 300),
        material.chao,
        cena,
        0, 0.01, 0
    );

    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    chao.castShadow = false;


    // CONTROLES DA CÂMERA

    const centro = vetor(0, 1.13, 0);

    let angulo = 2.45;
    let elevacao = 0.36;
    let distanciaCamera = 5.5;

    let anguloDesejado = angulo;
    let elevacaoDesejada = elevacao;
    let distanciaDesejada = distanciaCamera;

    let girar = true;

    const botaoGiro = document.getElementById("spin-toggle");

    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        girar = false;

        if (botaoGiro) {
            botaoGiro.checked = false;
        }
    }

    const angulos = {
        perspective: [2.45, 0.36, 5.5],
        front: [Math.PI, 0.22, 5],
        side: [Math.PI / 2, 0.27, 5.3],
        back: [0, 0.22, 5]
    };


    // BOTÕES DE ÂNGULOS

    document.querySelectorAll("[data-view]").forEach(
        function (botao) {

            botao.addEventListener("click", function () {

                const valores = angulos[botao.dataset.view];

                if (!valores) return;

                [
                    anguloDesejado,
                    elevacaoDesejada,
                    distanciaDesejada
                ] = valores;

                girar = false;

                if (botaoGiro) {
                    botaoGiro.checked = false;
                }

                document.querySelectorAll("[data-view]")
                    .forEach(function (item) {

                        item.classList.toggle(
                            "active",
                            item === botao
                        );

                    });
            });
        }
    );


    // GIRO AUTOMÁTICO

    if (botaoGiro) {

        botaoGiro.addEventListener("change", function () {
            girar = botaoGiro.checked;
        });
    }


    // EXIBIR OU OCULTAR FEIXES

    const botaoFeixes = document.getElementById("beam-toggle");

    if (botaoFeixes) {

        botaoFeixes.addEventListener("change", function () {

            feixes.forEach(function (feixe) {
                feixe.visible = botaoFeixes.checked;
            });

        });
    }


    // DESTAQUE DOS COMPONENTES

    let selecionado = "all";

    const descricoes = {

        all:
            "Modelo digital ilustrativo do carrinho Mercado Acessível.",

        sensors:
            "O carrinho possui três sensores planejados: frontal, esquerdo e direito.",

        alerts:
            "As luzes representam os alertas visuais de proximidade.",

        screen:
            "A tela representa um possível recurso de consulta de informações.",

        wheels:
            "A estrutura e as quatro rodas permitem a movimentação do carrinho."
    };

    document.querySelectorAll("[data-part]").forEach(
        function (botao) {

            botao.addEventListener("click", function () {

                selecionado = botao.dataset.part;

                document.querySelectorAll("[data-part]")
                    .forEach(function (item) {

                        item.classList.toggle(
                            "active",
                            item === botao
                        );

                    });

                const descricao = document.getElementById(
                    "part-description"
                );

                if (descricao) {
                    descricao.textContent =
                        descricoes[selecionado];
                }

                if (selecionado === "sensors") {
                    anguloDesejado = 2.75;
                    elevacaoDesejada = 0.25;
                    girar = false;
                }

                if (selecionado === "alerts") {
                    anguloDesejado = 3.05;
                    elevacaoDesejada = 0.2;
                    girar = false;
                }

                if (selecionado === "screen") {
                    anguloDesejado = 0.22;
                    elevacaoDesejada = 0.5;
                    girar = false;
                }

                if (selecionado === "wheels") {
                    anguloDesejado = 2.4;
                    elevacaoDesejada = 0.05;
                    girar = false;
                }

                if (botaoGiro) {
                    botaoGiro.checked = girar;
                }

            });
        }
    );


    // SIMULAÇÃO DE OBSTÁCULOS

    const controleDistancia = document.getElementById(
        "distance-range"
    );

    const textoDistancia = document.getElementById(
        "distance-label"
    );

    const estadoDistancia = document.getElementById(
        "distance-status"
    );

    let distanciaObstaculo = 120;

    function atualizarDistancia() {

        distanciaObstaculo = Number(
            controleDistancia?.value || 120
        );

        if (textoDistancia) {
            textoDistancia.textContent =
                distanciaObstaculo + " cm";
        }

        if (estadoDistancia) {

            if (distanciaObstaculo < 60) {

                estadoDistancia.textContent =
                    "Alerta simulado: obstáculo próximo!";

                estadoDistancia.style.color = "#bd3125";

            } else if (distanciaObstaculo < 100) {

                estadoDistancia.textContent =
                    "Atenção: objeto se aproximando.";

                estadoDistancia.style.color = "#b66b13";

            } else {

                estadoDistancia.textContent =
                    "Distância simulada: sem alerta.";

                estadoDistancia.style.color = "#26754f";
            }
        }

        feixes.forEach(function (feixe) {

            feixe.scale.y = Math.max(
                0.3,
                distanciaObstaculo / 120
            );

        });
    }

    if (controleDistancia) {

        controleDistancia.addEventListener(
            "input",
            atualizarDistancia
        );
    }

    atualizarDistancia();


    // GIRAR USANDO O MOUSE OU TOQUE

    let arrastando = false;
    let ultimoX = 0;
    let ultimoY = 0;

    const canvas = renderizador.domElement;

    canvas.addEventListener("pointerdown", function (evento) {

        arrastando = true;

        ultimoX = evento.clientX;
        ultimoY = evento.clientY;

        canvas.setPointerCapture(evento.pointerId);

        girar = false;

        if (botaoGiro) {
            botaoGiro.checked = false;
        }
    });

    canvas.addEventListener("pointermove", function (evento) {

        if (!arrastando) return;

        const movimentoX = evento.clientX - ultimoX;
        const movimentoY = evento.clientY - ultimoY;

        ultimoX = evento.clientX;
        ultimoY = evento.clientY;

        anguloDesejado -= movimentoX * 0.008;

        elevacaoDesejada = Math.max(
            -0.12,
            Math.min(
                1.26,
                elevacaoDesejada + movimentoY * 0.006
            )
        );
    });

    canvas.addEventListener("pointerup", function () {
        arrastando = false;
    });

    canvas.addEventListener("pointercancel", function () {
        arrastando = false;
    });


    // ZOOM COM O MOUSE

    canvas.addEventListener("wheel", function (evento) {

        evento.preventDefault();

        distanciaDesejada = Math.max(
            3.1,
            Math.min(
                8.5,
                distanciaDesejada + evento.deltaY * 0.007
            )
        );

        girar = false;

        if (botaoGiro) {
            botaoGiro.checked = false;
        }

    }, { passive: false });


    // CONTROLE PELO TECLADO

    area.addEventListener("keydown", function (evento) {

        if (evento.key === "ArrowLeft") {

            evento.preventDefault();
            anguloDesejado += 0.2;
            girar = false;

        }

        if (evento.key === "ArrowRight") {

            evento.preventDefault();
            anguloDesejado -= 0.2;
            girar = false;

        }

        if (evento.key === "ArrowUp") {

            evento.preventDefault();

            elevacaoDesejada = Math.min(
                1.26,
                elevacaoDesejada + 0.15
            );

            girar = false;
        }

        if (evento.key === "ArrowDown") {

            evento.preventDefault();

            elevacaoDesejada = Math.max(
                -0.12,
                elevacaoDesejada - 0.15
            );

            girar = false;
        }

        if (evento.key === "+" || evento.key === "-") {

            evento.preventDefault();

            distanciaDesejada = Math.max(
                3.1,
                Math.min(
                    8.5,
                    distanciaDesejada +
                    (evento.key === "+" ? -0.35 : 0.35)
                )
            );
        }

        if (botaoGiro) {
            botaoGiro.checked = girar;
        }
    });


    // AJUSTAR TAMANHO DO MODELO

    function redimensionar() {

        const tamanho = area.getBoundingClientRect();

        const largura = Math.max(100, tamanho.width);
        const altura = Math.max(100, tamanho.height);

        camera.aspect = largura / altura;
        camera.updateProjectionMatrix();

        renderizador.setSize(largura, altura, false);
    }

    const observador = new ResizeObserver(redimensionar);

    observador.observe(area);

    redimensionar();


    // ANIMAÇÃO DO CARRINHO

    const relogio = new THREE.Clock();

    let animacao = 0;

    function animar() {

        animacao = requestAnimationFrame(animar);

        const delta = Math.min(0.05, relogio.getDelta());

        if (girar && !arrastando) {
            anguloDesejado += delta * 0.26;
        }

        const suavidade = Math.min(1, delta * 8);

        angulo +=
            (anguloDesejado - angulo) * suavidade;

        elevacao +=
            (elevacaoDesejada - elevacao) * suavidade;

        distanciaCamera +=
            (distanciaDesejada - distanciaCamera) * suavidade;

        camera.position.set(

            centro.x +
            distanciaCamera *
            Math.sin(angulo) *
            Math.cos(elevacao),

            centro.y +
            distanciaCamera *
            Math.sin(elevacao),

            centro.z +
            distanciaCamera *
            Math.cos(angulo) *
            Math.cos(elevacao)
        );

        camera.lookAt(centro);


        // INTENSIDADE DAS LUZES

        let nivelAlerta = 0.05;

        if (distanciaObstaculo < 60) {
            nivelAlerta = 1;
        } else if (distanciaObstaculo < 100) {
            nivelAlerta = 0.55;
        }

        const pulso =
            0.7 + Math.sin(performance.now() * 0.006) * 0.3;

        materiaisPartes.alerts.forEach(function (mat) {

            mat.emissiveIntensity =
                nivelAlerta * (0.8 + pulso * 1.4) +
                (selecionado === "alerts" ? 0.7 : 0);
        });


        // DESTACAR SENSORES

        materiaisPartes.sensors.forEach(function (mat) {

            mat.emissive.setHex(
                selecionado === "sensors"
                    ? 0x0b415b
                    : 0
            );

            mat.emissiveIntensity = 0.55;
        });


        // DESTACAR TELA

        materiaisPartes.screen.forEach(function (mat) {

            mat.emissiveIntensity =
                selecionado === "screen" ? 1.5 : 0.45;
        });


        // DESTACAR RODAS

        materiaisPartes.wheels.forEach(function (mat) {

            mat.emissive.setHex(
                selecionado === "wheels"
                    ? 0x334c58
                    : 0
            );
        });

        renderizador.render(cena, camera);
    }

    animar();


    // ECONOMIZAR RECURSOS QUANDO A ABA NÃO ESTÁ VISÍVEL

    document.addEventListener(
        "visibilitychange",
        function () {

            if (document.hidden) {

                cancelAnimationFrame(animacao);
                relogio.stop();

            } else {

                relogio.start();
                animar();
            }
        }
    );

}
