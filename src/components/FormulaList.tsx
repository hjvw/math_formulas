import React, { useState, useMemo } from 'react';
import { BlockMath } from 'react-katex';
import type { Formula, Category } from '../App';

interface FormulaListProps {
  formulas: Formula[];
  categories: Category[];
  onDeleteFormula: (id: number) => void;
}

const FormulaList: React.FC<FormulaListProps> = ({ formulas, categories, onDeleteFormula }) => {
  const [selectedCategory, setSelectedCategory] = useState<number>(0); 
  const [searchTerm, setSearchTerm] = useState('');
  

  const filteredFormulas = useMemo(() => {
    let result = formulas;

   
    if (selectedCategory > 0) {
      result = result.filter(f => f.categoryId === selectedCategory);
    }

 
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(f => 
        f.description.toLowerCase().includes(lowerSearchTerm) ||
        f.latex.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return result;
  }, [formulas, selectedCategory, searchTerm]); 

  const getCategoryName = (id: number): string => {
    return categories.find(c => c.id === id)?.name || 'Nieznana Kategoria';
  };

  return (
    <div className="formula-list-container">
      <h2>Lista Wzorów ({formulas.length} znalezionych)</h2>
      
      {}
      <div className="panel" style={{marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
        <div className="form-group" style={{flexGrow: 1, marginBottom: 0}}>
          <label htmlFor="searchFormula">Wyszukaj (Opis/LaTeX):</label>
          <input
            id="searchFormula"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Wpisz słowo kluczowe lub symbol LaTeX"
          />
        </div>
        
        <div className="form-group" style={{width: '200px', marginBottom: 0}}>
          <label htmlFor="filterCategory">Filtruj wg kategorii:</label>
          <select
            id="filterCategory"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
          >
            <option value={0}>Wszystkie ({formulas.length})</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({formulas.filter(f => f.categoryId === cat.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>


      {}
      <ul className="formula-list">
        {filteredFormulas.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '50px', color: '#7f8c8d'}}>Brak wzorów spełniających kryteria.</p>
        ) : (
            filteredFormulas.map(formula => (
                <li key={formula.id} className="formula-card">
                    <h3>{formula.description}</h3>
                    
                    <div className="formula-latex-display">
                        {}
                        <BlockMath math={formula.latex} errorColor={"#e74c3c"} />
                    </div>

                    <p style={{fontSize: '0.9em', color: '#7f8c8d', marginBottom: '5px'}}>
                      Kategoria: <strong>{getCategoryName(formula.categoryId)}</strong>
                    </p>
                    <p style={{fontSize: '0.8em', color: '#bdc3c7'}}>
                      Dodano: {formula.createdAt} | ID: {formula.id}
                    </p>

                    <div className="formula-actions">
                        <button 
                            onClick={() => onDeleteFormula(formula.id)} 
                            className="btn-delete"
                            style={{ padding: '8px 12px' }}
                        >
                            Usuń Wzór
                        </button>
                    </div>
                </li>
            ))
        )}
      </ul>
    </div>
  );
};

export default FormulaList;