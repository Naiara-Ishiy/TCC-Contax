// This file serves as the entry point for the JavaScript functionality of the application.
// It initializes the application, sets up event listeners, and manages the tab navigation between the ME and MEI categories.

import { renderCaixa } from './components/me/caixa.js';
import { renderDespesas } from './components/me/despesas.js';
import { renderFaturamento } from './components/me/faturamento.js';
import { renderImposto } from './components/me/imposto.js';
import { renderNotasFiscaisEmitidas } from './components/me/notas-fiscais-emitidas.js';
import { renderImpostoDAS } from './components/mei/imposto-das.js';
import { renderNotasEmitidas } from './components/mei/notas-emitidas.js';
import { renderControleMensal } from './components/mei/controle-mensal.js';

const tabs = {
    me: {
        caixa: renderCaixa,
        despesas: renderDespesas,
        faturamento: renderFaturamento,
        imposto: renderImposto,
        notasFiscaisEmitidas: renderNotasFiscaisEmitidas,
    },
    mei: {
        impostoDAS: renderImpostoDAS,
        notasEmitidas: renderNotasEmitidas,
        controleMensal: renderControleMensal,
    }
};

function init() {
    const navTabs = document.querySelectorAll('.tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            const category = event.target.dataset.category;
            const tabName = event.target.dataset.tab;

            // Hide all tabs
            document.querySelectorAll('.cards').forEach(section => section.classList.add('hide'));

            // Show the selected tab
            if (category && tabName) {
                document.getElementById(`tab-${tabName}`).classList.remove('hide');
                tabs[category][tabName]();
            }
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);