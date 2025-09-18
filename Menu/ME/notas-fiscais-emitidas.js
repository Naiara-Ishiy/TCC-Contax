import React from 'react';

const NotasFiscaisEmitidas = () => {
  return (
    <div>
      <h2>Notas Fiscais Emitidas</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Empresa</th>
            <th>Descrição</th>
            <th>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          {/* Renderizar as notas fiscais emitidas aqui */}
        </tbody>
      </table>
    </div>
  );
};

export default NotasFiscaisEmitidas;