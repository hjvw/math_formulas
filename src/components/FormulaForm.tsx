import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import type { Category, NewFormulaData } from '../App';


interface FormulaFormProps {
  categories: Category[];
  onAddFormula: (formulaData: NewFormulaData) => void;
}

const FormulaForm: React.FC<FormulaFormProps> = ({ categories, onAddFormula }) => {
  const [latexInput, setLatexInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [selectedCatId, setSelectedCatId] = useState<string>(''); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!latexInput.trim() || !selectedCatId) {
      alert("Wpisz wzór i wybierz kategorię!");
      return;
    }

    const newFormula: NewFormulaData = {
        latex: latexInput,
        description: descInput,
        categoryId: parseInt(selectedCatId)
    };

    onAddFormula(newFormula);

   
    setLatexInput('');
    setDescInput('');
    setSelectedCatId('');
  };

  return (
    <div className="card">
      <h3>Dodaj Wzór</h3>
      <form onSubmit={handleSubmit} className="formula-form">
        <label>Kategoria:</label>
        <select 
          value={selectedCatId} 
          onChange={(e) => setSelectedCatId(e.target.value)}
        >
          <option value="">-- Wybierz kategorię --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <label>Opis (opcjonalnie):</label>
        <input 
          type="text" 
          placeholder="Np. Wzór na pole koła"
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
        />

        <label>Kod LaTeX:</label>
        <textarea 
          rows={3}
          placeholder="\pi r^2"
          value={latexInput}
          onChange={(e) => setLatexInput(e.target.value)}
        ></textarea>

        <div className="preview-box">
          <small>Podgląd:</small>
          {latexInput ? (
            <BlockMath math={latexInput} errorColor={'#cc0000'} />
          ) : (
            <div className="placeholder">Tu pojawi się wzór...</div>
          )}
        </div>

        <button type="submit" className="btn-primary">Zapisz Wzór</button>
      </form>
    </div>
  );
};

export default FormulaForm;