import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createGuardianStudent } from '@/services/api/guardianService';

const relationships = [
  { value: 'FATHER', label: 'Отец' },
  { value: 'MOTHER', label: 'Мать' },
  { value: 'GRANDFATHER', label: 'Дедушка' },
  { value: 'GRANDMOTHER', label: 'Бабушка' },
  { value: 'GUARDIAN', label: 'Опекун' },
] as const;

export function AddChildRelationshipPage() {
  const { studentId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!studentId) {
    return <Navigate to="/add-child" replace />;
  }

  async function handleSubmit() {
  if (!studentId) {
    setError('Ученик не выбран.');
    return;
  }

  if (!relationship) {
    setError('Выберите, кем вы приходитесь ребёнку.');
    return;
  }

  try {
      setLoading(true);
      setError(null);

      await createGuardianStudent(
        studentId,
        relationship as 'FATHER' | 'MOTHER' | 'GRANDFATHER' | 'GRANDMOTHER' | 'GUARDIAN',
        token
      );

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Не удалось отправить заявку.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Добавить ребёнка</h1>
          <p className="page__subtitle">
            Укажите, кем вы приходитесь ребёнку.
          </p>
        </div>

        <Link to="/add-child" className="btn-secondary">
          Назад
        </Link>
      </div>

      <section className="add-child-form">
        <div className="relationship-list">
          {relationships.map((item) => (
            <label
              key={item.value}
              className={`relationship-option ${
                relationship === item.value
                  ? 'relationship-option--selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="relationship"
                value={item.value}
                checked={relationship === item.value}
                onChange={(e) => setRelationship(e.target.value)}
              />

              <span>{item.label}</span>
            </label>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Отправка…' : 'Отправить заявку'}
        </button>
      </section>
    </main>
  );
}