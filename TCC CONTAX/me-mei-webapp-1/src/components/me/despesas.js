import React, { useState } from 'react';

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  const handleAddDespesa = (e) => {
    e.preventDefault();
    if (descricao && valor) {
      setDespesas([...despesas, { descricao, valor: parseFloat(valor) }]);
      setDescricao('');
      setValor('');
    }
  };

  return (
    <div>
      <h3>Despesas</h3>
      <form onSubmit={handleAddDespesa}>
        <div>
          <label htmlFor="descricao">Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="valor">Valor (R$):</label>
          <input
            type="number"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <button type="submit">Adicionar Despesa</button>
      </form>
      <h4>Lista de Despesas</h4>
      <ul>
        {despesas.map((despesa, index) => (
          <li key={index}>
            {despesa.descricao}: R$ {despesa.valor.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Despesas;