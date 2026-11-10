import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getMyChildren } from '@/services/api';
import type { GuardianStudentWithDetails } from '@/types';
import { StudentCard } from '@/components/StudentCard/StudentCard';

export function DashboardPage() {
  const { user, token } = useAuth();

  const [links, setLinks] =
    useState<GuardianStudentWithDetails[] | null>(null);

  // Загрузка детей
  useEffect(() => {
    if (!user) {
  return;
}

const userId = user.id;

let cancelled = false;

async function loadChildren() {
  try {
    const result = await getMyChildren(userId, token);

        if (!cancelled) {
          setLinks(result);
        }
      } catch (error) {
        console.error('Failed to load children:', error);

        if (!cancelled) {
          setLinks([]);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  // Обработка удаления ребёнка
  useEffect(() => {
    function handleDeleted(event: Event) {
      const customEvent = event as CustomEvent<string>;
      const deletedId = customEvent.detail;

      setLinks((currentLinks) => {
        if (!currentLinks) {
          return currentLinks;
        }

        return currentLinks.filter(
          (link) => link.id !== deletedId,
        );
      });
    }

    window.addEventListener(
      'guardian-student-deleted',
      handleDeleted,
    );

    return () => {
      window.removeEventListener(
        'guardian-student-deleted',
        handleDeleted,
      );
    };
  }, []);

  return (
    <main className="page">
      <div className="page__header">
        <div>
          <h1 className="page__greeting">
            Здравствуйте, {user?.fullName.split(' ')[0]}
          </h1>

          <p className="page__subtitle">
            Дети, связанные с вашей учётной записью
          </p>
        </div>

        <Link
          to="/add-child"
          className="btn-primary"
        >
          + Добавить ребёнка
        </Link>
      </div>

      {links === null && (
        <p className="page__subtitle">
          Загрузка…
        </p>
      )}

      {links && links.length === 0 && (
        <div className="empty-state">
          Пока нет детей, привязанных к вашей учётной записи.
          <br />
          Добавьте ребёнка, чтобы отправить заявку на подтверждение.
        </div>
      )}

      {links && links.length > 0 && (
        <div className="student-list">
          {links.map((link) => (
            <StudentCard
              key={link.id}
              link={link}
            />
          ))}
        </div>
      )}
    </main>
  );
}