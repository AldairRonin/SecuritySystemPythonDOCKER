import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { searchStudents } from '@/services/api/studentService';
import type { Student } from '@/types';

export function AddChildPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !className.trim()) {
      setError('Введите ФИО и класс.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStudents([]);

      const results = await searchStudents(
        fullName.trim(),
        className.trim(),
        token
      );

      if (results.length === 0) {
        setError('Ученик не найден.');
      }

      setStudents(results);
    } catch (err) {
      console.error(err);
      setError('Не удалось выполнить поиск.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectStudent(student: Student) {
    navigate(`/students/${student.id}/add`);
  }

  return (
    <main className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Добавить ребёнка</h1>
          <p className="page__subtitle">
            Найдите ученика по ФИО и классу.
          </p>
        </div>

        <Link to="/dashboard" className="btn-secondary">
          Назад
        </Link>
      </div>

      <section className="add-child-form">
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="fullName">ФИО</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Например, Adilkhan Aldiar"
            />
          </div>

          <div className="form-group">
            <label htmlFor="className">Класс</label>
            <input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Например, 10A"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Поиск…' : 'Найти'}
          </button>
        </form>
      </section>

      {students.length > 0 && (
        <section className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2>Найденные ученики</h2>
              <p>Выберите своего ребёнка.</p>
            </div>

            <span className="admin-section__count">
              {students.length}
            </span>
          </div>

          <div className="admin-requests">
            {students.map((student) => (
              <article
                key={student.id}
                className="admin-request-card"
              >
                <div className="admin-request-card__header">
                  <div>
                    <h3>{student.fullName}</h3>
                    <p className="admin-request-card__class">
                      {student.className}
                    </p>
                  </div>
                </div>

                <div className="admin-request-card__actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleSelectStudent(student)}
                  >
                    Это мой ребёнок
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}