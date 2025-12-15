import './bootstrap';
import './settings.js';

import Alpine from 'alpinejs';
import { Sortable } from 'sortablejs';
import { jsPlumb } from 'jsplumb';

window.Alpine = Alpine;

// Implementação da Revisão
// Registra o componente para gerenciar a UI dos Flashcards baseados no ReviewController
document.addEventListener('alpine:init', () => {
    Alpine.data('reviewSession', () => ({
        showAnswer: false,

        // Inicialização
        init() {
            // Foca no container para capturar eventos de teclado se necessário
            this.$el.focus();
        },

        // Ação para revelar a resposta do cartão
        reveal() {
            this.showAnswer = true;
        },

        // Submete o formulário baseado no valor do status
        submitReview(statusValue) {
            // Procura um botão dentro do componente que tenha o valor correspondente
            // Ex: <button name="status" value="easy">
            const button = this.$el.querySelector(`button[name="status"][value="${statusValue}"]`);
            
            if (button) {
                button.click(); // Simula o clique para enviar o formulário
            } else {
                console.warn(`Botão para o status '${statusValue}' não encontrado.`);
            }
        },

        // Gerenciamento de atalhos de teclado
        handleKeydown(event) {
            // Ignora se o usuário estiver digitando em um input/textarea
            if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;

            // 1. Revelar Resposta (Espaço)
            if (!this.showAnswer && (event.code === 'Space' || event.key === ' ')) {
                event.preventDefault(); // Previne o scroll da página
                this.reveal();
                return;
            }

            // 2. Submeter Revisão (Teclas 1, 2, 3, 4) - APENAS se a resposta estiver visível
            if (this.showAnswer) {
                switch (event.key) {
                    case '1':
                        this.submitReview('again');
                        break;
                    case '2':
                        this.submitReview('hard');
                        break;
                    case '3':
                        this.submitReview('good');
                        break;
                    case '4':
                        this.submitReview('easy');
                        break;
                }
            }
        }
    }));
});


Alpine.start();

window.Sortable = Sortable;

document.addEventListener('DOMContentLoaded', () => {
    const paletteId = 'palette-source';
    const canvasId = 'diagram-canvas';
    const canvasElement = document.getElementById(canvasId);

    if (canvasElement) {
        initializeDiagramGame(paletteId, canvasElement);
    }
});

function initializeDiagramGame(paletteId, canvasElement) {
    let selectedConnection = null;
    let selectedNode = null;

    // Cria uma nova instância do JsPlumb para o canvas
    const jsPlumbInstance = jsPlumb.getInstance({ 
        container: canvasElement,
        defaults: {
            endpoint: ["Dot", { radius: 5 }],
            connector: ["Flowchart"],
            anchor: "Continuous",
            paintStyle: { strokeWidth: 2, stroke: "#66CCFF" },
            hoverPaintStyle: { strokeWidth: 4, stroke: "#34D399" }
        }
    });

    // Inicializar Sortable (Paleta de Peças)
    new Sortable(document.getElementById(paletteId), {
        group: {
            name: 'diagram-elements',
            pull: 'clone', 
            put: false 
        },
        sort: false, 
        animation: 150,
    });

    // Inicializar Sortable (Área de Montagem - Canvas)
    new Sortable(canvasElement, {
        group: 'diagram-elements',
        sort: true,
        onAdd: function (evt) {
            const item = evt.item;
            
            const x = evt.originalEvent.clientX;
            const y = evt.originalEvent.clientY;
            const canvasRect = canvasElement.getBoundingClientRect();
            
            item.style.left = (x - canvasRect.left - 50) + 'px'; 
            item.style.top = (y - canvasRect.top - 20) + 'px'; 

            item.classList.remove('cursor-grab');
            item.classList.add('absolute'); 
            
            if (!item.id) {
                item.id = 'node-' + Date.now();
            }

            // Torna a peça arrastável no canvas
            jsPlumbInstance.draggable(item, {
                containment: true 
            });

            item.addEventListener('click', (e) => {
                // Desseleciona a conexão (se houver)
                if (selectedConnection) {
                    selectedConnection.removeClass("selected-connection");
                    selectedConnection = null;
                }
                
                // Desseleciona o nó anterior (se houver)
                if (selectedNode && selectedNode !== item) {
                    selectedNode.classList.remove("selected-node");
                }
                
                // Seleciona/Alterna a seleção do nó atual
                if (selectedNode === item) {
                    selectedNode.classList.remove("selected-node");
                    selectedNode = null;
                } else {
                    selectedNode = item;
                    selectedNode.classList.add("selected-node");
                }

                e.stopPropagation(); 
            });
            
            jsPlumbInstance.addEndpoint(item, { 
                isSource: true, 
                isTarget: true,
                maxConnections: -1, 
                detachable: true
            });
        },
    });

    jsPlumbInstance.bind("connection", (info) => {
        const connection = info.connection;

        // Adiciona um listener de clique somente na linha (conector)
        connection.bind("click", (conn, originalEvent) => {
            if (selectedConnection) {
                selectedConnection.removeClass("selected-connection");
            }
            
            selectedConnection = conn;
            selectedConnection.addClass("selected-connection");
            originalEvent.stopPropagation(); 
        });
    });

    // Listener para desselecionar ao clicar no canvas
    canvasElement.addEventListener('click', (e) => {
        if (selectedConnection && !e.target.closest('.jtk-connector') && !e.target.closest('.jtk-endpoint')) {
            selectedConnection.removeClass("selected-connection");
            selectedConnection = null;
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.key === "Backspace" || e.key === "Delete" || e.code === "Delete")) {
            
            if (selectedConnection) {
                e.preventDefault(); 
                jsPlumbInstance.deleteConnection(selectedConnection);
                selectedConnection = null;
            } 
            else if (selectedNode) { 
                e.preventDefault(); 
                
                jsPlumbInstance.remove(selectedNode); 
                
                selectedNode = null;
            }
        }
    });

    // Lógica de Verificação
    document.getElementById('check-solution').addEventListener('click', () => {
        const result = checkDiagramSolution(jsPlumbInstance, canvasElement); 
        
        alert(result.message);
    });
}

