import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import './App.css';

import CategoryManager from './components/CategoryManager';
import FormulaForm from './components/FormulaForm';
import FormulaList from './components/FormulaList';

export interface Category { id: number; name: string; }
export interface Formula { 
  id: number; 
  latex: string; 
  description: string; 
  categoryId: number; 
  createdAt: string; 
}
export interface NewFormulaData extends Omit<Formula, 'id' | 'createdAt'> {}

const API_URL = "http://localhost:4000";

const App: React.FC = () => {

  const [categories, setCategories] = useState<Category[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // POBIERANIE DANYCH Z JSON-SERVER
  // -------------------------------
  const loadData = async () => {
    try {
      setLoading(true);

      const [catRes, formRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/formulas`)
      ]);

      if (!catRes.ok || !formRes.ok) {
        throw new Error("Błąd pobierania danych z API");
      }

      const categoriesData: Category[] = await catRes.json();
      const formulasData: Formula[] = await formRes.json();

      setCategories(categoriesData);
      setFormulas(formulasData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------
  // DODAWANIE KATEGORII
  // -------------------------------
  const handleAddCategory = async (name: string) => {
    if (!name.trim()) return;

    const newCat: Category = { id: Date.now(), name };

    await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat)
    });

    setCategories(prev => [...prev, newCat]);
  };

  // -------------------------------
  // USUWANIE KATEGORII (z API)
  // -------------------------------
  const handleDeleteCategory = async (id: number) => {
    if (formulas.some(f => f.categoryId === id)) {
      alert("Ta kategoria ma przypisane wzory – nie można jej usunąć.");
      return;
    }

    await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE"
    });

    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // -------------------------------
  // DODAWANIE WZORU DO JSON (POST)
  // -------------------------------
  const handleAddFormula = async (data: NewFormulaData) => {
    if (!data.latex.trim()) return;

    const newFormula: Formula = {
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
      ...data
    };

    await fetch(`${API_URL}/formulas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFormula)
    });

    // Dodaj w locie do interfejsu
    setFormulas(prev => [newFormula, ...prev]);
  };

  // -------------------------------
  // USUWANIE WZORU Z JSON (DELETE)
  // -------------------------------
  const handleDeleteFormula = async (id: number) => {
    await fetch(`${API_URL}/formulas/${id}`, {
      method: "DELETE"
    });

    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  if (loading) return <p style={{ textAlign: "center" }}>Ładowanie danych...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>Błąd: {error}</p>;

  return (
    <div className="container">
      <header className="header">
        <h1>📐 Math Notes</h1>
        <p>Twoja baza wzorów LaTeX</p>
      </header>

      <div className="main-grid">

        <section className="panel input-panel">
          <CategoryManager 
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />

          <FormulaForm 
            categories={categories}
            onAddFormula={handleAddFormula}
          />
        </section>

        <section>
          <FormulaList 
            formulas={formulas}
            categories={categories}
            onDeleteFormula={handleDeleteFormula}
          />
        </section>

      </div>

    </div>
  );
};

export default App;
