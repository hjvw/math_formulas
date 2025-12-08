import React, { useState } from 'react';
import type { Category } from '../App'; 

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: number) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName);
      setNewCategoryName('');
    }
  };

  return (
    <div className="category-manager">
      <h2>Zarządzanie Kategoriami</h2>
      
      {}
      <ul className="category-list">
        {categories.map(category => (
          <li key={category.id} className="category-item">
            <span>{category.name} ({category.id})</span>
            <button 
              onClick={() => onDeleteCategory(category.id)}
              className="btn-delete"
              style={{ padding: '5px 10px', fontSize: '0.8rem' }}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>

      {}
      <form onSubmit={handleSubmit} style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
        <div className="form-group">
          <label htmlFor="newCategory">Nowa kategoria:</label>
          <input
            id="newCategory"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Wprowadź nazwę kategorii"
          />
        </div>
        <button type="submit" className="btn-add-category">
          Dodaj Kategorię
        </button>
      </form>
    </div>
  );
};

export default CategoryManager;