function checkDiagramSolution(jsPlumbInstance, canvasElement) {
    // Topologia Correta: Pares [Entidade, Associação]. A ordem dentro do par não importa.
    const CORRECT_CONNECTIONS = [
        ['Classe: Aluno', 'Associação N:M (Matrícula)'],
        ['Classe: Curso', 'Associação N:M (Matrícula)']
    ];

    // Verificação de Peças Incorretas
    const allNodes = canvasElement.querySelectorAll('.diagram-node');
    let hasWrongNode = false;
    allNodes.forEach(node => {
        if (node.textContent.trim().includes("Peça Errada")) {
            hasWrongNode = true;
        }
    });
    if (hasWrongNode) {
        return { isCorrect: false, message: "O diagrama contém a peça incorreta. Remova-a antes de verificar." };
    }

    // Verificação do Número de Conexões 
    const currentConnections = jsPlumbInstance.getConnections();
    
    if (currentConnections.length !== CORRECT_CONNECTIONS.length) {
        return { isCorrect: false, message: `Número de conexões incorreto. Encontrado: ${currentConnections.length}, Esperado: ${CORRECT_CONNECTIONS.length}.` };
    }

    // Normalizar e Comparar a Topologia 
    
    // Normaliza as respostas atuais do aluno
    const actualConnections = currentConnections.map(conn => {
        const sourceText = conn.source.textContent.trim();
        const targetText = conn.target.textContent.trim();
        // Ordena e junta para comparação (Aluno|Associação)
        return [sourceText, targetText].sort().join('|'); 
    });

    // Normaliza as respostas corretas
    const normalizedCorrect = CORRECT_CONNECTIONS.map(pair => pair.sort().join('|'));
    
    // Compara se os arrays normalizados são iguais (independentemente da ordem em que foram criados)
    const actualSorted = actualConnections.sort().join(',');
    const correctSorted = normalizedCorrect.sort().join(',');

    if (actualSorted === correctSorted) {
        return { isCorrect: true, message: "Parabéns! O diagrama está correto. Excelente trabalho!" };
    } else {
        return { isCorrect: false, message: "O diagrama está incorreto. As entidades principais não estão conectadas à associação N:M corretamente." };
    }
}


// --- Lógica de Interação do Modo Escuro (CORRIGIDA E SIMPLIFICADA) ---
document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;
    const toggleButton = document.getElementById('theme-toggle');
    // Ícones não são mais manipulados diretamente aqui; o Tailwind faz isso.

    // 2. Lógica de Alternância (No Clique)
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            let newTheme;
            let settings = {};
            const stored = localStorage.getItem('softlearn.settings');
            
            // Tenta carregar as configurações existentes
            if (stored) {
                try {
                    settings = JSON.parse(stored);
                } catch (e) {
                    console.error("Erro ao parsear settings:", e);
                }
            }

            // Alternar a classe 'dark' no <html>
            if (htmlElement.classList.contains('dark')) {
                // Se estava Dark, vai para Light
                htmlElement.classList.remove('dark');
                newTheme = 'light';
            } else {
                // Se estava Light, vai para Dark
                htmlElement.classList.add('dark');
                newTheme = 'dark';
            }
            
            // Salva o novo tema na estrutura de settings que você já usa
            settings.theme = newTheme;
            localStorage.setItem('softlearn.settings', JSON.stringify(settings));
        });
    }
});
// --- Fim da Lógica de Modo Escuro ---